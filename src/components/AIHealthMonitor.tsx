"use client";

import React from 'react';
import { useStore } from '@/store/useStore';
import { Activity, ShieldCheck, Cpu, AlertTriangle, Clock } from 'lucide-react';
import './AIHealthMonitor.css';

export default function AIHealthMonitor() {
  const { 
    burnoutRisk,
    successPrediction,
    aiActionHistory,
    events
  } = useStore();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="health-monitor-container glass-panel skeleton-loader" style={{ height: '200px' }} />;

  const conflicts = events.filter(e => e.hasConflict).length;
  const lastAction = aiActionHistory.length > 0 ? aiActionHistory[0] : null;

  return (
    <div className="health-monitor-container glass-panel">
      <div className="health-header">
        <Cpu size={16} className="pulse-icon" />
        <h3 style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '1px' }}>AI HEALTH MONITOR</h3>
      </div>
      
      <div className="health-stats-list">
        <div className="health-stat-row">
          <span className="health-label"><Activity size={14} /> Agent Status:</span>
          <span className="health-value status-active">ACTIVE</span>
        </div>
        
        <div className="health-stat-row">
          <span className="health-label"><ShieldCheck size={14} /> Confidence:</span>
          <span className="health-value" style={{ color: 'var(--accent-secondary)' }}>{Math.round(successPrediction)}%</span>
        </div>
        
        <div className="health-stat-row">
          <span className="health-label"><Cpu size={14} /> Burnout Engine:</span>
          <span className="health-value" style={{ color: burnoutRisk > 80 ? 'var(--danger)' : (burnoutRisk > 40 ? 'var(--warning)' : 'var(--success)') }}>
            {burnoutRisk > 80 ? 'CRITICAL' : 'MONITORING'}
          </span>
        </div>
        
        <div className="health-stat-row">
          <span className="health-label"><AlertTriangle size={14} /> Schedule Conflicts:</span>
          <span className={`health-value ${conflicts > 0 ? 'status-warning' : 'status-good'}`}>
            {conflicts}
          </span>
        </div>
      </div>

      <div className="last-intervention-box">
        <div className="intervention-label"><Clock size={12} /> LAST INTERVENTION</div>
        <div className="intervention-text">
          {lastAction ? lastAction.description : 'No interventions yet.'}
        </div>
      </div>
    </div>
  );
}
