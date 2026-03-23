'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

const avatarColors = [
  ['#4f6bff', '#1a2060'],
  ['#c8f135', '#2a3a00'],
  ['#ff5c5c', '#3a1010'],
  ['#34d399', '#0a2a1e'],
  ['#f59e0b', '#2a1e00'],
  ['#a78bfa', '#1e1040'],
];

export interface Prospect {
  id: number;
  name: string;
  title: string;
  institution: string;
  location: string;
  size: string;
  currentStack: string;
  signals: string[];
  temperature: 'hot' | 'warm';
  channel: 'linkedin' | 'email' | 'both';
  researchStatus: 'pending' | 'running' | 'done' | 'error';
  msgStatus: 'pending' | 'running' | 'done' | 'error';
  research?: {
    brief: string;
    pains: string[];
    hook: string;
  };
  messages?: {
    linkedin?: string;
    email?: string;
  };
}

export interface CampaignConfig {
  titles: string;
  industry: string;
  size: string;
  geo: string;
  signals: string;
  count: number;
  channels: string[];
}

export default function HomePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [channels, setChannels] = useState<string[]>(['linkedin', 'email']);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, label: '', status: '' });
  const [showProgress, setShowProgress] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [activeTabs, setActiveTabs] = useState<Record<number, string>>({});
  const [stats, setStats] = useState({ gen: 0, res: 0, msg: 0, rep: 0 });
  const [config, setConfig] = useState<CampaignConfig>({
    titles: 'Director of Admissions, VP Enrollment Management, University Registrar, Director of Enrollment Technology',
    industry: 'Universities, Liberal Arts Colleges, Community Colleges, Graduate Schools',
    size: 'Mid (5,000–20,000 students)',
    geo: 'United States',
    signals: 'Using Slate/Salesforce CRM, running Ellucian Banner/Colleague, hiring admissions staff, announced enrollment growth targets, digitization/modernization initiative',
    count: 10,
    channels: ['linkedin', 'email'],
  });

  useEffect(() => {
    const saved = localStorage.getItem('autopilot-config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    const savedProspects = localStorage.getItem('autopilot-prospects');
    if (savedProspects) {
      setProspects(JSON.parse(savedProspects));
      const parsed = JSON.parse(savedProspects);
      setStats({
        gen: parsed.length,
        res: parsed.filter((p: Prospect) => p.researchStatus === 'done').length,
        msg: parsed.filter((p: Prospect) => p.msgStatus === 'done').length,
        rep: 0,
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('autopilot-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('autopilot-prospects', JSON.stringify(prospects));
  }, [prospects]);

  const toggleChannel = (ch: string) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const launchAutopilot = async () => {
    setIsRunning(true);
    setShowProgress(true);
    setProgress({ pct: 0, label: 'Starting...', status: '' });
    setProspects([]);
    setStats({ gen: 0, res: 0, msg: 0, rep: 0 });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, channels }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const totalSteps = 1 + data.prospects.length * 2;
      let step = 0;

      setProgress({ pct: 5, label: 'Generating prospects...', status: `${data.prospects.length} prospects found` });
      
      const initialProspects: Prospect[] = data.prospects.map((p: any, i: number) => ({
        id: i,
        name: p.name,
        title: p.title,
        institution: p.institution,
        location: p.location,
        size: p.size,
        currentStack: p.currentStack,
        signals: p.signals,
        temperature: p.temperature,
        channel: p.channel,
        researchStatus: 'pending',
        msgStatus: 'pending',
      }));

      setProspects(initialProspects);
      setStats(prev => ({ ...prev, gen: initialProspects.length }));
      step = 1;
      setProgress({ pct: (step / totalSteps) * 100, label: 'Prospects generated', status: 'Starting research...' });

      for (let i = 0; i < initialProspects.length; i++) {
        setProspects(prev => prev.map((p, idx) => 
          idx === i ? { ...p, researchStatus: 'running' } : p
        ));

        setProgress({ 
          pct: ((step) / totalSteps) * 100, 
          label: `Researching ${i + 1}/${initialProspects.length}`,
          status: `🧠 Researching ${initialProspects[i].name}...`
        });

        try {
          const resRes = await fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prospect: initialProspects[i] }),
          });
          const resData = await resRes.json();
          
          setProspects(prev => prev.map((p, idx) => 
            idx === i ? { ...p, research: resData.research, researchStatus: 'done' } : p
          ));
          setStats(prev => ({ ...prev, res: prev.res + 1 }));
        } catch (e) {
          setProspects(prev => prev.map((p, idx) => 
            idx === i ? { ...p, researchStatus: 'error' } : p
          ));
        }

        step++;
        setProspects(prev => prev.map((p, idx) => 
          idx === i ? { ...p, msgStatus: 'running' } : p
        ));

        setProgress({ 
          pct: ((step) / totalSteps) * 100, 
          label: `Generating messages ${i + 1}/${initialProspects.length}`,
          status: `✍️ Writing messages for ${initialProspects[i].name}...`
        });

        try {
          const msgRes = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prospect: { ...initialProspects[i] }, channels }),
          });
          const msgData = await msgRes.json();
          
          setProspects(prev => prev.map((p, idx) => 
            idx === i ? { ...p, messages: msgData.messages, msgStatus: 'done' } : p
          ));
          setStats(prev => ({ ...prev, msg: prev.msg + 1 }));
        } catch (e) {
          setProspects(prev => prev.map((p, idx) => 
            idx === i ? { ...p, msgStatus: 'error' } : p
          ));
        }

        step++;
      }

      setProgress({ 
        pct: 100, 
        label: 'Complete!', 
        status: `🚀 ${initialProspects.length} prospects fully processed` 
      });

    } catch (err: any) {
      setProgress({ pct: 0, label: 'Error', status: err.message });
    }

    setIsRunning(false);
  };

  const runAllResearch = async () => {
    for (let i = 0; i < prospects.length; i++) {
      const p = prospects[i];
      if (p.researchStatus === 'done') continue;

      setProspects(prev => prev.map((pr, idx) => 
        idx === i ? { ...pr, researchStatus: 'running' } : pr
      ));

      try {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prospect: p }),
        });
        const data = await res.json();
        setProspects(prev => prev.map((pr, idx) => 
          idx === i ? { ...pr, research: data.research, researchStatus: 'done' } : pr
        ));
        setStats(prev => ({ ...prev, res: prev.res + 1 }));
      } catch (e) {
        setProspects(prev => prev.map((pr, idx) => 
          idx === i ? { ...pr, researchStatus: 'error' } : pr
        ));
      }
    }
  };

  const runAllMessages = async () => {
    for (let i = 0; i < prospects.length; i++) {
      const p = prospects[i];
      if (p.msgStatus === 'done') continue;

      setProspects(prev => prev.map((pr, idx) => 
        idx === i ? { ...pr, msgStatus: 'running' } : pr
      ));

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prospect: p, channels }),
        });
        const data = await res.json();
        setProspects(prev => prev.map((pr, idx) => 
          idx === i ? { ...pr, messages: data.messages, msgStatus: 'done' } : pr
        ));
        setStats(prev => ({ ...prev, msg: prev.msg + 1 }));
      } catch (e) {
        setProspects(prev => prev.map((pr, idx) => 
          idx === i ? { ...pr, msgStatus: 'error' } : pr
        ));
      }
    }
  };

  const handleReply = async (prospectId: number, reply: string) => {
    const p = prospects[prospectId];
    
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect: p, reply }),
      });
      const data = await res.json();
      setStats(prev => ({ ...prev, rep: prev.rep + 1 }));
      return data.response;
    } catch (e) {
      return 'Error generating response';
    }
  };

  const exportCSV = () => {
    if (!prospects.length) return;
    const headers = ['Name', 'Title', 'Institution', 'Location', 'Size', 'Stack', 'Temperature', 'Hook', 'LinkedIn Msg', 'Email Msg'];
    const rows = prospects.map(p => [
      p.name, p.title, p.institution, p.location, p.size, p.currentStack, p.temperature,
      p.research?.hook || '',
      (p.messages?.linkedin || '').replace(/\n/g, ' '),
      (p.messages?.email || '').replace(/\n/g, ' ')
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airr-prospects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <Navigation stats={stats} />
      <div className="wrap">
        <div className="stats" style={{ marginTop: 24 }}>
        <div className="stat"><div className="stat-n">{stats.gen}</div><div className="stat-l">Prospects</div></div>
        <div className="stat"><div className="stat-n">{stats.res}</div><div className="stat-l">Researched</div></div>
        <div className="stat"><div className="stat-n">{stats.msg}</div><div className="stat-l">Messages Ready</div></div>
        <div className="stat"><div className="stat-n">{stats.rep}</div><div className="stat-l">Replies Handled</div></div>
      </div>

      <div className="config">
        <div className="config-title">⚙️ Campaign Settings</div>
        <div className="config-sub">Set once. AUTOPILOT handles everything else — research, icebreakers, and full outreach for every prospect.</div>

        <div className="grid2">
          <div>
            <label>Target Job Titles</label>
            <input value={config.titles} onChange={e => setConfig({ ...config, titles: e.target.value })} />
          </div>
          <div>
            <label>Institution Type</label>
            <input value={config.industry} onChange={e => setConfig({ ...config, industry: e.target.value })} />
          </div>
        </div>

        <div className="grid3" style={{ marginTop: 14 }}>
          <div>
            <label>Institution Size</label>
            <select value={config.size} onChange={e => setConfig({ ...config, size: e.target.value })}>
              <option>Small (under 5,000 students)</option>
              <option>Mid (5,000–20,000 students)</option>
              <option>Large (20,000–50,000 students)</option>
              <option>All sizes</option>
            </select>
          </div>
          <div>
            <label>Geography</label>
            <input value={config.geo} onChange={e => setConfig({ ...config, geo: e.target.value })} />
          </div>
          <div>
            <label>Number of Prospects</label>
            <select value={config.count} onChange={e => setConfig({ ...config, count: parseInt(e.target.value) })}>
              {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                <option key={n} value={n}>{n} prospects</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label>Buying Intent Signals to Target</label>
          <input value={config.signals} onChange={e => setConfig({ ...config, signals: e.target.value })} />
        </div>

        <div style={{ marginTop: 14 }}>
          <label>Outreach Channels</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className={`ch-pill ${channels.includes('linkedin') ? 'active' : ''}`} onClick={() => toggleChannel('linkedin')}>💼 LinkedIn</button>
            <button className={`ch-pill ${channels.includes('email') ? 'active' : ''}`} onClick={() => toggleChannel('email')}>✉️ Email</button>
          </div>
        </div>

        <button className="launch-btn" onClick={launchAutopilot} disabled={isRunning}>
          {isRunning ? '⏳ RUNNING...' : '🚀 LAUNCH AUTOPILOT'}
        </button>
      </div>

      <div className={`progress-wrap ${showProgress ? 'visible' : ''}`}>
        <div className="progress-label">
          <span>{progress.label}</span>
          <span>{Math.round(progress.pct)}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress.pct}%` }} /></div>
        <div className="progress-status">{progress.status}</div>
      </div>

      <div className="pipeline-header" style={{ display: prospects.length ? 'flex' : 'none' }}>
        <div className="pipeline-title">📋 Prospect Pipeline</div>
        <div className="pipeline-controls">
          <button className="btn-sm btn-outline" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="btn-sm btn-blue" onClick={runAllResearch} disabled={isRunning}>▶ Run Research on All</button>
          <button className="btn-sm btn-green" onClick={runAllMessages} disabled={isRunning}>⚡ Generate All Messages</button>
        </div>
      </div>

      <div id="pipeline">
        {prospects.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            Configure your campaign above and hit Launch Autopilot.<br />All research and outreach will be generated automatically.
          </div>
        )}
        {prospects.map((p, i) => {
          const [fg, bg] = avatarColors[i % avatarColors.length];
          const isExpanded = expandedCards.has(p.id);
          const activeTab = activeTabs[p.id] || 'signals';

          return (
            <div key={p.id} className="prospect-card">
              <div className="card-top" onClick={() => toggleExpand(p.id)}>
                <div className="avatar" style={{ background: bg, color: fg }}>{getInitials(p.name)}</div>
                <div className="card-info">
                  <div className="card-name">{p.name}</div>
                  <div className="card-role">{p.title} · {p.institution}</div>
                  <div className="card-badges">
                    <span className={`badge ${p.temperature === 'hot' ? 'badge-hot' : 'badge-warm'}`}>
                      {p.temperature === 'hot' ? '🔥 Hot' : '🌡 Warm'}
                    </span>
                    {p.channel === 'both' && <><span className="badge badge-li">LinkedIn</span><span className="badge badge-em">Email</span></>}
                    {p.channel === 'linkedin' && <span className="badge badge-li">LinkedIn</span>}
                    {p.channel === 'email' && <span className="badge badge-em">Email</span>}
                    <span className="badge" style={{ background: 'rgba(100,100,120,.15)', color: 'var(--muted)' }}>{p.size}</span>
                  </div>
                </div>
                <div className="card-status">
                  <div className={`status-icon s-${p.msgStatus === 'done' ? 'done' : p.msgStatus === 'running' ? 'running' : p.msgStatus === 'error' ? 'error' : 'pending'}`}>
                    {p.msgStatus === 'done' ? '✅' : p.msgStatus === 'running' ? '✍️' : p.msgStatus === 'error' ? '❌' : '⏳'}
                  </div>
                </div>
              </div>
              <div className={`card-expand ${isExpanded ? 'open' : ''}`}>
                <div className="tab-row">
                  <button className={`tab ${activeTab === 'signals' ? 'active' : ''}`} onClick={() => setActiveTabs({ ...activeTabs, [p.id]: 'signals' })}>Signals</button>
                  <button className={`tab ${activeTab === 'research' ? 'active' : ''}`} onClick={() => setActiveTabs({ ...activeTabs, [p.id]: 'research' })}>Research</button>
                  {channels.includes('linkedin') && <button className={`tab ${activeTab === 'linkedin' ? 'active' : ''}`} onClick={() => setActiveTabs({ ...activeTabs, [p.id]: 'linkedin' })}>LinkedIn</button>}
                  {channels.includes('email') && <button className={`tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTabs({ ...activeTabs, [p.id]: 'email' })}>Email</button>}
                  <button className={`tab ${activeTab === 'reply' ? 'active' : ''}`} onClick={() => setActiveTabs({ ...activeTabs, [p.id]: 'reply' })}>Reply Handler</button>
                </div>

                <div className={`tab-content ${activeTab === 'signals' ? 'active' : ''}`} id={`tab-${p.id}-signals`}>
                  <div className="section-label">Buying Intent Signals</div>
                  <div className="signal-list">
                    {p.signals.map((s, idx) => <div key={idx} className="signal">{s}</div>)}
                  </div>
                  <div className="section-label">Current Stack</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.currentStack}</div>
                </div>

                <div className={`tab-content ${activeTab === 'research' ? 'active' : ''}`} id={`tab-${p.id}-research`}>
                  {p.researchStatus === 'done' && p.research ? (
                    <>
                      <div className="section-label">Brief</div>
                      <p style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}>{p.research.brief}</p>
                      <div className="section-label">Pain Points</div>
                      <div className="signal-list">
                        {p.research.pains.map((pain, idx) => <div key={idx} className="signal">{pain}</div>)}
                      </div>
                      <div className="section-label" style={{ marginTop: 10 }}>Best Hook</div>
                      <p style={{ fontSize: 13, color: 'var(--a1)', fontWeight: 600 }}>{p.research.hook}</p>
                    </>
                  ) : (
                    <div className="msg-box loading">{p.researchStatus === 'running' ? 'Researching...' : 'Waiting for research...'}</div>
                  )}
                </div>

                {channels.includes('linkedin') && (
                  <div className={`tab-content ${activeTab === 'linkedin' ? 'active' : ''}`} id={`tab-${p.id}-linkedin`}>
                    {p.msgStatus === 'done' && p.messages?.linkedin ? (
                      <div className="msg-box" style={{ position: 'relative' }}>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(p.messages?.linkedin || '')}>Copy</button>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.75 }}>{p.messages.linkedin}</div>
                      </div>
                    ) : (
                      <div className="msg-box loading">{p.msgStatus === 'running' ? 'Generating...' : 'Waiting for messages...'}</div>
                    )}
                  </div>
                )}

                {channels.includes('email') && (
                  <div className={`tab-content ${activeTab === 'email' ? 'active' : ''}`} id={`tab-${p.id}-email`}>
                    {p.msgStatus === 'done' && p.messages?.email ? (
                      <div className="msg-box" style={{ position: 'relative' }}>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(p.messages?.email || '')}>Copy</button>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.75 }}>{p.messages.email}</div>
                      </div>
                    ) : (
                      <div className="msg-box loading">{p.msgStatus === 'running' ? 'Generating...' : 'Waiting for messages...'}</div>
                    )}
                  </div>
                )}

                <div className={`tab-content ${activeTab === 'reply' ? 'active' : ''}`} id={`tab-${p.id}-reply`}>
                  <div className="section-label">Handle a Reply</div>
                  <div className="reply-input-wrap">
                    <textarea id={`reply-input-${p.id}`} placeholder="Paste the prospect's reply here..." />
                    <button className="reply-btn" onClick={async () => {
                      const replyInput = document.getElementById(`reply-input-${p.id}`) as HTMLTextAreaElement;
                      const replyOut = document.getElementById(`reply-out-${p.id}`);
                      if (!replyInput?.value.trim()) return;
                      replyOut.innerHTML = '<div class="msg-box loading">Crafting response...</div>';
                      const response = await handleReply(p.id, replyInput.value);
                      replyOut.innerHTML = `
                        <div class="section-label">Your AI Response</div>
                        <div class="msg-box" style="position:relative">
                          <button class="copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)">Copy</button>
                          <div style="white-space:pre-wrap;font-size:13px;line-height:1.75">${response}</div>
                        </div>`;
                    }}>🤖 Generate AI Response</button>
                  </div>
                  <div id={`reply-out-${p.id}`} style={{ marginTop: 12 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
