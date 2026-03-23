'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavProps {
  stats?: { gen: number; res: number; msg: number; rep: number };
}

export default function Navigation({ stats }: NavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Autopilot', icon: '🚀' },
    { href: '/admin', label: 'Admin', icon: '⚙️' },
    { href: '/admin/settings', label: 'Settings', icon: '🎯' },
    { href: '/admin/api-keys', label: 'API Keys', icon: '🔑' },
    { href: '/admin/prospects', label: 'Prospects', icon: '📋' },
    { href: '/admin/campaigns', label: 'Campaigns', icon: '📁' },
  ];

  return (
    <>
      <nav className="main-nav">
        <div className="nav-brand">
          <Link href="/" className="brand-link">
            <span className="brand-main">AUTO<span className="brand-sub">PILOT</span></span>
            <span className="brand-tag">for airr</span>
          </Link>
        </div>

        <div className="nav-links">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-status">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Ready</span>
          </div>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {stats && (
        <div className="nav-stats">
          <div className="nav-stat">
            <span className="nav-stat-n">{stats.gen}</span>
            <span className="nav-stat-l">Prospects</span>
          </div>
          <div className="nav-stat">
            <span className="nav-stat-n">{stats.res}</span>
            <span className="nav-stat-l">Researched</span>
          </div>
          <div className="nav-stat">
            <span className="nav-stat-n">{stats.msg}</span>
            <span className="nav-stat-l">Messages</span>
          </div>
        </div>
      )}
    </>
  );
}
