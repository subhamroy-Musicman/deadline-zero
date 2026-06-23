"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Activity, BrainCircuit, Eye, Cpu, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStage } from '@/types';
import './AgentActivityFeed.css';

export default function AgentActivityFeed() {
  const { agentLogs } = useStore();
  const [mounted, setMounted] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  if (!mounted) return <div className="agent-feed glass-panel skeleton-loader"></div>;

  const getStageIcon = (stage: PipelineStage) => {
    switch (stage) {
      case 'Observe': return <Eye size={14} className="text-blue-400" />;
      case 'Analyze': return <BrainCircuit size={14} className="text-purple-400" />;
      case 'Plan': return <Cpu size={14} className="text-yellow-400" />;
      case 'Act': return <Zap size={14} className="text-orange-400" />;
      case 'Reflect': return <CheckCircle2 size={14} className="text-green-400" />;
      default: return <ChevronRight size={14} />;
    }
  };

  const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'Observe': return 'var(--accent-primary)'; // e.g. blue
      case 'Analyze': return '#a855f7'; // purple
      case 'Plan': return '#eab308'; // yellow
      case 'Act': return '#f97316'; // orange
      case 'Reflect': return '#10b981'; // green
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="agent-feed glass-panel">
      <div className="feed-header">
        <div className="header-title">
          <Activity size={16} className="animate-pulse" color="var(--accent-primary)" />
          <h3>Agent Pipeline</h3>
        </div>
        <span className="live-badge">Live</span>
      </div>

      <div className="feed-logs">
        <AnimatePresence initial={false}>
          {agentLogs.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="empty-log"
            >
              System idle. Waiting for events...
            </motion.div>
          )}
          {agentLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              className="log-entry"
            >
              <div className="log-icon">{getStageIcon(log.stage)}</div>
              <div className="log-content-compressed">
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <strong className={`log-stage stage-${log.stage.toLowerCase()}`}>{log.stage.toUpperCase()}</strong>
                <span className="log-arrow">→</span>
                <span className="log-message">{log.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
}
