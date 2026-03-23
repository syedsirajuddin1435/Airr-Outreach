# AUTOPILOT — AI Outreach Command Center

## New Next.js Monorepo Version

This is the full-stack Next.js version with SQLite database and admin settings.

### Quick Start

```bash
cd autopilot-airr
npm install
npm run dev
```

Visit http://localhost:3000

### Admin Settings

Visit http://localhost:3000/admin to configure:
- Sales profile (name, role, company, product, tone, ICP)
- API keys (Anthropic)
- Target criteria (titles, industry, size, geography, signals)
- View and manage all prospects

### Features

- **Autopilot Dashboard** - Generate prospects, research them, create personalized outreach messages
- **Admin Settings** - Configure everything from the UI
- **SQLite Database** - Persistent storage for settings and prospects
- **Reply Handler** - AI-powered responses to prospect replies
- **CSV Export** - Download all prospects and messages

### Tech Stack

- Next.js 14 (App Router)
- SQLite with better-sqlite3
- Anthropic Claude API
- TypeScript

---

## Legacy Version

The original single-file HTML version is in `autopilot-v2.html` - it runs directly in any browser without a server.

---

*Built for airr by OneOrigin*
