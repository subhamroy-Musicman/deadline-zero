"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Clock, BrainCircuit, Activity, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Task } from '@/types';
import './MissionControl.css';

export default function MissionControl() {
  const [mounted, setMounted] = useState(false);
  const { 
    tasks, 
    startFocusSession, 
    burnoutRisk, 
    burnoutFactors, 
    successPrediction, 
    successPredictionFactors,
    resolveBurnout,
    createFocusSession,
    aiActionHistory,
    deadlinesPrevented,
    hoursSaved,
    workloadOptimized
  } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="mission-control skeleton glass-panel" />;

  const isEmergencyMode = burnoutRisk > 80;
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  // Find highest risk task
  const sortedTasks = [...pendingTasks].sort((a, b) => b.urgencyScore - a.urgencyScore);
  const topTask = sortedTasks[0];
  const isHighRisk = topTask && topTask.urgencyScore >= 80;
  
  const lastAction = aiActionHistory.length > 0 ? aiActionHistory[0] : null;

  return (
    <div className="mission-control-container">
      
      {/* NEW AI STATUS HERO */}
      <div className="ai-status-hero glass-panel">
        <div className="ai-status-header">
          <div className="status-badge">
            <div className="pulse-dot"></div>
            <span>AI STATUS: ACTIVE</span>
          </div>
          <div className="status-label">Monitoring Workload</div>
        </div>

        <div className="ai-status-metrics">
          <div className="status-metric-box">
            <span className="metric-title">Burnout Risk</span>
            <div className="risk-gauge-container">
              <span className={`metric-value ${isEmergencyMode ? 'critical' : (burnoutRisk > 40 ? 'warning' : 'success')}`}>
                {burnoutRisk}%
              </span>
              <span className={`metric-badge ${isEmergencyMode ? 'critical' : (burnoutRisk > 40 ? 'warning' : 'success')}`}>
                {isEmergencyMode ? 'HIGH' : (burnoutRisk > 40 ? 'MED' : 'LOW')}
              </span>
            </div>
            {isEmergencyMode && <div className="recovery-active-text">AI RECOVERY PLAN ACTIVE</div>}
          </div>

          <div className="status-metric-box">
            <span className="metric-title">AI Confidence</span>
            <span className="metric-value" style={{ color: 'var(--accent-secondary)' }}>{successPrediction}%</span>
          </div>
        </div>

        {lastAction && (
          <div className="last-action-panel">
            <div className="last-action-label">Last Action:</div>
            <div className="last-action-text">{lastAction.description}</div>
            {lastAction.reason && lastAction.reason.length > 0 && (
              <div className="last-action-reason">{lastAction.reason[0]}</div>
            )}
          </div>
        )}
      </div>

      {pendingTasks.length === 0 && !isEmergencyMode && (
        <div className="mission-control glass-panel success-state" style={{ marginTop: '1rem' }}>
          <h2 className="mission-header">TODAY'S MISSION</h2>
          <p>All tasks cleared! Great job.</p>
        </div>
      )}

      <AnimatePresence>
        {isEmergencyMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mission-control glass-panel emergency-mode"
          >
            <div className="mission-header emergency">
              <AlertTriangle size={18} className="text-danger animate-pulse" /> 
              <span>CRITICAL WORKLOAD DETECTED</span>
            </div>

            <div className="emergency-body">
              <div className="emergency-stats">
                <div className="risk-display">
                  <span className="risk-label">Burnout Risk:</span>
                  <span className="risk-val critical">{burnoutRisk}%</span>
                </div>
                <div className="risk-causes">
                  <strong>Causes:</strong>
                  <ul>
                    {burnoutFactors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>

              <div className="emergency-action">
                <p className="rec-title">AI Recovery Protocol:</p>
                <ul className="ai-action-list">
                  <li>Reschedule 2 non-critical tasks</li>
                  <li>Block distraction windows</li>
                  <li>Create mandatory recovery period</li>
                </ul>
                <div className="expected-risk">
                  Expected Risk: <strong>{burnoutRisk}% → 49%</strong>
                </div>
                <button 
                  className="mission-focus-btn emergency-btn"
                  onClick={() => resolveBurnout()}
                >
                  <Zap size={16} /> Execute Recovery
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isEmergencyMode && topTask && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mission-control glass-panel"
        >
          <div className="mission-header">
            <Zap size={16} className="text-yellow-400" /> TODAY'S MISSION
          </div>

          <div className="mission-body">
            <div className="mission-task-details">
              <h3 className="high-risk-title">{topTask.title}</h3>
              
              <div className="risk-indicator">
                <span className="risk-label">Task Risk:</span>
                <span className={`risk-value ${isHighRisk ? 'critical' : 'warning'}`}>
                  {topTask.urgencyScore}%
                </span>
              </div>

              <div className="ai-prediction">
                <ShieldAlert size={14} className={isHighRisk ? 'text-red-400' : 'text-yellow-400'} />
                <div className="prediction-text">
                  <strong>AI Prediction:</strong> You may miss this deadline if not started soon.
                </div>
              </div>
            </div>

            <div className="mission-action">
              <p className="rec-title">AI Recommendation:</p>
              <p className="rec-desc">Schedule <strong>{topTask.title}</strong> for a {topTask.estimatedMinutes || 45}m focus block right now.</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  className="mission-focus-btn"
                  onClick={() => createFocusSession(topTask.id, topTask.estimatedMinutes || 45)}
                >
                  <Zap size={16} /> Accept AI Plan
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => startFocusSession(topTask.id, topTask.estimatedMinutes || 45)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Clock size={16} /> Start Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
