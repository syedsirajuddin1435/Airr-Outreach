import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'autopilot.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

export async function GET() {
  try {
    const db = getDb();
    
    const profileRow = db.prepare('SELECT key, value FROM settings WHERE key LIKE ?').all('profile_%');
    const apiRow = db.prepare('SELECT key, value FROM settings WHERE key LIKE ?').all('api_%');
    const targetRow = db.prepare('SELECT key, value FROM settings WHERE key LIKE ?').all('target_%');
    
    const profile: any = {};
    profileRow.forEach((row: any) => {
      profile[row.key.replace('profile_', '')] = row.value;
    });
    
    const api: any = {};
    apiRow.forEach((row: any) => {
      api[row.key.replace('api_', '')] = row.value;
    });
    
    const target: any = {};
    targetRow.forEach((row: any) => {
      target[row.key.replace('target_', '')] = row.value;
    });
    
    db.close();
    
    return NextResponse.json({ profile, api, target });
  } catch (error) {
    return NextResponse.json({ profile: null, api: null, target: null });
  }
}

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();
    const db = getDb();
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
    
    const prefix = type === 'profile' ? 'profile_' : type === 'api' ? 'api_' : 'target_';
    
    for (const [key, value] of Object.entries(data)) {
      const settingKey = `${prefix}${key}`;
      const existing = db.prepare('SELECT id FROM settings WHERE key = ?').get(settingKey);
      
      if (existing) {
        db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(value), settingKey);
      } else {
        db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(settingKey, String(value));
      }
    }
    
    db.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
