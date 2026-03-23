'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface Prospect {
  id: number;
  name: string;
  title: string;
  institution: string;
  location: string;
  size: string;
  temperature: string;
  researchStatus: string;
  msgStatus: string;
  createdAt: string;
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    try {
      const res = await fetch('/api/prospects');
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (e) {
      console.error('Failed to load prospects');
    }
    setLoading(false);
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

  const clearAll = async () => {
    if (!confirm('Delete ALL prospects? This cannot be undone.')) return;
    try {
      await fetch('/api/prospects', { method: 'DELETE' });
      loadProspects();
    } catch (e) {
      console.error('Failed to clear');
    }
  };

  const filteredProspects = prospects.filter(p => {
    const matchesSearch = search === '' || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.institution.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'complete') return matchesSearch && p.researchStatus === 'done' && p.msgStatus === 'done';
    if (filter === 'partial') return matchesSearch && (p.researchStatus === 'done' || p.msgStatus === 'done') && !(p.researchStatus === 'done' && p.msgStatus === 'done');
    if (filter === 'pending') return matchesSearch && p.researchStatus !== 'done' && p.msgStatus !== 'done';
    return matchesSearch;
  });

  return (
    <>
      <Navigation />
      <div className="wrap">
        <div className="settings-card">
          <div className="settings-card-title">
            📋 All Prospects ({prospects.length})
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input 
              className="form-input" 
              placeholder="Search prospects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <select 
              className="form-input" 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All</option>
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
            <button className="btn-sm btn-red" onClick={clearAll}>
              🗑️ Clear All
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              Loading prospects...
            </div>
          ) : filteredProspects.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Institution</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {p.temperature === 'hot' ? '🔥 Hot' : '🌡 Warm'}
                        </div>
                      </td>
                      <td>{p.title}</td>
                      <td>
                        <div>{p.institution}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.size}</div>
                      </td>
                      <td>{p.location}</td>
                      <td>
                        {p.researchStatus === 'done' && p.msgStatus === 'done' ? (
                          <span className="badge badge-li" style={{ background: 'rgba(200,241,53,0.1)', color: 'var(--a1)', border: '1px solid rgba(200,241,53,0.2)' }}>
                            ✓ Complete
                          </span>
                        ) : p.researchStatus === 'done' ? (
                          <span className="badge badge-li">✓ Researched</span>
                        ) : p.msgStatus === 'done' ? (
                          <span className="badge badge-li">✓ Messages</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(100,100,120,.15)', color: 'var(--muted)' }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn delete" onClick={() => deleteProspect(p.id)}>
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
              <div className="empty-icon">📋</div>
              No prospects found. Run the Autopilot to generate prospects.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
