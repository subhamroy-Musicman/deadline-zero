"use client";

import React, { useEffect } from 'react';
import { useStore, Theme, Mode } from '@/store/useStore';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { toast } from 'sonner';
import './ThemeSelector.css';

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'cyberpunk', label: 'Cyberpunk', color: '#fce819' },
  { id: 'ocean', label: 'Ocean', color: '#0bc5ea' },
  { id: 'sunset', label: 'Sunset', color: '#ed8936' },
  { id: 'neon', label: 'Neon', color: '#39ff14' },
  { id: 'aurora', label: 'Aurora', color: '#10b981' },
  { id: 'synthwave', label: 'Synthwave', color: '#ff007f' },
  { id: 'emerald', label: 'Emerald', color: '#34d399' },
  { id: 'crimson', label: 'Crimson', color: '#ef4444' },
  { id: 'midnight', label: 'Midnight', color: '#3b82f6' },
];

export default function ThemeSelector() {
  const { theme, mode, setTheme, setMode } = useStore();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`, {
      style: { background: 'var(--bg-surface)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)' }
    });
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    toast.success(`${newMode === 'dark' ? 'Dark' : 'Light'} mode enabled`, {
      style: { background: 'var(--bg-surface)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)' }
    });
  };

  return (
    <div className="theme-selector-wrapper">
      <div className="settings-section">
        <h4 className="settings-heading"><Palette size={14} /> Appearance</h4>
        
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${mode === 'light' ? 'active' : ''}`}
            onClick={() => handleModeChange('light')}
          >
            <Sun size={14} /> Light
          </button>
          <button 
            className={`mode-btn ${mode === 'dark' ? 'active' : ''}`}
            onClick={() => handleModeChange('dark')}
          >
            <Moon size={14} /> Dark
          </button>
        </div>

        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-dot ${theme === t.id ? 'active' : ''}`}
              style={{ backgroundColor: t.color }}
              title={t.label}
              onClick={() => handleThemeChange(t.id)}
            >
              {theme === t.id && <div className="theme-dot-inner" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
