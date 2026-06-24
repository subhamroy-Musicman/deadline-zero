import React from 'react';
import { AgentDecision } from '@/types';
import { BrainCircuit, CheckCircle2, ChevronRight } from 'lucide-react';
import './AgentDecisionCard.css';

interface Props {
  decision: AgentDecision;
}

export default function AgentDecisionCard({ decision }: Props) {
  return (
    <div className="agent-decision-card glass-card">
      <div className="adc-header">
        <BrainCircuit className="text-accent-primary" size={20} />
        <h3 className="text-gradient">Latest AI Decision</h3>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="adc-confidence">Confidence: {decision.confidence}%</span>
          <span className="adc-impact" style={{ background: 'var(--success)', color: '#111', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>Impact: {decision.impactScore}</span>
        </div>
      </div>

      <div className="adc-body">
        <div className="adc-stage observe-stage">
          <div className="stage-label">OBSERVED</div>
          <ul>
            {decision.observation.map((obs, i) => (
              <li key={i}>{obs}</li>
            ))}
          </ul>
        </div>

        <div className="adc-stage analyze-stage">
          <div className="stage-label">ANALYZED</div>
          <ul>
            {decision.analysis.map((ana, i) => (
              <li key={i}>{ana}</li>
            ))}
          </ul>
        </div>

        <div className="adc-stage decision-stage">
          <div className="stage-label">DECISION</div>
          <div className="decision-text">
            <ChevronRight size={16} /> {decision.decision}
          </div>
          <div className="why-box">
            <strong>Why:</strong>
            <ul>
              {decision.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="adc-stage outcome-stage">
          <div className="stage-label">EXPECTED OUTCOME</div>
          <div className="outcome-text">
            <CheckCircle2 size={16} className="text-success" />
            {decision.expectedOutcome}
          </div>
        </div>

        {decision.metricsBefore && decision.metricsAfter && (
          <div className="adc-comparison">
            <div className="comp-col">
              <div className="comp-label">Before AI</div>
              <div className="comp-value danger-text">Burnout Risk: {Math.round(decision.metricsBefore.burnoutRisk)}%</div>
              {decision.metricsBefore.criticalTasks !== undefined && <div className="comp-value">Critical Tasks: {decision.metricsBefore.criticalTasks}</div>}
              {decision.metricsBefore.availableHours !== undefined && <div className="comp-value">Available Hours: {decision.metricsBefore.availableHours}</div>}
            </div>
            <div className="comp-divider"></div>
            <div className="comp-col">
              <div className="comp-label">After AI</div>
              <div className="comp-value success-text">Burnout Risk: {Math.round(decision.metricsAfter.burnoutRisk)}%</div>
              {decision.metricsAfter.criticalTasks !== undefined && <div className="comp-value">Critical Tasks: {decision.metricsAfter.criticalTasks}</div>}
              {decision.metricsAfter.availableHours !== undefined && <div className="comp-value">Available Hours: {decision.metricsAfter.availableHours}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
