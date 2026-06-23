"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Flag, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import './RoadmapProgressCard.css';

export default function RoadmapProgressCard() {
  const { activeRoadmap, setActiveRoadmap } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!activeRoadmap) return null; // Only show if an active roadmap exists

  const progressPercent = Math.min((activeRoadmap.completedTasks / activeRoadmap.totalTasks) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="roadmap-card glass-panel"
    >
      <div className="roadmap-header">
        <div className="roadmap-title-group">
          <Map size={18} className="text-accent" />
          <h3 className="text-gradient">AI Roadmap Generator</h3>
        </div>
        <div className="roadmap-status-badge">
          Status: {activeRoadmap.phase}
        </div>
      </div>

      <div className="roadmap-goal">
        <span className="goal-label">Goal:</span>
        <span className="goal-text">{activeRoadmap.goal}</span>
      </div>

      <div className="roadmap-stats">
        <div className="stat-row">
          <span>{activeRoadmap.totalTasks} Tasks Generated</span>
          <span>{activeRoadmap.completedTasks} Completed</span>
        </div>
        
        <div className="roadmap-progress-bar">
          <motion.div 
            className="roadmap-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <button className="roadmap-reset-btn" onClick={() => {
        document.querySelector<HTMLInputElement>('.task-input')?.focus();
      }}>
        <RefreshCw size={14} /> Generate New Roadmap
      </button>
    </motion.div>
  );
}
