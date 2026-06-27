"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useStore } from '@/store/useStore';
import { Moon, Sun, Monitor, Palette, PlusCircle, LayoutDashboard, CheckSquare } from 'lucide-react';
import './CommandPalette.css';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setTheme, setMode } = useStore();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const openEvent = () => setOpen(true);

    document.addEventListener('keydown', down);
    document.addEventListener('open-command-palette', openEvent);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('open-command-palette', openEvent);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen} 
        label="Global Command Menu"
        className="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input placeholder="Type a command or search..." />
        
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          
          <Command.Group heading="Quick Actions">
            <Command.Item onSelect={() => {
              setOpen(false);
              document.querySelector<HTMLInputElement>('.task-input')?.focus();
            }}>
              <PlusCircle size={16} /> Create Task
            </Command.Item>
            <Command.Item onSelect={() => {
              setOpen(false);
              document.querySelector('.coach-messages')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <LayoutDashboard size={16} /> Ask AI Coach
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Appearance: Mode">
            <Command.Item onSelect={() => { setMode('dark'); setOpen(false); }}>
              <Moon size={16} /> Dark Mode
            </Command.Item>
            <Command.Item onSelect={() => { setMode('light'); setOpen(false); }}>
              <Sun size={16} /> Light Mode
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Appearance: Theme">
            {['cyberpunk', 'ocean', 'sunset', 'neon', 'aurora', 'synthwave', 'midnight'].map(t => (
              <Command.Item key={t} onSelect={() => { setTheme(t as any); setOpen(false); }}>
                <Palette size={16} /> {t.charAt(0).toUpperCase() + t.slice(1)}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </div>
  );
}
