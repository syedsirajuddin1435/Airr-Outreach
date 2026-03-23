import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = new (await import('better-sqlite3')).default(process.cwd() + '/autopilot.db');
    db.pragma('journal_mode = WAL');
    
    db.prepare('DELETE FROM messages WHERE prospect_id = ?').run(params.id);
    db.prepare('DELETE FROM research WHERE prospect_id = ?').run(params.id);
    db.prepare('DELETE FROM prospects WHERE id = ?').run(params.id);
    
    db.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prospect' }, { status: 500 });
  }
}
