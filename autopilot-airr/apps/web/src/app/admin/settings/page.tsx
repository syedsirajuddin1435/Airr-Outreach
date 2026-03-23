'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState({
    name: 'Syed Sirajuddin',
    role: 'Account Executive',
    company: 'OneOrigin',
    product: 'airr',
    tone: 'consultative and direct',
    value: '',
    icp: '',
  });
  const [target, setTarget] = useState({
    titles: 'Director of Admissions, VP Enrollment Management, University Registrar, Director of Enrollment Technology',
    industry: 'Universities, Liberal Arts Colleges, Community Colleges, Graduate Schools',
    size: 'Mid (5,000–20,000 students)',
    geo: 'United States',
    signals: 'Using Slate/Salesforce CRM, running Ellucian Banner/Colleague, hiring admissions staff, announced enrollment growth targets, digitization/modernization initiative',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.profile) {
        setProfile({
          name: data.profile.name || 'Syed Sirajuddin',
          role: data.profile.role || 'Account Executive',
          company: data.profile.company || 'OneOrigin',
          product: data.profile.product || 'airr',
          tone: data.profile.tone || 'consultative and direct',
          value: data.profile.value || '',
          icp: data.profile.icp || '',
        });
      }
      if (data.target) {
        setTarget({
          titles: data.target.titles || '',
          industry: data.target.industry || '',
          size: data.target.size || 'Mid (5,000–20,000 students)',
          geo: data.target.geo || 'United States',
          signals: data.target.signals || '',
        });
      }
    } catch (e) {
      console.error('Failed to load settings');
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', data: profile }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save profile settings' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save profile settings' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const saveTarget = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'target', data: target }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Target criteria saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save target criteria' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save target criteria' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <>
      <Navigation />
      <div className="wrap">
        <div className="settings-card">
          <div className="settings-card-title">
            👤 Sales Profile
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
            Configure your sales persona - this information is used to personalize all outreach messages.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input 
                className="form-input" 
                value={profile.name} 
                onChange={e => setProfile({ ...profile, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Your Role</label>
              <input 
                className="form-input" 
                value={profile.role} 
                onChange={e => setProfile({ ...profile, role: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input 
                className="form-input" 
                value={profile.company} 
                onChange={e => setProfile({ ...profile, company: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input 
                className="form-input" 
                value={profile.product} 
                onChange={e => setProfile({ ...profile, product: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tone of Voice</label>
              <input 
                className="form-input" 
                value={profile.tone} 
                onChange={e => setProfile({ ...profile, tone: e.target.value })}
                placeholder="e.g., consultative and direct"
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Product Value Proposition</label>
              <textarea 
                className="form-input form-textarea" 
                value={profile.value} 
                onChange={e => setProfile({ ...profile, value: e.target.value })}
                placeholder="Describe your product's key benefits and value..."
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Ideal Customer Profile (ICP)</label>
              <textarea 
                className="form-input form-textarea" 
                value={profile.icp} 
                onChange={e => setProfile({ ...profile, icp: e.target.value })}
                placeholder="Describe your ideal customer..."
              />
            </div>
          </div>

          <div className="save-section">
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              This information is used to generate personalized outreach messages.
            </span>
            <button className="save-btn" onClick={saveProfile} disabled={saving}>
              {saving ? '💾 Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-title">
            🎯 Target Criteria
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
            Define who you want to target for outreach campaigns.
          </p>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Target Job Titles</label>
              <input 
                className="form-input" 
                value={target.titles} 
                onChange={e => setTarget({ ...target, titles: e.target.value })} 
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Institution Type</label>
              <input 
                className="form-input" 
                value={target.industry} 
                onChange={e => setTarget({ ...target, industry: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Institution Size</label>
              <select 
                className="form-input"
                value={target.size}
                onChange={e => setTarget({ ...target, size: e.target.value })}
              >
                <option>Small (under 5,000 students)</option>
                <option>Mid (5,000–20,000 students)</option>
                <option>Large (20,000–50,000 students)</option>
                <option>All sizes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Geography</label>
              <input 
                className="form-input" 
                value={target.geo} 
                onChange={e => setTarget({ ...target, geo: e.target.value })} 
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Buying Intent Signals</label>
              <textarea 
                className="form-input form-textarea" 
                value={target.signals} 
                onChange={e => setTarget({ ...target, signals: e.target.value })}
                placeholder="What signals indicate a prospect is ready to buy?"
              />
            </div>
          </div>

          <div className="save-section">
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              These criteria are used to generate targeted prospect lists.
            </span>
            <button className="save-btn" onClick={saveTarget} disabled={saving}>
              {saving ? '💾 Saving...' : '💾 Save Target Criteria'}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'success-toast' : 'error-toast'}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}
    </>
  );
}
