const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');
const apiDir = path.join(__dirname, '../public/api');

// Make sure public/api exists
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

if (fs.existsSync(dbPath)) {
  try {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbContent);

    // Write collections as extensionless static files in public/api
    fs.writeFileSync(path.join(apiDir, 'projects'), JSON.stringify(db.projects || [], null, 2));
    fs.writeFileSync(path.join(apiDir, 'categories'), JSON.stringify(db.categories || [], null, 2));
    fs.writeFileSync(path.join(apiDir, 'settings'), JSON.stringify(db.settings || {}, null, 2));
    fs.writeFileSync(path.join(apiDir, 'timeline'), JSON.stringify(db.timeline || [], null, 2));
    
    console.log('Successfully exported db.json collections to public/api/ for static build.');
  } catch (err) {
    console.error('Error parsing or writing database collections:', err);
  }
} else {
  console.error('db.json not found! Cannot export static API resources.');
}
