"use client";

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { format, addHours, startOfDay, parseISO } from 'date-fns';
import { BrainCircuit, Clock, Zap, AlertTriangle, Plus, BellRing, Calendar as CalendarIcon, Check } from 'lucide-react';
import { ScheduleEvent } from '@/types';
import './schedule.css';

interface TimeBlock {
  hour: number;
  label: string;
  events: ScheduleEvent[];
}

export default function SchedulePage() {
  const { events, tasks, addEvent, detectConflicts, logAgentAction } = useStore();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  const [isAlarmSet, setIsAlarmSet] = useState(true);
  
  const conflictCheck = useMemo(() => {
    if (!newEventStart || !newEventEnd) return { hasConflict: false, conflictingEvents: [] };
    return detectConflicts({
      title: newEventTitle,
      startTime: new Date(newEventStart).toISOString(),
      endTime: new Date(newEventEnd).toISOString(),
      isAlarmSet
    });
  }, [newEventStart, newEventEnd, newEventTitle, isAlarmSet, detectConflicts]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventStart || !newEventEnd || !newEventTitle) return;

    addEvent({
      id: `evt-${Date.now()}`,
      title: newEventTitle,
      startTime: new Date(newEventStart).toISOString(),
      endTime: new Date(newEventEnd).toISOString(),
      isAlarmSet,
      priority: 'normal' as any
    });
    
    logAgentAction('Act', `User manually added scheduled event: "${newEventTitle}"`);
    setIsModalOpen(false);
    setNewEventTitle('');
  };

  const handleTriggerDemoAlarm = () => {
    // Add an event that triggers exactly right now
    const now = new Date();
    addEvent({
      id: `demo-alarm-${Date.now()}`,
      title: 'Hackathon Demo Alarm',
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 3600000).toISOString(),
      isAlarmSet: true,
      createdByAI: true,
      priority: 'critical'
    });
    logAgentAction('Observe', 'Triggered Demo Alarm instantly.');
  };

  // Generate timeline blocks based on REAL events
  const timeline = useMemo(() => {
    const blocks: TimeBlock[] = [];
    const dayStart = startOfDay(selectedDay);

    for (let i = 8; i <= 22; i++) {
      const blockStart = addHours(dayStart, i);
      const blockEnd = addHours(dayStart, i + 1);
      
      const hourEvents = events.filter(e => {
        const eStart = new Date(e.startTime).getTime();
        return eStart >= blockStart.getTime() && eStart < blockEnd.getTime();
      });

      blocks.push({
        hour: i,
        label: format(blockStart, 'h a'),
        events: hourEvents
      });
    }
    return blocks;
  }, [events, selectedDay]);

  const getEventClass = (event: ScheduleEvent) => {
    if (event.isFocusSession) return 'ai-focus';
    if (event.priority === 'critical') return 'critical';
    if (event.createdByAI) return 'ai-rescheduled';
    return 'user-event';
  };

  const getEventIcon = (event: ScheduleEvent) => {
    if (event.isFocusSession) return <BrainCircuit size={14} />;
    if (event.priority === 'critical') return <AlertTriangle size={14} />;
    if (event.createdByAI) return <Zap size={14} />;
    return <CalendarIcon size={14} />;
  };

  return (
    <div className="schedule-page-container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Schedule Organizer</h1>
          <p className="subtitle" style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>Timeline reserved and protected by Deadline Zero.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleTriggerDemoAlarm}>
            <BellRing size={16} /> Trigger Demo Alarm
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      <div className="schedule-grid">
        <div className="timeline-container glass-panel">
          <div className="timeline-header">
            <h3>{format(selectedDay, 'EEEE, MMMM d')}</h3>
            <div className="timeline-legend">
              <span className="legend-item"><div className="legend-color ai-focus"></div> AI Focus</span>
              <span className="legend-item"><div className="legend-color user-event"></div> User Event</span>
              <span className="legend-item"><div className="legend-color ai-rescheduled"></div> AI Rescheduled</span>
              <span className="legend-item"><div className="legend-color critical"></div> Critical</span>
            </div>
          </div>
          
          <div className="timeline">
            {timeline.map((block) => (
              <div key={block.hour} className={`timeline-row ${block.events.length > 0 ? 'has-event' : ''}`}>
                <div className="time-label">{block.label}</div>
                <div className="time-slot">
                  {block.events.length > 0 ? (
                    block.events.map(event => (
                      <div key={event.id} className={`event-card ${getEventClass(event)}`}>
                        {getEventIcon(event)}
                        <span>{event.title}</span>
                        {event.isAlarmSet && <BellRing size={12} className="opacity-50 ml-auto" />}
                      </div>
                    ))
                  ) : (
                    <div className="free-slot"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-sidebar">
          <div className="glass-panel schedule-summary">
            <h3>Optimization Report</h3>
            
            <div className="summary-stat">
              <span className="stat-label">Total Events Today</span>
              <span className="stat-value text-accent">{events.length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">AI Focus Blocks</span>
              <span className="stat-value">{events.filter(e => e.isFocusSession).length}</span>
            </div>
            
            <div className="ai-insight-box">
              <BrainCircuit size={20} className="text-accent" />
              <p>Deadline Zero monitors this timeline. If you add conflicting meetings, it will automatically suggest rescheduling your lower-priority tasks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>Schedule New Event</h2>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  value={newEventTitle} 
                  onChange={e => setNewEventTitle(e.target.value)} 
                  placeholder="e.g., Team Sync" 
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input 
                  type="datetime-local" 
                  value={newEventStart} 
                  onChange={e => setNewEventStart(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input 
                  type="datetime-local" 
                  value={newEventEnd} 
                  onChange={e => setNewEventEnd(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={isAlarmSet} 
                    onChange={e => setIsAlarmSet(e.target.checked)} 
                  />
                  Enable Deadline Zero Alarm
                </label>
              </div>

              {conflictCheck.hasConflict && (
                <div className="conflict-warning fade-in">
                  <div className="conflict-header">
                    <AlertTriangle size={16} />
                    <strong>Schedule Conflict Detected</strong>
                  </div>
                  <p>This overlaps with:</p>
                  <ul>
                    {conflictCheck.conflictingEvents.map(e => (
                      <li key={e.id}>{e.title}</li>
                    ))}
                  </ul>
                  <div className="conflict-ai-suggestion">
                    <strong>AI Suggestion:</strong> We can schedule this anyway, and Deadline Zero will adapt your other priorities later.
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {conflictCheck.hasConflict ? 'Force Schedule' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
