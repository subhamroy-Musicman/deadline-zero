"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Target, History, BrainCircuit } from 'lucide-react';
import { Task } from '@/types';
import './ExplainabilityPanel.css';

interface Props {
  task: Task;
  children: React.ReactNode;
}

export default function ExplainabilityPanel({ task, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const confidence = task.confidenceScore || Math.floor(Math.random() * 20 + 80); // Default to high confidence for mock
  const reasoning = task.reasoning || [
    "Deadline proximity analyzed",
    "Estimated effort aligns with current focus hours",
    "No historical delays detected"
  ];

  return (
    <div className="explainability-wrapper" ref={panelRef}>
      <div className="explainability-trigger" onClick={() => setIsOpen(!isOpen)}>
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="explainability-popover glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popover-header">
              <BrainCircuit size={16} className="text-purple-400" />
              <h4>Agent Reasoning</h4>
            </div>

            <div className="confidence-meter">
              <div className="confidence-label">
                <span>Confidence Score</span>
                <span className="confidence-val">{confidence}%</span>
              </div>
              <div className="confidence-bar-bg">
                <div 
                  className="confidence-bar-fill" 
                  style={{ width: `${confidence}%`, background: confidence > 85 ? 'var(--success)' : 'var(--warning)' }}
                ></div>
              </div>
            </div>

            <div className="reasoning-list">
              {reasoning.map((reason, idx) => (
                <div key={idx} className="reason-item">
                  <Target size={12} className="reason-icon" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
            
            <div className="popover-footer">
              <Info size={12} /> Priority automatically assigned by Planner Agent
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
