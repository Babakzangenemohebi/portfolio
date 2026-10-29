/**
 * Serverless bot runtime — long polling, no server, no webhook.
 *
 * Runs inside GitHub Actions on a schedule: it long-polls Telegram for
 * `POLL_MINUTES` minutes, answers every update instantly, then exits.
 * The next scheduled run picks up where it left off (offset is restored
 * from the Actions cache), so there is never a "host" to maintain.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { api, handleUpdate } from "./handlers.js";

const here = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(here, ".state");
const STATE_FILE = join(STATE_DIR, "offset");

const MAX_MS = Number(process.env.POLL_MINUTES || 9) * 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readOffset() {
  try {
    const v = parseInt(readFileSync(STATE_FILE, "utf8"), 10);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

function writeOffset(v) {
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(STATE_FILE, String(v));
  } catch (e) {
    console.error("state write failed:", e.message);
  }
}

if (!process.env.BOT_TOKEN) {
  console.error("BOT_TOKEN secret is missing — add it in Settings → Secrets → Actions.");
  process.exit(1);
}

const started = Date.now();
let offset = readOffset();
let handled = 0;

console.log(`bot runtime up · offset=${offset} · ${MAX_MS / 60000}min window`);

while (Date.now() - started < MAX_MS) {
  let res;
  try {
    res = await api("getUpdates", { offset, timeout: 50, allowed_updates: ["message"] }, 70000);
  } catch (e) {
    console.error("poll error:", e.message);
    await sleep(3000);
    continue;
  }

  if (!res.ok) {
    console.error("getUpdates failed:", res.description || res.error_code);
    await sleep(4000);
    continue;
  }

  for (const update of res.result || []) {
    offset = update.update_id + 1;
    writeOffset(offset);
    try {
      await handleUpdate(update);
      handled++;
    } catch (e) {
      console.error("handler failed:", e.message);
    }
  }
}

console.log(`window closed · handled=${handled} · next offset=${offset}`);
