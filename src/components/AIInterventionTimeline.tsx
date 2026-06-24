"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIInterventionTimeline.css';

export default function AIInterventionTimeline() {
  const { agentLogs } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="intervention-timeline glass-panel skeleton-loader"></div>;

  return (
    <div className="intervention-timeline glass-panel">
      <div className="timeline-header">
        <Sparkles size={18} className="text-accent" />
        <h3>AI Interventions</h3>
      </div>

      <div className="timeline-body">
        <AnimatePresence>
          {agentLogs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              No AI Activity yet. Agent is observing workload.
            </motion.div>
          ) : (
            <div className="timeline-list">
              {agentLogs.map((log, i) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`timeline-item stage-${log.stage.toLowerCase()}`}
                >
                  <div className="timeline-node"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="timeline-stage-label">{log.stage.toUpperCase()}</div>
                    <div className="timeline-desc">{log.message}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
