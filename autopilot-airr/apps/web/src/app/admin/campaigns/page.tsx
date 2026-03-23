'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface Campaign {
  id: number;
  name: string;
  config: string;
  status: string;
  createdAt: string;
  prospectCount: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '' });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error('Failed to load campaigns');
    }
    setLoading(false);
  };

  const createCampaign = async () => {
    if (!newCampaign.name.trim()) return;
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCampaign.name }),
      });
      setNewCampaign({ name: '' });
      setShowModal(false);
      loadCampaigns();
    } catch (e) {
      console.error('Failed to create campaign');
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      loadCampaigns();
    } catch (e) {
      console.error('Failed to delete');
    }
  };

  return (
    <>
      <Navigation />
      <div className="wrap">
        <div className="settings-card">
          <div className="settings-card-title">
            📁 Campaigns
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Organize your outreach into campaigns. Each campaign has its own prospect list and configuration.
            </p>
            <button className="save-btn" onClick={() => setShowModal(true)}>
              + New Campaign
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              Loading campaigns...
            </div>
          ) : campaigns.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Prospects</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'badge-li' : ''}`} style={c.status !== 'active' ? { background: 'rgba(100,100,120,.15)', color: 'var(--muted)' } : {}}>
                          {c.status === 'active' ? '● Active' : c.status === 'completed' ? '✓ Completed' : '○ Draft'}
                        </span>
                      </td>
                      <td>{c.prospectCount || 0}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn" onClick={() => deleteCampaign(c.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              No campaigns yet. Create your first campaign to get started.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20 }}>Create New Campaign</h3>
            <div className="form-group">
              <label className="form-label">Campaign Name</label>
              <input 
                className="form-input" 
                value={newCampaign.name}
                onChange={e => setNewCampaign({ name: e.target.value })}
                placeholder="e.g., Q1 Higher Ed Outreach"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-sm btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={createCampaign}>Create Campaign</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          max-width: 400px;
        }
      `}</style>
    </>
  );
}
