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
