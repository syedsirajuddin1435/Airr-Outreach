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
    const { prospect, channels } = await request.json();
    const profile = await getProfile();
    const msgs: Record<string, string> = {};
    const chs = channels && channels.length > 0 ? channels : ['linkedin'];
    
    const profileCtx = `You are a sales AI assistant for ${profile.name}, ${profile.role} at ${profile.company}.
Product: ${profile.product} — ${profile.value}
Tone: ${profile.tone}
ICP: ${profile.icp}`;

    for (const ch of chs) {
      if (ch === 'linkedin') {
        const prompt = `${profileCtx}

Write a LinkedIn outreach sequence for this prospect. Be human, direct, insight-led. No buzzwords.

Prospect: ${prospect.name}, ${prospect.title} at ${prospect.institution} (${prospect.size}, ${prospect.location})
Stack: ${prospect.currentStack}
Hook: ${prospect.research?.hook || prospect.signals?.[0] || 'manual transcript processing bottlenecks'}
Their pain: ${prospect.research?.pains?.[0] || 'manual transcript processing bottlenecks'}

Write TWO messages:

1. CONNECTION REQUEST (under 280 characters):
[connection message here]

2. FOLLOW-UP DM (after they connect, 3-4 lines max):
[follow-up message here]

Label each clearly with "CONNECTION REQUEST:" and "FOLLOW-UP DM:" on separate lines.`;

        msgs.linkedin = await ai(prompt, 400);
      }

      if (ch === 'email') {
        const prompt = `${profileCtx}

Write a cold email sequence for this prospect. Punchy subject, insight-led body, one soft CTA.

Prospect: ${prospect.name}, ${prospect.title} at ${prospect.institution} (${prospect.size}, ${prospect.location})
Stack: ${prospect.currentStack}
Hook: ${prospect.research?.hook || prospect.signals?.[0] || 'manual transcript processing bottlenecks'}
Their pain: ${prospect.research?.pains?.[0] || 'manual transcript processing bottlenecks'}

Write TWO emails:

EMAIL 1 — FIRST TOUCH:
Subject: [subject line]
Body: [3-4 lines + CTA]

EMAIL 2 — FOLLOW-UP (3 days later):
Subject: [subject line]
Body: [2-3 lines + CTA]

Label clearly with "EMAIL 1 — FIRST TOUCH:" and "EMAIL 2 — FOLLOW-UP:" on separate lines.`;

        msgs.email = await ai(prompt, 500);
      }
    }

    return NextResponse.json({ messages: msgs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
