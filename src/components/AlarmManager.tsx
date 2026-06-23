"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Clock, Zap } from 'lucide-react';
import './AlarmManager.css';

export default function AlarmManager() {
  const { events, dismissAlarm, snoozeAlarm, logAgentAction } = useStore();
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Poll every second to check for alarms
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarm) return; // Don't trigger another while one is active

      const now = Date.now();
      const triggeredEvent = events.find(e => {
        if (!e.isAlarmSet || e.alarmDismissed) return false;
        const startTime = new Date(e.startTime).getTime();
        // Trigger if we are exactly at or past the start time (within a 1 minute window to avoid old stale alarms triggering)
        return now >= startTime && now <= startTime + 60000;
      });

      if (triggeredEvent) {
        setActiveAlarm(triggeredEvent.id);
        playSoftChime();
        logAgentAction('Observe', `Alarm triggered for event: "${triggeredEvent.title}"`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [events, activeAlarm, logAgentAction]);

  const playSoftChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn("Audio context failed (might require user interaction first)", e);
    }
  };

  if (!activeAlarm) return null;

  const event = events.find(e => e.id === activeAlarm);
  if (!event) return null;

  const handleDismiss = () => {
    dismissAlarm(event.id);
    setActiveAlarm(null);
  };

  const handleSnooze = (minutes: number) => {
    snoozeAlarm(event.id, minutes);
    setActiveAlarm(null);
    logAgentAction('Act', `Snoozed alarm for "${event.title}" by ${minutes} minutes`);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="alarm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="alarm-modal glass-panel"
          initial={{ y: -50, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="alarm-header">
            <div className="alarm-icon-container">
              <Bell className="alarm-icon pulse-animation" size={24} />
            </div>
            <div>
              <h2 className="text-gradient">DEADLINE ZERO ALERT</h2>
              <span className="alarm-subtitle">
                {event.isFocusSession ? "Focus Session Starting" : "Scheduled Event"}
              </span>
            </div>
          </div>
          
          <div className="alarm-body">
            <h3>{event.title}</h3>
            <div className="alarm-time">
              <Clock size={16} />
              {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' - '}
              {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="alarm-actions">
            <button className="btn-primary" onClick={handleDismiss}>
              <BellOff size={16} />
              Dismiss
            </button>
            
            <div className="snooze-group">
              <button className="btn-secondary snooze-btn" onClick={() => handleSnooze(5)}>
                <Zap size={14} /> 5m
              </button>
              <button className="btn-secondary snooze-btn" onClick={() => handleSnooze(10)}>
                <Zap size={14} /> 10m
              </button>
              <button className="btn-secondary snooze-btn" onClick={() => handleSnooze(15)}>
                <Zap size={14} /> 15m
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
