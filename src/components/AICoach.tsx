"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Lightbulb, AlertCircle, TrendingUp, HelpCircle, Clock, BrainCircuit } from 'lucide-react';
import { CoachMessage } from '../types';
import { useStore } from '../store/useStore';
import './AICoach.css';

interface AICoachProps {
  messages: CoachMessage[];
  isThinking: boolean;
}

export default function AICoach({ messages, isThinking }: AICoachProps) {
  // Auto-scroll to bottom of messages
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const getIcon = (type: CoachMessage['type']) => {
    switch (type) {
      case 'suggestion': return <Lightbulb size={18} className="text-warning" />;
      case 'warning': return <AlertCircle size={18} className="text-danger" />;
      case 'encouragement': return <TrendingUp size={18} className="text-success" />;
      case 'clarification': return <HelpCircle size={18} className="text-accent" />;
      default: return <Bot size={18} />;
    }
  };

  return (
    <div className="ai-coach-panel glass-panel">
      <div className="coach-header">
        <div className="coach-avatar animate-pulse-glow">
          <Bot size={24} />
        </div>
        <div>
          <h3>Deadline Zero</h3>
          <span className="coach-status">Active Context Monitoring</span>
        </div>
      </div>

      <div className="agent-memory-box" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', margin: '0 1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.85rem' }}>
        <strong style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
          <BrainCircuit size={14} /> AI Learned:
        </strong>
        <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {useStore.getState().agentMemory?.focusPatterns?.[0] || "You complete most work between 8PM–11PM."}
        </p>
      </div>

      <div className="coach-messages">
        <AnimatePresence>
          {messages.length === 0 && !isThinking && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="empty-state"
            >
              <p>I'm monitoring your schedule. I'll let you know if you need to adjust priorities.</p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`coach-message-card ${msg.type}`}
            >
              <div className="msg-icon">{getIcon(msg.type)}</div>
              <div className="msg-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                <span className="msg-time">
                  {mounted ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
                {msg.actionable && (
                  <div className="msg-actions">
                    {msg.focusTaskId ? (
                      <button className="msg-action-btn focus-action" onClick={() => {
                        useStore.getState().startFocusSession(msg.focusTaskId!, 45);
                      }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Start Focus Session
                      </button>
                    ) : (
                      <>
                        <button className="msg-action-btn" onClick={() => {
                          document.querySelector<HTMLInputElement>('.task-input')?.focus();
                        }}>Create Task</button>
                        <button className="msg-action-btn" onClick={() => {
                          document.dispatchEvent(new CustomEvent('open-command-palette'));
                        }}>Open Palette</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="coach-typing"
            >
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
