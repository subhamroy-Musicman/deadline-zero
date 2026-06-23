"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import './HabitTracker.css';

export default function HabitTracker() {
  const { habits, completeHabit, logAgentAction } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="habit-tracker skeleton" />;

  const handleComplete = (id: string, title: string, streak: number) => {
    completeHabit(id);
    logAgentAction('Reflect', `User completed habit: ${title}. Streak is now ${streak + 1}.`);
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f97316', '#eab308']
    });
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  return (
    <details className="habit-tracker glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
      <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        <CheckCircle2 size={16} /> Habit Tracking ▾
      </summary>
      
      <div style={{ marginTop: '1rem' }}>
        <div className="habit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Daily Habits</h3>
          <span className="habit-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Build momentum</span>
        </div>

        <div className="habits-list">
          {habits.map(habit => {
            const isCompletedToday = habit.lastCompleted ? isSameDay(new Date(habit.lastCompleted), new Date()) : false;
            
            return (
              <div key={habit.id} className={`habit-item ${isCompletedToday ? 'completed' : ''}`}>
                <div className="habit-info">
                  <span className="habit-name">{habit.title}</span>
                  <div className="habit-streak">
                    <Flame size={12} className={habit.streak > 0 ? 'text-orange-400' : 'text-gray-500'} />
                    <span>{habit.streak} day streak</span>
                  </div>
                  {isCompletedToday && habit.source && (
                    <div className="habit-source" style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                      Auto-completed: {habit.source}
                    </div>
                  )}
                </div>
                
                <button 
                  className={`habit-check-btn ${isCompletedToday ? 'checked' : ''}`}
                  onClick={() => {
                    completeHabit(habit.id);
                    logAgentAction('Reflect', `User completed habit: ${habit.title}.`);
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#f97316', '#eab308'] });
                  }}
                  disabled={isCompletedToday}
                  aria-label={`Mark ${habit.title} as complete`}
                >
                  <CheckCircle2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
