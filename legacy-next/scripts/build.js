const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '../db.json');
const apiDir = path.join(__dirname, '../public/api');
const srcApiDir = path.join(__dirname, '../src/app/api');
const backupApiDir = path.join(__dirname, '../src/api-backup');

// Step 1: Export db.json to public/api
console.log('Step 1: Exporting db.json collections to public/api...');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

if (fs.existsSync(dbPath)) {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    fs.writeFileSync(path.join(apiDir, 'projects'), JSON.stringify(db.projects || [], null, 2));
    fs.writeFileSync(path.join(apiDir, 'categories'), JSON.stringify(db.categories || [], null, 2));
    fs.writeFileSync(path.join(apiDir, 'settings'), JSON.stringify(db.settings || {}, null, 2));
    fs.writeFileSync(path.join(apiDir, 'timeline'), JSON.stringify(db.timeline || [], null, 2));
    console.log('Successfully exported database to public/api/');
  } catch (err) {
    console.error('Error exporting database collections:', err);
  }
} else {
  console.warn('Warning: db.json not found.');
}

// Step 2: Backup src/app/api by renaming it
let apiMoved = false;
if (fs.existsSync(srcApiDir)) {
  console.log('Step 2: Temporarily moving src/app/api out of compilation path...');
  try {
    // Clear Next.js compiler cache to avoid stale validator/type check files referring to api routes
    const nextCacheDir = path.join(__dirname, '../.next');
    if (fs.existsSync(nextCacheDir)) {
      console.log('Clearing Next.js compiler cache (.next)...');
      fs.rmSync(nextCacheDir, { recursive: true, force: true });
    }
    fs.renameSync(srcApiDir, backupApiDir);
    apiMoved = true;
  } catch (err) {
    console.error('Failed to move src/app/api:', err);
  }
}

try {
  // Step 3: Run next build
  console.log('Step 3: Compiling production build...');
  execSync('npx next build', { stdio: 'inherit', shell: true });
  console.log('Build completed successfully.');

  // Create .nojekyll file in out directory to bypass GitHub Pages Jekyll processing
  const outDir = path.join(__dirname, '../out');
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    console.log('Successfully created out/.nojekyll to bypass Jekyll on GitHub Pages.');
  }
} catch (error) {
  console.error('Build failed.');
  process.exitCode = 1;
} finally {
  // Step 4: Restore src/app/api
  if (apiMoved && fs.existsSync(backupApiDir)) {
    console.log('Step 4: Restoring src/app/api...');
    try {
      fs.renameSync(backupApiDir, srcApiDir);
      console.log('Successfully restored src/app/api.');
    } catch (err) {
      console.error('CRITICAL: Failed to restore src/app/api. Please restore it manually from src/api-backup', err);
    }
  }
}
