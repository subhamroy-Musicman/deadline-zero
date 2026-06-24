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
import { AnimatePresence } from 'framer-motion';

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
    setActiveRoadmap 
  } = useStore();
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
    calculateMetrics();
  }, [calculateMetrics]);
  const [messages, setMessages] = useState<CoachMessage[]>([
    { 
      id: 'm1', 
      type: 'greeting', 
      text: 'Rescheduled 2 Tasks.\nDetected Burnout Risk.\nActivated Focus Mode.', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: 'm2', 
      type: 'suggestion', 
      text: 'Today&apos;s Recommendation:\nComplete Hackathon Project.\n\nReason: Highest deadline risk.', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: 'm3', 
      type: 'warning', 
      text: 'High-risk tasks detected. Review now or start a focus session?', 
      timestamp: new Date().toISOString(),
      actionable: true,
      focusTaskId: '1'
    }
  ]);
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

  if (!mounted) return <div className="page-layout glass-panel skeleton-loader"></div>;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Working late?";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <FocusModeOverlay tasks={tasks} onCompleteTask={handleCompleteTask} />
      <div className="page-layout">
        <div className="main-feed">
          <header className="page-header">
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Never Miss Another Deadline</h1>
            <p className="subtitle" style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>
              An autonomous AI agent that plans, prioritizes, and adapts your workload before tasks become overdue.
            </p>
          </div>
        </header>

        <MissionControl />
        <RoadmapProgressCard />

        <TaskInput onSubmit={handleTaskSubmit} isLoading={isProcessingTask} />

        <div className="task-list-section">
          <div className="section-header">
            <h3>Prioritized For You</h3>
            <span className="task-count">{tasks.filter(t => t.status !== 'completed').length} active</span>
          </div>

          <div className="task-list">
            <AnimatePresence>
              {sortedTasks.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="empty-tasks glass-card"
                  style={{ textAlign: 'center', padding: '3rem 2rem', marginTop: '1rem', border: '1px dashed rgba(var(--accent-primary-rgb, 139, 92, 246), 0.3)' }}
                >
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-primary)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.9 4.9l2.9 2.9"/><path d="M16.2 16.2l2.9 2.9"/><path d="M4.9 19.1l2.9-2.9"/><path d="M16.2 7.8l2.9-2.9"/></svg>
                  </div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Inbox Zero Achieved</h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>You have no pending tasks! Enter a brain-dump above to let the AI organize your next move.</p>
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

        <div style={{ marginTop: '1.5rem' }}>
          <AICoach messages={messages} isThinking={isCoachThinking} />
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 340px', gap: '1.5rem' }}>
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
    </div>
    </>
  );
}
