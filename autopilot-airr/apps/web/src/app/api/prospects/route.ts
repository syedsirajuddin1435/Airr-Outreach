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
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS prospects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        institution TEXT NOT NULL,
        location TEXT,
        size TEXT,
        current_stack TEXT,
        signals TEXT,
        temperature TEXT,
        channel TEXT,
        campaign_id INTEGER,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS research (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prospect_id INTEGER NOT NULL,
        brief TEXT,
        pains TEXT,
        hook TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (prospect_id) REFERENCES prospects(id)
      )
    `);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prospect_id INTEGER NOT NULL,
        channel TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (prospect_id) REFERENCES prospects(id)
      )
    `);
    
    const prospects = db.prepare(`
      SELECT p.*, 
        (SELECT brief FROM research WHERE prospect_id = p.id LIMIT 1) as research_brief,
        (SELECT hook FROM research WHERE prospect_id = p.id LIMIT 1) as research_hook
      FROM prospects p 
      ORDER BY p.created_at DESC
    `).all();
    
    const formattedProspects = prospects.map((p: any) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      institution: p.institution,
      location: p.location,
      size: p.size,
      currentStack: p.current_stack,
      signals: p.signals ? JSON.parse(p.signals) : [],
      temperature: p.temperature,
      channel: p.channel,
      researchStatus: p.research_brief ? 'done' : 'pending',
      msgStatus: p.research_brief ? 'done' : 'pending',
    }));
    
    db.close();
    return NextResponse.json({ prospects: formattedProspects });
  } catch (error) {
    return NextResponse.json({ prospects: [] });
  }
}

export async function DELETE() {
  try {
    const db = getDb();
    db.prepare('DELETE FROM messages').run();
    db.prepare('DELETE FROM research').run();
    db.prepare('DELETE FROM prospects').run();
    db.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear prospects' }, { status: 500 });
  }
}
