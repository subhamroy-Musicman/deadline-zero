"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import confetti from 'canvas-confetti';
import { useStore } from '../store/useStore';
import { Task } from '../types';

import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  const [mounted, setMounted] = React.useState(false);
  const { recordTaskCompletion, startFocusSession } = useStore();
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'completed') return;
    
    // Fire confetti from the button's position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#10b981', '#34d399', '#fce819']
    });

    const isHighRisk = task.urgencyScore >= 70 || isOverdue;
    recordTaskCompletion(isHighRisk);
    onComplete(task.id);
  };

  const deadlineDate = new Date(task.deadline);
  const isOverdue = isPast(deadlineDate) && task.status !== 'completed';
  
  // Calculate color based on urgency
  const getUrgencyColor = () => {
    if (task.status === 'completed') return 'var(--success)';
    if (isOverdue) return 'var(--danger)';
    if (task.urgencyScore >= 80) return 'var(--danger)';
    if (task.urgencyScore >= 50) return 'var(--warning)';
    return 'var(--accent-primary)';
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, translateY: -4 }}
      className={`task-card glass-card ${task.status === 'completed' ? 'completed' : ''}`}
      style={{ '--task-color': getUrgencyColor() } as React.CSSProperties}
    >
      <div className="task-urgency-indicator"></div>
      
      <div className="task-content">
        <div className="task-header">
          <h4 className={task.status === 'completed' ? 'line-through' : ''}>{task.title}</h4>
          <div className="task-score" title="AI Priority Score">
            <SparklesIcon /> {task.urgencyScore}
          </div>
        </div>
        
        {task.description && <p className="task-desc">{task.description}</p>}

        {task.reasoning && task.reasoning.length > 0 && (
          <div className="task-reasoning-panel">
            <div className="reasoning-title">Why?</div>
            <ul className="reasoning-list">
              {task.reasoning.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="task-meta">
          <div className={`task-deadline ${isOverdue ? 'overdue' : ''}`}>
            {isOverdue ? <AlertTriangle size={14} /> : <Clock size={14} />}
            <span>
              {!mounted ? '--:--' : isOverdue 
                ? `Overdue by ${formatDistanceToNow(deadlineDate)}`
                : `Due ${format(deadlineDate, 'MMM d, h:mm a')}`}
            </span>
          </div>
          {task.estimatedMinutes && (
            <div className="task-duration">
              ~{task.estimatedMinutes} min
            </div>
          )}
        </div>

        {task.status !== 'completed' && !isOverdue && (
          <div className="task-schedule-suggestion">
            <SparklesIcon />
            <span>Recommended Work Slot: <strong>Today 7:00 PM - 8:00 PM</strong></span>
          </div>
        )}

        {task.subTasks && task.subTasks.length > 0 && (
          <div className="task-subtasks">
            <div className="subtasks-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${task.status === 'completed' ? 100 : (task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100}%` }}
                ></div>
              </div>
              <span>{task.status === 'completed' ? task.subTasks.length : task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} steps</span>
            </div>
            <div className="subtasks-list" style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {task.subTasks.map(st => (
                <label key={st.id} className="subtask-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', opacity: st.completed || task.status === 'completed' ? 0.6 : 1 }}>
                  <input 
                    type="checkbox" 
                    checked={st.completed || task.status === 'completed'}
                    disabled={task.status === 'completed'}
                    onChange={(e) => {
                      e.stopPropagation();
                      useStore.getState().toggleSubTask(task.id, st.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ textDecoration: (st.completed || task.status === 'completed') ? 'line-through' : 'none' }}>
                    {st.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {task.status !== 'completed' && (
          <div className="task-actions-row">
            <button 
              className="start-focus-btn" 
              onClick={(e) => {
                e.stopPropagation();
                startFocusSession(task.id, task.estimatedMinutes || 45);
              }}
            >
              <Clock size={12} /> Deep Work
            </button>
          </div>
        )}
      </div>

      <button 
        className="task-complete-btn" 
        onClick={handleComplete}
        disabled={task.status === 'completed'}
      >
        {task.status === 'completed' ? <CheckCircle2 size={24} className="text-success" /> : <div className="circle-check"></div>}
      </button>
    </motion.div>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
    </svg>
  );
}
