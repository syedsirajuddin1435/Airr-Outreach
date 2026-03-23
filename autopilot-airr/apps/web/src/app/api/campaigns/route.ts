import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'autopilot.db');

function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      config TEXT,
      status TEXT DEFAULT 'draft',
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);
  return db;
}

export async function GET() {
  try {
    const db = getDb();
    const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
    
    const withCounts = campaigns.map((c: any) => {
      const count = db.prepare('SELECT COUNT(*) as count FROM prospects WHERE campaign_id = ?').get(c.id) as any;
      return { ...c, prospectCount: count?.count || 0, createdAt: c.created_at };
    });
    
    db.close();
    return NextResponse.json({ campaigns: withCounts });
  } catch (error) {
    return NextResponse.json({ campaigns: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { name, config } = await request.json();
    const db = getDb();
    
    const result = db.prepare('INSERT INTO campaigns (name, config) VALUES (?, ?)').run(name, config || '{}');
    db.close();
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = getDb();
    db.prepare('DELETE FROM messages WHERE prospect_id IN (SELECT id FROM prospects WHERE campaign_id IN (SELECT id FROM campaigns))').run();
    db.prepare('DELETE FROM research WHERE prospect_id IN (SELECT id FROM prospects WHERE campaign_id IN (SELECT id FROM campaigns))').run();
    db.prepare('DELETE FROM prospects WHERE campaign_id IN (SELECT id FROM campaigns)').run();
    db.prepare('DELETE FROM campaigns').run();
    db.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear campaigns' }, { status: 500 });
  }
}
