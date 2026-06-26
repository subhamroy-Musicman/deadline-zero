"use client";

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Search, SlidersHorizontal } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import './tasks.css';
import { AnimatePresence, motion } from 'framer-motion';

type FilterStatus = 'All' | 'Critical' | 'High Risk' | 'Upcoming' | 'Completed';

export default function TasksPage() {
  const { tasks, setTasks } = useStore();
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      switch (filter) {
        case 'Critical': return task.urgencyScore >= 80 && task.status !== 'completed';
        case 'High Risk': return task.urgencyScore >= 60 && task.urgencyScore < 80 && task.status !== 'completed';
        case 'Completed': return task.status === 'completed';
        case 'Upcoming': return task.status !== 'completed';
        default: return true;
      }
    }).sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [tasks, filter, searchQuery]);

  const handleCompleteTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'completed' as const } : t
    ));
  };

  return (
    <div className="tasks-page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Task Intelligence</h1>
          <p className="subtitle" style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>AI-prioritized master task list.</p>
        </div>
      </div>

      <div className="tasks-controls glass-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <SlidersHorizontal size={18} />
          {['All', 'Critical', 'High Risk', 'Upcoming', 'Completed'].map((f) => (
            <button 
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f as FilterStatus)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="task-list">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-tasks glass-card"
              style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}
            >
              No tasks found matching criteria.
            </motion.div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={handleCompleteTask} 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
