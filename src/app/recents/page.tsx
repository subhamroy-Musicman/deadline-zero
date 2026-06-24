"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { History, BrainCircuit, Activity, CalendarCheck, TrendingUp, Filter } from 'lucide-react';
import AgentDecisionCard from '@/components/AgentDecisionCard';
import './page.css';

export default function RecentsPage() {
  const { decisionHistory, tasks, completedTaskDates } = useStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'decisions' | 'completed'>('decisions');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8"><div className="skeleton glass-panel h-64 w-full"></div></div>;

  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="recents-page">
      <div className="page-header">
        <h1><History size={28} className="text-accent" /> Recents & Archive</h1>
        <p className="text-secondary">Review past agent decisions and completed tasks.</p>
      </div>

      <div className="tabs glass-panel">
        <button 
          className={`tab-btn ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
          <BrainCircuit size={18} /> Decision Archive ({decisionHistory.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CalendarCheck size={18} /> Completed Tasks ({completedTasks.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'decisions' && (
          <div className="decision-archive">
            {decisionHistory.length === 0 ? (
              <div className="empty-archive glass-panel">
                <Activity size={32} className="text-muted" />
                <p>No AI decisions recorded yet.</p>
                <span>The agent will record decisions here automatically when it intervenes.</span>
              </div>
            ) : (
              decisionHistory.map(decision => (
                <AgentDecisionCard key={decision.id} decision={decision} />
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="completed-tasks-archive glass-panel">
            {completedTasks.length === 0 ? (
              <div className="empty-archive">
                <CalendarCheck size={32} className="text-muted" />
                <p>No completed tasks yet.</p>
              </div>
            ) : (
              <div className="completed-list">
                {completedTasks.map(task => (
                  <div key={task.id} className="completed-task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <div className="task-meta text-success">
                      Completed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
