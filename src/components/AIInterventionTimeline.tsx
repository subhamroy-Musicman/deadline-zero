"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIInterventionTimeline.css';

export default function AIInterventionTimeline() {
  const { aiActionHistory } = useStore();
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
          {aiActionHistory.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              No major interventions yet. Your schedule is perfectly optimized.
            </motion.div>
          ) : (
            <div className="timeline-list">
              {aiActionHistory.map((action, i) => (
                <motion.div 
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="timeline-item"
                >
                  <div className="timeline-node"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{action.time}</div>
                    <div className="timeline-desc">{action.description}</div>
                    
                    {action.reason && action.reason.length > 0 && (
                      <div className="timeline-reasoning">
                        <strong className="reason-title">Reason:</strong>
                        <ul className="reason-list">
                          {action.reason.map((r, idx) => (
                            <li key={idx}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="timeline-footer">
                      {action.riskDrop && (
                        <div className="timeline-impact">
                          <TrendingDown size={14} /> Risk Dropped: {action.riskDrop}
                        </div>
                      )}
                      {action.confidence && (
                        <div className="timeline-confidence">
                          Confidence: {action.confidence}%
                        </div>
                      )}
                    </div>
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
