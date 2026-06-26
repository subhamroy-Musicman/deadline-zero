"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Calendar, CheckSquare, LayoutDashboard, Settings, History, Trash2, ChevronLeft, ChevronRight, Zap, User } from 'lucide-react';
import './Sidebar.css';
import ThemeSelector from './ThemeSelector';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { isSidebarCollapsed, toggleSidebar, clearDashboard, user, setUser } = useStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({ uid: firebaseUser.uid, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL });
        } else {
          setUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, [setUser]);

  if (!mounted) return <aside className="sidebar glass-panel" style={{ opacity: 0 }}></aside>;

  return (
    <aside className={`sidebar glass-panel ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo animate-pulse-glow" style={{ background: 'transparent', border: 'none', padding: '0' }}>
            <img src="/logo.png" alt="Deadline Zero Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
          {!isSidebarCollapsed && <h2 className="text-gradient">Deadline Zero</h2>}
        </div>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`} title="Dashboard">
          <LayoutDashboard size={20} />
          {!isSidebarCollapsed && <span>Dashboard</span>}
        </Link>
        <Link href="/tasks" className={`nav-item ${pathname === '/tasks' ? 'active' : ''}`} title="Tasks">
          <CheckSquare size={20} />
          {!isSidebarCollapsed && <span>Tasks</span>}
        </Link>
        <Link href="/schedule" className={`nav-item ${pathname === '/schedule' ? 'active' : ''}`} title="Schedule">
          <Calendar size={20} />
          {!isSidebarCollapsed && <span>Schedule</span>}
        </Link>
        <Link href="/recents" className={`nav-item ${pathname === '/recents' ? 'active' : ''}`} title="Recents & Archive">
          <History size={20} />
          {!isSidebarCollapsed && <span>Recents</span>}
        </Link>
      </nav>
      
      <div className="sidebar-actions" style={{ marginTop: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={clearDashboard}
          title="Clear Dashboard"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <Trash2 size={16} />
          {!isSidebarCollapsed && "Clear Dashboard"}
        </button>
      </div>

      <div className="sidebar-footer">
        {user ? (
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            ) : (
              <User size={28} style={{ padding: '4px', background: 'var(--bg-elevated)', borderRadius: '50%' }} />
            )}
            {!isSidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.displayName || 'User'}</span>
                <button 
                  onClick={() => auth && signOut(auth)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'left', cursor: 'pointer', padding: 0 }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={async () => {
              if (auth) {
                try {
                  const provider = new GoogleAuthProvider();
                  await signInWithPopup(auth, provider);
                } catch (err) {
                  console.error("Auth error", err);
                  alert("Authentication failed. See console for details.");
                }
              } else {
                alert("Firebase is not configured! Please add NEXT_PUBLIC_FIREBASE_API_KEY and other credentials to your .env.local file.");
              }
            }}
            title="Sign in with Google"
          >
            <User size={16} />
            {!isSidebarCollapsed && <span>Sign In</span>}
          </button>
        )}

        <div className="ai-status" title="AI Coach Active">
          <div className="status-dot"></div>
          {!isSidebarCollapsed && <span>AI Coach Active</span>}
        </div>
        
        <div className="settings-accordion">
          <button 
            className="settings-toggle-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Settings"
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <Settings size={16} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
          
          {isSettingsOpen && (
            <div className="settings-content glass-panel" style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px' }}>
              <ThemeSelector />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
