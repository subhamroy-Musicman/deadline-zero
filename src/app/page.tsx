"use client";

import React, { useState, useEffect } from 'react';
import TaskInput from '@/components/TaskInput';
import TaskCard from '@/components/TaskCard';
import AICoach from '@/components/AICoach';
import AgentActivityFeed from '@/components/AgentActivityFeed';
import MissionControl from '@/components/MissionControl';
import RoadmapProgressCard from '@/components/RoadmapProgressCard';
import HabitTracker from '@/components/HabitTracker';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import FocusModeOverlay from '@/components/FocusModeOverlay';
import AIInterventionTimeline from '@/components/AIInterventionTimeline';
import { useStore } from '@/store/useStore';
import { Task, CoachMessage } from '@/types';
import './page.css';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { 
    tasks,
    setTasks,
    clearAgentLogs, 
    logAgentAction, 
    calculateMetrics,
    addTask,
    startFocusSession,
    setActiveRoadmap,
    decisionHistory,
    deadlinesPrevented,
    hoursSaved,
    burnoutRisk,
    aiDecisionsExecuted,
    triggerJudgeDemoMode
  } = useStore();
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
    calculateMetrics();
  }, [calculateMetrics]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);

  useEffect(() => {
    // Generate functional AI messages based on actual tasks
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    if (pendingTasks.length === 0) {
      setMessages([]);
      return;
    }

    const newMessages: CoachMessage[] = [];
    
    // Sort by urgency
    const sortedByUrgency = [...pendingTasks].sort((a, b) => b.urgencyScore - a.urgencyScore);
    const topTask = sortedByUrgency[0];

    // Today's recommendation
    newMessages.push({
      id: 'rec-1',
      type: 'suggestion',
      text: `Today's Recommendation:\n${topTask.title}\n\nReason: Highest priority (${topTask.urgencyScore}/100 urgency score).`,
      timestamp: new Date().toISOString()
    });

    // High risk warning if any task is overdue or due within 24h
    const hasHighRisk = pendingTasks.some(t => {
      const msLeft = new Date(t.deadline).getTime() - Date.now();
      return msLeft < 86400000; // less than 24 hours
    });

    if (hasHighRisk) {
      const riskiestTask = pendingTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
      newMessages.push({
        id: 'warn-1',
        type: 'warning',
        text: `High-risk deadline detected for: ${riskiestTask.title}. Review now or start a focus session?`,
        timestamp: new Date().toISOString(),
        actionable: true,
        focusTaskId: riskiestTask.id
      });
    }

    setMessages(newMessages);
  }, [tasks]);
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);

  const handleTaskSubmit = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessingTask(true);
    setIsCoachThinking(true);
    
    try {
      if (text.startsWith('[ROADMAP] ')) {
        const goal = text.replace('[ROADMAP] ', '');
        const res = await fetch('/api/generateRoadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal })
        });
        
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        // Append tasks
        setTasks(prev => [...data.tasks, ...prev]);
        
        // Push agent logs to store
        if (data.agentLogs) {
          clearAgentLogs(); // clear previous for dramatic effect
          data.agentLogs.forEach((log: any, i: number) => {
            setTimeout(() => {
              logAgentAction(log.stage, log.message);
            }, i * 1000); // Stagger logs visually
          });
          
          // Add to Roadmap State
          setActiveRoadmap({
            goal: text.replace('[ROADMAP]', '').trim(),
            totalTasks: data.tasks.length,
            completedTasks: 0,
            phase: 'Phase 1'
          });

          setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type: 'suggestion',
            text: `I've broken down "${goal}" into a structured roadmap and assigned priorities based on your history.`,
            timestamp: new Date().toISOString()
          }]);
        }

      } else {
        // Standard parseTasks stub
        const res = await fetch('/api/parseTasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, currentTasks: tasks })
        });
      
        if (!res.ok) throw new Error('API Error');
      
        const data = await res.json();
      
        if (data.newTasks && data.newTasks.length > 0) {
          setTasks(prev => [...data.newTasks, ...prev]);
        }
      
        if (data.coachMessage) {
          const msgId = data.coachMessage.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
          setMessages(prev => [...prev, { ...data.coachMessage, id: msgId }]);
        }
      }
      
    } catch (error) {
      console.error(error);
      // Fallback if API fails
      setTasks(prev => [{
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: text,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        urgencyScore: 50,
        status: 'pending'
      }, ...prev]);
    } finally {
      setIsProcessingTask(false);
      setIsCoachThinking(false);
    }
  };

  const handleCompleteTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'completed' as const } : t
    ));
  };

  const sortedTasks = [...tasks].sort((a, b) => b.urgencyScore - a.urgencyScore);

  if (!mounted) return <div className="page-layout glass-panel skeleton-loader" suppressHydrationWarning></div>;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Working late?";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleBrainDump = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  const handleImportWorkload = () => {
    setIsProcessingTask(true);
    setTimeout(() => {
      useStore.getState().addTask({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        title: 'Finalize Pitch Deck',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        urgencyScore: 85,
        status: 'pending',
        estimatedMinutes: 120,
        confidenceScore: 90,
        reasoning: ["Imported from Google Calendar", "High priority client meeting"]
      });
      useStore.getState().addTask({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7) + '2',
        title: 'Review PRs',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        urgencyScore: 40,
        status: 'pending',
        estimatedMinutes: 45,
        confidenceScore: 95,
        reasoning: ["Imported from GitHub", "Routine maintenance"]
      });
      useStore.getState().calculateMetrics();
      setIsProcessingTask(false);
    }, 1500);
  };

  return (
    <>
      <FocusModeOverlay tasks={tasks} onCompleteTask={handleCompleteTask} />
      <div className="page-layout">
        <div className="main-feed">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="page-header" 
            style={{ marginBottom: '1.5rem' }}
          >
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Never Miss Another Deadline</h1>
            <p className="subtitle" style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>
              An autonomous AI agent that plans, prioritizes, and adapts your workload before tasks become overdue.
            </p>
          </motion.header>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
            className="executive-banner glass-panel" 
            style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>TODAY THE AGENT</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <span style={{ color: 'var(--success-color)' }}>✓</span> Prevented {deadlinesPrevented} deadline failures
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <span style={{ color: 'var(--success-color)' }}>✓</span> Saved {hoursSaved} hours
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <span style={{ color: 'var(--success-color)' }}>✓</span> Reduced burnout risk to {burnoutRisk}%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <span style={{ color: 'var(--success-color)' }}>✓</span> Executed {aiDecisionsExecuted} autonomous decisions
              </div>
            </div>
            {decisionHistory.length > 0 && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                <strong style={{ color: 'var(--text-primary)', fontStyle: 'normal' }}>Last Decision:</strong> &ldquo;{decisionHistory[decisionHistory.length - 1].decision}&rdquo;
              </div>
            )}
          </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.15 }}>
          <MissionControl />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}>
          <RoadmapProgressCard />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.25 }}>
          <TaskInput onSubmit={handleTaskSubmit} isLoading={isProcessingTask} />
        </motion.div>

        <div className="task-list-section">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="section-header"
          >
            <h3>Prioritized For You</h3>
            <span className="task-count">{tasks.filter(t => t.status !== 'completed').length} active</span>
          </motion.div>

          <div className="task-list">
            <AnimatePresence>
              {sortedTasks.length === 0 && (
                <motion.div 
                  key="empty-tasks-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="empty-tasks glass-card"
                  style={{ padding: '3rem 2rem', marginTop: '1rem' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-primary)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.9 4.9l2.9 2.9"/><path d="M16.2 16.2l2.9 2.9"/><path d="M4.9 19.1l2.9-2.9"/><path d="M16.2 7.8l2.9-2.9"/></svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Agent on Standby</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>There are currently no tasks in your queue. Initialize the agent by selecting an option below.</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button onClick={triggerJudgeDemoMode} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', cursor: 'pointer', border: '1px solid var(--accent-glow)' }}>
                      <span style={{ fontSize: '1.5rem' }}>🚀</span>
                      <strong style={{ color: 'var(--text-primary)' }}>Generate Demo Scenario</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overloaded student simulation</span>
                    </button>
                    
                    <button onClick={handleBrainDump} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', cursor: 'pointer' }}>
                      <span style={{ fontSize: '1.5rem' }}>🧠</span>
                      <strong style={{ color: 'var(--text-primary)' }}>Brain Dump Tasks</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Write freely in the input above</span>
                    </button>
                    
                    <button onClick={handleImportWorkload} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', cursor: 'pointer' }}>
                      <span style={{ fontSize: '1.5rem' }}>📥</span>
                      <strong style={{ color: 'var(--text-primary)' }}>Import Workload</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sync from external calendars</span>
                    </button>
                  </div>
                </motion.div>
              )}
              {sortedTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={handleCompleteTask} 
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AgentActivityFeed />
          <AIInterventionTimeline />
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <AnalyticsPanel />
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <HabitTracker />
        </div>
      </div>
      <aside className="right-sidebar" style={{ position: 'sticky', top: '1.5rem', height: 'max-content' }}>
        <AICoach messages={messages} isThinking={isCoachThinking} />
      </aside>
    </div>
    </>
  );
}
