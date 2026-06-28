"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, CheckCircle2, Clock, Music } from 'lucide-react';
import './FocusModeOverlay.css';
import confetti from 'canvas-confetti';

interface Props {
  tasks: { id: string; title: string }[];
  onCompleteTask: (id: string) => void;
}

export default function FocusModeOverlay({ tasks, onCompleteTask }: Props) {
  const { 
    activeFocusTaskId, 
    focusTimeRemaining, 
    updateFocusTime, 
    endFocusSession,
    logAgentAction
  } = useStore();
  
  const [mounted, setMounted] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeFocusTaskId || !isRunning) return;
    
    const interval = setInterval(() => {
      if (focusTimeRemaining <= 0) {
        setIsRunning(false);
        logAgentAction('Reflect', 'Focus session timer finished. Task incomplete.');
        clearInterval(interval);
        return;
      }
      updateFocusTime(focusTimeRemaining - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeFocusTaskId, isRunning, focusTimeRemaining, updateFocusTime, logAgentAction]);

  if (!mounted || !activeFocusTaskId) return null;

  const task = tasks.find(t => t.id === activeFocusTaskId) || { id: 'unknown', title: 'Unknown Task' };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    onCompleteTask(task.id);
    logAgentAction('Reflect', `Deep focus session successful. Task "${task.title}" completed.`);
    endFocusSession();
  };

  const handleEndEarly = () => {
    logAgentAction('Reflect', 'Focus session ended early by user.');
    endFocusSession();
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="focus-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="focus-content">
          <motion.div 
            className="focus-badge"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Clock size={16} /> Deep Work Session
          </motion.div>
          
          <motion.h2 
            className="focus-task-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
          >
            {task.title}
          </motion.h2>

          <motion.div 
            className="focus-timer"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
          >
            {formatTime(focusTimeRemaining)}
          </motion.div>

          <motion.div 
            className="focus-actions"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
          >
            <button className="focus-btn primary" onClick={handleComplete}>
              <CheckCircle2 size={20} /> Complete Task
            </button>
            <button className="focus-btn secondary" onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <><Square size={16} /> Pause</> : <><Play size={16} /> Resume</>}
            </button>
            <button 
              className="focus-btn secondary" 
              onClick={() => window.open('https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ', '_blank', 'noopener,noreferrer')}
              style={{ backgroundColor: '#1DB954', color: '#fff', borderColor: '#1DB954' }}
            >
              <Music size={16} /> Focus Playlist
            </button>
            <button className="focus-btn danger" onClick={handleEndEarly}>
              End Early
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
