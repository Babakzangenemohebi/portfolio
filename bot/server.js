/**
 * Optional webhook mode (only if you ever want instant delivery from your own host).
 * The default, fully serverless runtime is poll.js — used by .github/workflows/bot.yml.
 *
 *   GET  /          health page
 *   POST /webhook   Telegram updates (checked with X-Telegram-Bot-Api-Secret-Token)
 *
 * Env: BOT_TOKEN, SECRET, PORT
 */
import http from "node:http";
import { handleUpdate } from "./handlers.js";

const SECRET = process.env.SECRET || "";
const PORT = process.env.PORT || 3000;

if (!process.env.BOT_TOKEN) {
  console.error("BOT_TOKEN is required");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end('<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;background:#06070a;color:#eef1f6;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h2>bot ok ✅</h2><a href="https://t.me/B4backPortfoliobot" style="color:#ff6b35">t.me/B4backPortfoliobot</a></div></body>');
    return;
  }

  if (req.method === "POST" && url.pathname === "/webhook") {
    if (SECRET && req.headers["x-telegram-bot-api-secret-token"] !== SECRET) {
      res.writeHead(401).end("unauthorized");
      return;
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
      try {
        handleUpdate(JSON.parse(body)).catch((e) => console.error(e.message));
      } catch (e) {
        console.error("bad update:", e.message);
      }
    });
    return;
  }

  res.writeHead(404).end("not found");
});

server.listen(PORT, "0.0.0.0", () => console.log(`webhook mode on ${PORT}`));
