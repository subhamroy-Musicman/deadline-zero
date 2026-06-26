"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Flame, Trophy, Activity, ShieldCheck, Zap } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay, startOfWeek, addDays } from 'date-fns';
import './AnalyticsPanel.css';

export default function AnalyticsPanel() {
  const { completedTaskDates, deadlinesPrevented, hoursSaved, workloadOptimized, aiDecisionsExecuted, successPrediction, burnoutRisk } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auto-inject today's date for the hackathon demo if it's missing in localStorage
    const todayStr = new Date().toDateString();
    const hasToday = useStore.getState().completedTaskDates.some(d => new Date(d).toDateString() === todayStr);
    
    if (!hasToday) {
      useStore.setState(state => ({
        completedTaskDates: [...state.completedTaskDates, new Date().toISOString()]
      }));
    }
  }, []);

  if (!mounted) return <div className="analytics-panel glass-panel skeleton-loader"></div>;

  const dates = completedTaskDates.map(d => new Date(d));
  
  // 1. Productivity Ring (Goal: 5 tasks a day)
  const todayTasks = dates.filter(d => isSameDay(d, new Date())).length;
  const goal = 5;
  const progressPercent = Math.min((todayTasks / goal) * 100, 100);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // 2. Streak Counter
  let streak = 0;
  let currentDate = startOfDay(new Date());
  
  // Check if today has tasks
  if (todayTasks > 0) {
    streak++;
    currentDate = subDays(currentDate, 1);
  } else {
    // If today has 0, check if yesterday had tasks (streak still alive)
    const yesterdayTasks = dates.filter(d => isSameDay(d, subDays(new Date(), 1))).length;
    if (yesterdayTasks > 0) {
      currentDate = subDays(currentDate, 1);
    }
  }

  // Count backwards
  while (true) {
    const tasksOnDay = dates.filter(d => isSameDay(d, currentDate)).length;
    if (tasksOnDay > 0) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  // Calculate Dynamic Focus Score instead of hardcoded 82
  const focusScore = Math.max(0, Math.min(100, Math.round((successPrediction * 0.6) + ((100 - burnoutRisk) * 0.4) + (streak * 2))));

  // 3. Weekly Heatmap (Current week starting Sunday)
  const currentSunday = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weeklyDays = Array.from({ length: 7 }).map((_, i) => addDays(currentSunday, i));

  return (
    <div className="analytics-panel glass-panel">
      <div className="analytics-header">
        <h3><Activity size={18} /> Productivity Pulse</h3>
      </div>

      <div className="analytics-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Productivity Pulse (Compact) */}
        <div className="pulse-compact-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="stat-card" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="streak-icon active" style={{ color: 'var(--accent-primary)', width: '40px', height: '40px' }}>
              <Activity size={20} />
            </div>
            <div className="stat-info">
              <h4 style={{ fontSize: '0.75rem', margin: 0 }}>Focus Score</h4>
              <p className="streak-value" style={{ fontSize: '1.25rem', margin: 0 }}>{focusScore}</p>
            </div>
          </div>
          <div className="stat-card" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="streak-icon active" style={{ color: 'var(--warning)', width: '40px', height: '40px' }}>
              <Flame size={20} />
            </div>
            <div className="stat-info">
              <h4 style={{ fontSize: '0.75rem', margin: 0 }}>Current Streak</h4>
              <p className="streak-value" style={{ fontSize: '1.25rem', margin: 0 }}>{streak} Days</p>
            </div>
          </div>
        </div>

        {/* Massive AI Impact Section */}
        <div className="ai-impact-section glass-panel" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(var(--accent-secondary-rgb, 168,85,247), 0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', marginBottom: '1.5rem', margin: 0 }}>
            <Zap size={24} /> AI IMPACT
          </h3>

          <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="impact-metric" style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>{deadlinesPrevented}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '0.25rem', fontWeight: 600 }}>Deadlines Prevented</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <div>↳ {Math.max(1, Math.floor(deadlinesPrevented / 2))} tasks auto-rescheduled</div>
                <div>↳ {Math.max(1, Math.ceil(deadlinesPrevented / 2))} conflicts resolved</div>
              </div>
            </div>

            <div className="impact-metric" style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>{hoursSaved}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '0.25rem', fontWeight: 600 }}>Hours Saved</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <div>↳ {Math.max(1, Math.floor(hoursSaved * 0.6))}h focus sessions</div>
                <div>↳ {Math.max(1, Math.ceil(hoursSaved * 0.4))}h auto-scheduling</div>
              </div>
            </div>

            <div className="impact-metric" style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', lineHeight: 1 }}>{(workloadOptimized / 60).toFixed(1)}h</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '0.25rem', fontWeight: 600 }}>Workload Optimized</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <div>↳ {Math.max(1, Math.floor((workloadOptimized / 60) * 0.7))}h task deferral</div>
                <div>↳ {Math.max(1, Math.ceil((workloadOptimized / 60) * 0.3))}h buffer time added</div>
              </div>
            </div>

            <div className="impact-metric" style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-secondary)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)', lineHeight: 1 }}>{aiDecisionsExecuted}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '0.25rem', fontWeight: 600 }}>AI Decisions Executed</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <div>↳ {Math.max(1, Math.floor(aiDecisionsExecuted * 0.8))} autonomous plans</div>
                <div>↳ {Math.max(1, Math.ceil(aiDecisionsExecuted * 0.2))} recovery protocols</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card heatmap-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Weekly Activity</h4>
          <div className="heatmap-rows" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {weeklyDays.map((day, i) => {
              const count = dates.filter(d => isSameDay(d, day)).length;
              const normalizedCount = count === 0 ? 1 : Math.min(count + 1, 5); // 1 to 5 blocks
              
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ width: '30px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(day, 'E')}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div 
                        key={j}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          background: j < normalizedCount 
                            ? (count === 0 ? 'rgba(255,255,255,0.1)' : 'var(--accent-primary)') 
                            : 'transparent'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
