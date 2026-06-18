#!/usr/bin/env node
/**
 * Stores Cursor Usage extension cookie in VS Code SecretStorage (state.vscdb).
 * Usage: node set-cursor-usage-cookie.js "<cookie-value>"
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cookie = process.argv[2];
if (!cookie) {
  console.error('Usage: node set-cursor-usage-cookie.js "<WorkosCursorSessionToken value>"');
  process.exit(1);
}

const dbPath = path.join(
  process.env.HOME,
  'Library/Application Support/Cursor/User/globalStorage/state.vscdb',
);
const secretKey = JSON.stringify({ extensionId: 'yossisa.cursor-usage', key: 'cursor.cookie' });
const storageKey = `secret://${secretKey}`;

const electronPath = '/Applications/Cursor.app/Contents/MacOS/Electron';
const script = `
const { app, safeStorage } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

app.whenReady().then(() => {
  const dbPath = ${JSON.stringify(dbPath)};
  const storageKey = ${JSON.stringify(storageKey)};
  const cookie = ${JSON.stringify(cookie)};

  if (!safeStorage.isEncryptionAvailable()) {
    console.error('Encryption not available');
    app.exit(1);
    return;
  }

  const encrypted = safeStorage.encryptString(cookie);
  const db = new Database(dbPath);
  db.prepare('INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)').run(
    storageKey,
    encrypted,
  );
  db.close();
  console.log('Cookie saved successfully for Cursor Usage extension.');
  app.exit(0);
});
`;

const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cursor-cookie-'));
const scriptPath = path.join(tmpDir, 'store-cookie.js');

try {
  execSync('npm install better-sqlite3 --no-save', { cwd: tmpDir, stdio: 'ignore' });
} catch {
  // fallback: use sqlite3 CLI
  console.log('Using sqlite3 CLI fallback...');
  const b64 = execSync(
    `${electronPath} -e "const {app,safeStorage}=require('electron');app.whenReady().then(()=>{process.stdout.write(safeStorage.encryptString(process.argv[1]).toString('base64'));app.exit(0);})" "${cookie.replace(/"/g, '\\"')}"`,
    { encoding: 'utf8' },
  ).trim();
  const hex = Buffer.from(b64, 'base64').toString('hex');
  execSync(
    `sqlite3 "${dbPath}" "INSERT OR REPLACE INTO ItemTable (key, value) VALUES ('${storageKey.replace(/'/g, "''")}', X'${hex}');"`,
  );
  console.log('Cookie saved successfully for Cursor Usage extension.');
  console.log('Run "Cursor Usage: Refresh Usage" or reload Cursor window.');
  process.exit(0);
}

fs.writeFileSync(scriptPath, script);
try {
  execSync(`"${electronPath}" "${scriptPath}"`, { stdio: 'inherit', cwd: tmpDir });
  console.log('Run "Cursor Usage: Refresh Usage" or reload Cursor window.');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
