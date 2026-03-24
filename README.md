# AUTOPILOT — AI Outreach Command Center
### for airr by OneOrigin

> Generate prospects, research them, write personalized LinkedIn + Email outreach, handle replies — all automatically. Zero copy-paste.

---

## 🚀 Live Demo

Deploy via GitHub Pages — see setup below.

---

## ✨ What It Does

| Feature | Description |
|---|---|
| 🎯 Prospect Generation | Generates up to 50 targeted higher-ed prospects with buying intent signals |
| 🧠 Auto Research | Researches each prospect — pain points, brief, personalization hook |
| ✍️ Message Writing | Writes LinkedIn connection + DM + cold email sequences per prospect |
| 💬 Reply Handler | Paste any prospect reply → AI responds instantly in your voice |
| 📊 Deduplication | Batched generation with hard dedup — no repeated names or institutions |
| ⬇️ CSV Export | Export all prospects + messages to CSV |

---

## 📁 Files

```
autopilot-v2.html   → Main app (single file, runs in any browser)
index.html          → GitHub Pages entry point (identical to above)
README.md           → This file
```

---

## ⚙️ Setup

### Option 1 — Run Locally
Just open `autopilot-v2.html` in any browser. No install needed.

### Option 2 — GitHub Pages (Free Hosting)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: `Deploy from branch` → `main` → `/ (root)`
4. Click **Save**
5. Your app will be live at: `https://YOUR_USERNAME.github.io/autopilot-airr`

### Option 3 — Vercel (One Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import this GitHub repo into Vercel
2. No build settings needed — it's a static HTML file
3. Live in 30 seconds

---

## 🔑 Powered By

- **Anthropic Claude API** — all AI generation runs client-side via the API
- **No backend required** — pure HTML/CSS/JS, single file
- **No API key needed in code** — Claude.ai handles auth when run inside Claude

> ⚠️ **Note:** When running outside Claude.ai (e.g. GitHub Pages), you'll need to add your Anthropic API key. See below.

---

## 🔧 Adding Your API Key (for external hosting)

Open `autopilot-v2.html` and find the `ai()` function (~line 310). Add your key to the headers:

```javascript
async function ai(prompt, maxTokens = 900) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_ANTHROPIC_API_KEY_HERE',   // ← add this
      'anthropic-version': '2023-06-01',              // ← add this
      'anthropic-dangerous-direct-browser-access': 'true' // ← add this
    },
    ...
  });
}
```

Get your API key at: [console.anthropic.com](https://console.anthropic.com)

---

## 👤 Built For

**Syed Sirajuddin** — Account Executive, OneOrigin  
Selling **airr** — AI-powered transcript processing for higher education  
Target market: US universities, admissions & registrar teams

---

## 📊 Product Context (airr)

- 85% faster transcript evaluations
- 100% accuracy via AI + human oversight
- 70% scalability during peak admissions
- 10X ROI
- ~1M transcripts processed in 2024
- Integrates with: Salesforce, Slate, Ellucian, Oracle PeopleSoft, Jenzabar

---

*Built with Claude by Anthropic*
