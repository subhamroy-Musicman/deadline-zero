"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Clock, BrainCircuit, Activity, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Task } from '@/types';
import AgentDecisionCard from './AgentDecisionCard';
import './MissionControl.css';

export default function MissionControl() {
  const [mounted, setMounted] = useState(false);
  const [acceptedPlans, setAcceptedPlans] = useState<string[]>([]);
  const [isExecutingAI, setIsExecutingAI] = useState(false);
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
    decisionHistory,
    agentMemory,
    availableFocusHours,
    deadlinesPrevented,
    hoursSaved,
    workloadOptimized,
    aiExecutionResult,
    setAiExecutionResult,
    calculateConfidence
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
  
  // Predictive Failure Engine Calculations
  const remainingWorkMinutes = pendingTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
  const remainingWorkHours = remainingWorkMinutes / 60;
  const criticalTasks = pendingTasks.filter(t => {
    const hoursToDeadline = (new Date(t.deadline).getTime() - Date.now()) / 3600000;
    return hoursToDeadline > 0 && hoursToDeadline < 48;
  });
  
  const isPredictiveFailure = remainingWorkHours > availableFocusHours && criticalTasks.length > 0;
  
  const lastAction = aiActionHistory.length > 0 ? aiActionHistory[0] : null;
  const latestDecision = decisionHistory.length > 0 ? decisionHistory[0] : null;

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
                {Math.round(burnoutRisk)}%
              </span>
              <span className={`metric-badge ${isEmergencyMode ? 'critical' : (burnoutRisk > 40 ? 'warning' : 'success')}`}>
                {isEmergencyMode ? 'HIGH' : (burnoutRisk > 40 ? 'MED' : 'LOW')}
              </span>
            </div>
            {isEmergencyMode && <div className="recovery-active-text">AI RECOVERY PLAN ACTIVE</div>}
          </div>

          <div className="status-metric-box">
            <span className="metric-title">AI Confidence</span>
            <span className="metric-value" style={{ color: 'var(--accent-secondary)' }}>{Math.round(calculateConfidence())}%</span>
          </div>
        </div>

        {lastAction && (
          <div className="last-action-panel">
            <div className="last-action-label">Last Action:</div>
            <div className="last-action-text">{lastAction.description}</div>
            {lastAction.reason && lastAction.reason.length > 0 && (
              <div className="last-action-reason" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Why?</strong>
                <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.2rem' }}>
                  {lastAction.reason.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>


      <AnimatePresence>
        {topTask && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`glass-panel ${isPredictiveFailure ? '' : 'mission-control'}`}
            style={{ 
              marginTop: '1rem', 
              border: aiExecutionResult ? '1px solid rgba(16, 185, 129, 0.4)' : isExecutingAI ? '1px solid rgba(139, 92, 246, 0.4)' : isPredictiveFailure ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.2)', 
              background: aiExecutionResult ? 'rgba(16, 185, 129, 0.05)' : isExecutingAI ? 'rgba(139, 92, 246, 0.05)' : isPredictiveFailure ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-glass)'
            }}
          >
            {isExecutingAI ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                <BrainCircuit size={32} className="animate-pulse" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '0.75rem', fontWeight: 500, fontSize: '1.1rem' }}>Executing AI Protocol...</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {isPredictiveFailure ? "Rescheduling non-critical tasks & setting focus block..." : "Scheduling focus block..."}
                </p>
              </div>
            ) : aiExecutionResult ? (
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1.2rem' }}>
                  <Zap size={24} />
                  AI Plan Executed Successfully
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {isPredictiveFailure ? (
                    <>
                      <strong>Action Taken:</strong> 2 low-priority tasks rescheduled and <strong>{topTask.title}</strong> scheduled for focus.<br/>
                      <strong>Result:</strong> Deadline failure probability dropped from <span style={{ color: 'var(--danger)' }}>{aiExecutionResult.oldRisk}%</span> to <span style={{ color: 'var(--success)' }}>{aiExecutionResult.newRisk}%</span>.
                    </>
                  ) : (
                    <>
                      <strong>Action Taken:</strong> <strong>{topTask.title}</strong> scheduled for {topTask.estimatedMinutes || 45}m focus block.
                    </>
                  )}
                </p>
                <button 
                  className="btn-secondary" 
                  onClick={() => setAiExecutionResult(null)} 
                  style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div style={{ padding: isPredictiveFailure ? '0.5rem' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isPredictiveFailure ? 'var(--danger)' : 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  {isPredictiveFailure ? <AlertTriangle size={20} /> : <Zap size={20} />}
                  {isPredictiveFailure ? '⚠ Predicted Deadline Failure' : "TODAY'S MISSION"}
                </div>
                
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{topTask.title}</h3>
                  {isPredictiveFailure && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Risk:</strong> {100 - Math.round(successPrediction)}%<br/><br/>
                      <strong>Reason:</strong><br/>
                      • {Math.round(remainingWorkHours * 10) / 10}h work remaining<br/>
                      • Only {availableFocusHours}h available capacity<br/>
                    </div>
                  )}
                  
                  <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${isPredictiveFailure ? 'var(--danger)' : 'var(--accent-primary)'}` }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Recommended Action:</p>
                    <p>
                      {isPredictiveFailure 
                        ? `Reschedule low-priority tasks immediately to free capacity, AND schedule ${topTask.title} for a ${topTask.estimatedMinutes || 45}m focus block right now.` 
                        : `Schedule ${topTask.title} for a ${topTask.estimatedMinutes || 45}m focus block right now.`}
                    </p>
                    {isPredictiveFailure && (
                      <p style={{ marginTop: '0.5rem', color: 'var(--success)' }}>
                        <strong>Expected Outcome:</strong> Failure probability reduced to {Math.max(10, 100 - Math.round(successPrediction) - 45)}%
                      </p>
                    )}
                  </div>
                </div>

                <button 
                  className={`mission-focus-btn ${isPredictiveFailure ? 'emergency-btn' : ''}`}
                  onClick={() => {
                    if (isPredictiveFailure) {
                      const currentRisk = 100 - Math.round(successPrediction);
                      const expectedRisk = Math.max(10, currentRisk - 45);
                      setIsExecutingAI(true);
                      resolveBurnout();
                      createFocusSession(topTask.id, topTask.estimatedMinutes || 45);
                      setTimeout(() => {
                        setIsExecutingAI(false);
                        setAiExecutionResult({ oldRisk: currentRisk, newRisk: expectedRisk });
                      }, 1500);
                    } else {
                      setIsExecutingAI(true);
                      createFocusSession(topTask.id, topTask.estimatedMinutes || 45);
                      setTimeout(() => {
                        setIsExecutingAI(false);
                        setAiExecutionResult({ oldRisk: 0, newRisk: 0 }); // values not used in non-failure state
                      }, 800);
                    }
                  }}
                  style={{ marginTop: '1.25rem', width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                >
                  <Zap size={18} style={{ marginRight: '0.5rem' }} /> {isPredictiveFailure ? 'Execute Complete AI Recovery' : 'Accept AI Plan'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {latestDecision && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '1rem' }}
          >
            <AgentDecisionCard decision={latestDecision} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
