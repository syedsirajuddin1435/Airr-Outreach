import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

async function getProfile() {
  try {
    const db = new (await import('better-sqlite3')).default(process.cwd() + '/autopilot.db');
    db.pragma('journal_mode = WAL');
    
    const profile: any = {};
    const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'profile_%'").all() as any[];
    rows.forEach(row => {
      profile[row.key.replace('profile_', '')] = row.value;
    });
    
    db.close();
    return profile;
  } catch {
    return {
      name: 'Syed Sirajuddin',
      role: 'Account Executive',
      company: 'OneOrigin',
      product: 'airr',
      tone: 'consultative and direct',
      value: 'airr, powered by OneOrigin\'s unified AI engine Sia™, transforms how universities handle transcript processing. It eliminates manual tasks, achieves near-100% accuracy, cuts evaluation time by 85%, and handles peak-season volume effortlessly. Integrates natively with Salesforce, Slate, Ellucian, Oracle PeopleSoft, and Jenzabar. ~1M transcripts processed in 2024. 10X ROI. The result: admissions and registrar teams stop drowning in paperwork and focus on student success.',
      icp: 'Directors of Admissions, VP Enrollment, University Registrars, Enrollment Tech leaders at US higher education institutions',
    };
  }
}

async function ai(prompt: string, maxTokens: number = 500): Promise<string> {
  const db = new (await import('better-sqlite3')).default(process.cwd() + '/autopilot.db');
  db.pragma('journal_mode = WAL');
  
  const apiKeyRow = db.prepare("SELECT value FROM settings WHERE key = 'api_anthropicapikey'").get() as any;
  const apiKey = apiKeyRow?.value || process.env.ANTHROPIC_API_KEY;
  
  db.close();
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  
  return message.content.map(block => block.type === 'text' ? block.text : '').join('');
}

export async function POST(request: Request) {
  try {
    const { prospect } = await request.json();
    const profile = await getProfile();
    
    const profileCtx = `You are a sales AI assistant for ${profile.name}, ${profile.role} at ${profile.company}.
Product: ${profile.product} — ${profile.value}
Tone: ${profile.tone}
ICP: ${profile.icp}`;

    const prompt = `${profileCtx}

Research this higher education prospect and produce a sharp personalization brief.

Prospect: ${prospect.name}, ${prospect.title} at ${prospect.institution}
Location: ${prospect.location} | Size: ${prospect.size}
Current Stack: ${prospect.currentStack}
Known Signals: ${(prospect.signals || []).join('; ')}

Return a JSON object only. No markdown:
{
  "brief": "2-sentence prospect summary",
  "pains": ["pain 1", "pain 2", "pain 3"],
  "hook": "The single sharpest personalization angle to open with"
}`;

    const raw = await ai(prompt, 500);
    const clean = raw.replace(/```json|```/g, '').trim();
    const s = clean.indexOf('{');
    const e = clean.lastIndexOf('}');
    const research = JSON.parse(clean.slice(s, e + 1));

    return NextResponse.json({ research });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
