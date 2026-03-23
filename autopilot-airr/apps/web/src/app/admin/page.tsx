'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface ProfileSettings {
  name: string;
  role: string;
  company: string;
  product: string;
  tone: string;
  value: string;
  icp: string;
}

interface ApiSettings {
  anthropicApiKey: string;
}

interface TargetSettings {
  titles: string;
  industry: string;
  size: string;
  geo: string;
  signals: string;
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState<ProfileSettings>({
    name: 'Syed Sirajuddin',
    role: 'Account Executive',
    company: 'OneOrigin',
    product: 'airr',
    tone: 'consultative and direct',
    value: 'airr, powered by OneOrigin\'s unified AI engine Sia™, transforms how universities handle transcript processing. It eliminates manual tasks, achieves near-100% accuracy, cuts evaluation time by 85%, and handles peak-season volume effortlessly. Integrates natively with Salesforce, Slate, Ellucian, Oracle PeopleSoft, and Jenzabar. ~1M transcripts processed in 2024. 10X ROI. The result: admissions and registrar teams stop drowning in paperwork and focus on student success.',
    icp: 'Directors of Admissions, VP Enrollment, University Registrars, Enrollment Tech leaders at US higher education institutions',
  });

  const [api, setApi] = useState<ApiSettings>({
    anthropicApiKey: '',
  });

  const [target, setTarget] = useState<TargetSettings>({
    titles: 'Director of Admissions, VP Enrollment Management, University Registrar, Director of Enrollment Technology',
    industry: 'Universities, Liberal Arts Colleges, Community Colleges, Graduate Schools',
    size: 'Mid (5,000–20,000 students)',
    geo: 'United States',
    signals: 'Using Slate/Salesforce CRM, running Ellucian Banner/Colleague, hiring admissions staff, announced enrollment growth targets, digitization/modernization initiative',
  });

  const [prospects, setProspects] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadProspects();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.api) setApi(data.api);
      if (data.target) setTarget(data.target);
    } catch (e) {
      console.error('Failed to load settings');
    }
  };

  const loadProspects = async () => {
    try {
      const res = await fetch('/api/prospects');
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (e) {
      console.error('Failed to load prospects');
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', data: profile }),
      });
      if (res.ok) {
        setSuccess('Profile settings saved');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError('Failed to save profile');
    }
  };

  const saveApi = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'api', data: api }),
      });
      if (res.ok) {
        setSuccess('API settings saved');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError('Failed to save API settings');
    }
  };

  const saveTarget = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'target', data: target }),
      });
      if (res.ok) {
        setSuccess('Target settings saved');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError('Failed to save target settings');
    }
  };

  const deleteProspect = async (id: number) => {
    if (!confirm('Delete this prospect?')) return;
    try {
      await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
      loadProspects();
    } catch (e) {
      console.error('Failed to delete');
    }
  };

  const clearAllProspects = async () => {
    if (!confirm('Delete ALL prospects? This cannot be undone.')) return;
    try {
      await fetch('/api/prospects', { method: 'DELETE' });
      loadProspects();
    } catch (e) {
      console.error('Failed to clear');
    }
  };

  return (
    <>
      <Navigation />
      <div className="wrap" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <button 
            className={`nav-link ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >👤 Profile</button>
          <button 
            className={`nav-link ${activeSection === 'api' ? 'active' : ''}`}
            onClick={() => setActiveSection('api')}
          >🔑 API Keys</button>
          <button 
            className={`nav-link ${activeSection === 'target' ? 'active' : ''}`}
            onClick={() => setActiveSection('target')}
          >🎯 Target</button>
          <button 
            className={`nav-link ${activeSection === 'prospects' ? 'active' : ''}`}
            onClick={() => setActiveSection('prospects')}
          >📋 Prospects</button>
        </div>

        {success && <div className="success-msg">✓ {success}</div>}
        {error && <div className="error-msg">✗ {error}</div>}

        {activeSection === 'profile' && (
          <div className="admin-section">
            <div className="admin-section-title">👤 Sales Profile</div>
            <div className="settings-group">
              <div className="form-row">
                <div>
                  <label>Your Name</label>
                  <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label>Your Role</label>
                  <input value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Company</label>
                  <input value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} />
                </div>
                <div>
                  <label>Product Name</label>
                  <input value={profile.product} onChange={e => setProfile({ ...profile, product: e.target.value })} />
                </div>
              </div>
              <div>
                <label>Tone of Voice</label>
                <input value={profile.tone} onChange={e => setProfile({ ...profile, tone: e.target.value })} placeholder="e.g., consultative and direct" />
              </div>
            </div>
            <div className="settings-group">
              <div>
                <label>Product Value Proposition</label>
                <textarea rows={4} value={profile.value} onChange={e => setProfile({ ...profile, value: e.target.value })} />
              </div>
            </div>
            <div className="settings-group">
              <div>
                <label>Ideal Customer Profile (ICP)</label>
                <textarea rows={2} value={profile.icp} onChange={e => setProfile({ ...profile, icp: e.target.value })} />
              </div>
            </div>
            <button className="save-btn" onClick={saveProfile}>Save Profile</button>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="admin-section">
            <div className="admin-section-title">🔑 API Configuration</div>
            <div className="settings-group">
              <div>
                <label>Anthropic API Key</label>
                <input type="password" value={api.anthropicApiKey} onChange={e => setApi({ ...api, anthropicApiKey: e.target.value })} placeholder="sk-ant-..." />
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Get your API key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--a1)' }}>console.anthropic.com</a>
              </p>
            </div>
            <button className="save-btn" onClick={saveApi}>Save API Key</button>
          </div>
        )}

        {activeSection === 'target' && (
          <div className="admin-section">
            <div className="admin-section-title">🎯 Default Target Criteria</div>
            <div className="settings-group">
              <div>
                <label>Target Job Titles</label>
                <input value={target.titles} onChange={e => setTarget({ ...target, titles: e.target.value })} />
              </div>
              <div>
                <label>Institution Type</label>
                <input value={target.industry} onChange={e => setTarget({ ...target, industry: e.target.value })} />
              </div>
              <div className="form-row">
                <div>
                  <label>Institution Size</label>
                  <select value={target.size} onChange={e => setTarget({ ...target, size: e.target.value })}>
                    <option>Small (under 5,000 students)</option>
                    <option>Mid (5,000–20,000 students)</option>
                    <option>Large (20,000–50,000 students)</option>
                    <option>All sizes</option>
                  </select>
                </div>
                <div>
                  <label>Geography</label>
                  <input value={target.geo} onChange={e => setTarget({ ...target, geo: e.target.value })} />
                </div>
              </div>
              <div>
                <label>Buying Intent Signals</label>
                <textarea rows={2} value={target.signals} onChange={e => setTarget({ ...target, signals: e.target.value })} />
              </div>
            </div>
            <button className="save-btn" onClick={saveTarget}>Save Target Criteria</button>
          </div>
        )}

        {activeSection === 'prospects' && (
          <div className="admin-section">
            <div className="admin-section-title">📋 All Prospects ({prospects.length})</div>
            <div style={{ marginBottom: 16 }}>
              <button className="btn-sm btn-red" onClick={clearAllProspects}>🗑️ Clear All</button>
            </div>
            {prospects.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Title</th>
                      <th>Institution</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.title}</td>
                        <td>{p.institution}</td>
                        <td>
                          {p.researchStatus === 'done' && p.msgStatus === 'done' ? (
                            <span className="badge badge-li" style={{ background: 'rgba(200,241,53,0.1)', color: 'var(--a1)', border: '1px solid rgba(200,241,53,0.2)' }}>Complete</span>
                          ) : p.researchStatus === 'done' ? (
                            <span className="badge badge-li">Researched</span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(100,100,120,.15)', color: 'var(--muted)' }}>Pending</span>
                          )}
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn delete" onClick={() => deleteProspect(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                No prospects yet. Run the Autopilot to generate prospects.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
