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

async function ai(prompt: string, maxTokens: number = 300): Promise<string> {
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
    const { prospect, reply } = await request.json();
    const profile = await getProfile();
    
    const profileCtx = `You are a sales AI assistant for ${profile.name}, ${profile.role} at ${profile.company}.
Product: ${profile.product} — ${profile.value}
Tone: ${profile.tone}`;

    const prompt = `${profileCtx}

You're handling a reply in an ongoing conversation about airr.

Prospect: ${prospect.name}, ${prospect.title} at ${prospect.institution}
Their stack: ${prospect.currentStack}
Their reply: "${reply}"

1. Detect intent (interested/objection/question/stalling/not interested)
2. Write the perfect response — human, direct, max 4 lines
3. Move toward a meeting if appropriate

Write ONLY the response message.`;

    const response = await ai(prompt, 300);

    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
