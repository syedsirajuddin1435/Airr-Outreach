import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

async function getSettings() {
  try {
    const db = new (await import('better-sqlite3')).default(process.cwd() + '/autopilot.db');
    db.pragma('journal_mode = WAL');
    
    const profile: any = {};
    const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'profile_%'").all() as any[];
    rows.forEach(row => {
      profile[row.key.replace('profile_', '')] = row.value;
    });
    
    const target: any = {};
    const targetRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'target_%'").all() as any[];
    targetRows.forEach(row => {
      target[row.key.replace('target_', '')] = row.value;
    });
    
    db.close();
    return { profile, target };
  } catch {
    return {
      profile: {
        name: 'Syed Sirajuddin',
        role: 'Account Executive',
        company: 'OneOrigin',
        product: 'airr',
        tone: 'consultative and direct',
        value: 'airr, powered by OneOrigin\'s unified AI engine Sia™, transforms how universities handle transcript processing. It eliminates manual tasks, achieves near-100% accuracy, cuts evaluation time by 85%, and handles peak-season volume effortlessly. Integrates natively with Salesforce, Slate, Ellucian, Oracle PeopleSoft, and Jenzabar. ~1M transcripts processed in 2024. 10X ROI. The result: admissions and registrar teams stop drowning in paperwork and focus on student success.',
        icp: 'Directors of Admissions, VP Enrollment, University Registrars, Enrollment Tech leaders at US higher education institutions',
      },
      target: {
        titles: 'Director of Admissions, VP Enrollment Management, University Registrar, Director of Enrollment Technology',
        industry: 'Universities, Liberal Arts Colleges, Community Colleges, Graduate Schools',
        size: 'Mid (5,000–20,000 students)',
        geo: 'United States',
        signals: 'Using Slate/Salesforce CRM, running Ellucian Banner/Colleague, hiring admissions staff, announced enrollment growth targets, digitization/modernization initiative',
      }
    };
  }
}

async function ai(prompt: string, maxTokens: number = 900): Promise<string> {
  const db = new (await import('better-sqlite3')).default(process.cwd() + '/autopilot.db');
  db.pragma('journal_mode = WAL');
  
  const apiKeyRow = db.prepare("SELECT value FROM settings WHERE key = 'api_anthropicapikey'").get() as any;
  const apiKey = apiKeyRow?.value || process.env.ANTHROPIC_API_KEY;
  
  db.close();
  
  if (!apiKey) {
    throw new Error('API key not configured. Please add your Anthropic API key in Admin settings.');
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
    const { titles, industry, size, geo, signals, count } = await request.json();
    const { profile } = await getSettings();
    
    const profileCtx = `You are a sales AI assistant for ${profile.name || 'Syed Sirajuddin'}, ${profile.role || 'Account Executive'} at ${profile.company || 'OneOrigin'}.
Product: ${profile.product || 'airr'} — ${profile.value || 'AI-powered transcript processing for higher education'}
Tone: ${profile.tone || 'consultative and direct'}
ICP: ${profile.icp || 'Directors of Admissions, VP Enrollment, University Registrars at US higher education institutions'}`;

    const BATCH_SIZE = 10;
    let allProspects: any[] = [];
    let batchNum = 1;
    const maxAttempts = Math.ceil(count / BATCH_SIZE) + 3;
    let attempts = 0;

    while (allProspects.length < count && attempts < maxAttempts) {
      const stillNeeded = count - allProspects.length;
      const batchSize = Math.min(BATCH_SIZE, stillNeeded + 2);
      const existingNames = allProspects.map(p => `${p.name} at ${p.institution}`);

      const exclusion = existingNames.length > 0
        ? `\nIMPORTANT — Do NOT repeat any of these already-generated prospects:\n${existingNames.map(n => `- ${n}`).join('\n')}\n`
        : '';

      const prompt = `${profileCtx}

Generate exactly ${batchSize} fictional but realistic prospect profiles. This is batch ${batchNum} — make sure ALL names and institutions are unique.

Criteria:
- Titles: ${titles || 'Director of Admissions, VP Enrollment Management, University Registrar'}
- Institution type: ${industry || 'Universities, Liberal Arts Colleges'}
- Institution size: ${size || 'Mid (5,000–20,000 students)'}
- Geography: ${geo || 'United States'}
- Buying signals: ${signals || 'CRM usage, enrollment growth, digitization initiatives'}

${exclusion}
Return ONLY a valid JSON array. Each object:
{
  "name": "Full Name",
  "title": "Job Title",
  "institution": "Institution Name",
  "location": "City, State",
  "size": "enrollment figure",
  "currentStack": "e.g. Slate CRM, Ellucian Banner",
  "signals": ["signal 1", "signal 2", "signal 3"],
  "temperature": "hot|warm",
  "channel": "linkedin|email|both"
}`;

      try {
        const raw = await ai(prompt, 2500);
        const clean = raw.replace(/```json|```/g, '').trim();
        const s = clean.indexOf('[');
        const e = clean.lastIndexOf(']');
        const batch = JSON.parse(clean.slice(s, e + 1));
        
        const seen = new Set(allProspects.map(p => `${p.name.toLowerCase()}|${p.institution.toLowerCase()}`));
        for (const p of batch) {
          const key = `${p.name.toLowerCase()}|${p.institution.toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            allProspects.push(p);
          }
        }
        batchNum++;
      } catch (e) {
        console.error('Batch failed:', e);
      }
      attempts++;
    }

    return NextResponse.json({ prospects: allProspects.slice(0, count) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
