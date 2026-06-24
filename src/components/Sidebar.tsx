"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, CheckSquare, LayoutDashboard, Settings, User } from 'lucide-react';
import './Sidebar.css';
import ThemeSelector from './ThemeSelector';
import DemoControls from './DemoControls';

import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo animate-pulse-glow" style={{ background: 'transparent', border: 'none', padding: '0' }}>
          <img src="/logo.png" alt="Deadline Zero Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </div>
        <h2 className="text-gradient">Deadline Zero</h2>
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/tasks" className={`nav-item ${pathname === '/tasks' ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>Tasks</span>
        </Link>
        <Link href="/schedule" className={`nav-item ${pathname === '/schedule' ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Schedule</span>
        </Link>
      </nav>
      
      <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
        <button 
          onClick={() => {
            const { useStore } = require('../store/useStore');
            useStore.getState().triggerJudgeDemoMode();
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
        >
          Run AI Stress Test
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="ai-status">
          <div className="status-dot"></div>
          <span>AI Coach Active</span>
        </div>
        
        <div className="settings-accordion">
          <button 
            className="settings-toggle-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          {isSettingsOpen && (
            <div className="settings-content glass-panel" style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px' }}>
              <ThemeSelector />
              <DemoControls />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
