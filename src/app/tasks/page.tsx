"use client";

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { AlertCircle, Clock, CheckCircle2, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import './tasks.css';

type SortField = 'deadline' | 'urgencyScore' | 'estimatedMinutes' | 'title';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'All' | 'Critical' | 'High Risk' | 'Completed' | 'Upcoming';

export default function TasksPage() {
  const { tasks } = useStore();
  const [sortField, setSortField] = useState<SortField>('urgencyScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to desc for most numerical values like urgency
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search text
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter status
      switch (filter) {
        case 'Critical':
          return task.urgencyScore >= 80 && task.status !== 'completed';
        case 'High Risk':
          return task.urgencyScore >= 60 && task.urgencyScore < 80 && task.status !== 'completed';
        case 'Completed':
          return task.status === 'completed';
        case 'Upcoming':
          return task.status !== 'completed';
        default:
          return true;
      }
    }).sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'urgencyScore':
          comparison = a.urgencyScore - b.urgencyScore;
          break;
        case 'estimatedMinutes':
          comparison = (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortOrder, filter, searchQuery]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="sort-icon inactive" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="sort-icon" /> : <ChevronDown size={14} className="sort-icon" />;
  };

  return (
    <div className="tasks-page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Task Intelligence</h1>
          <p className="subtitle" style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>AI-prioritized master task list.</p>
        </div>
      </div>

      <div className="tasks-controls glass-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <SlidersHorizontal size={18} />
          {['All', 'Critical', 'High Risk', 'Upcoming', 'Completed'].map((f) => (
            <button 
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f as FilterStatus)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="tasks-table-container glass-panel">
        <table className="tasks-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')}>Task Name <SortIcon field="title" /></th>
              <th onClick={() => handleSort('deadline')}>Deadline <SortIcon field="deadline" /></th>
              <th onClick={() => handleSort('estimatedMinutes')}>Est. Duration <SortIcon field="estimatedMinutes" /></th>
              <th onClick={() => handleSort('urgencyScore')}>Risk Score <SortIcon field="urgencyScore" /></th>
              <th>Priority</th>
              <th>AI Recommended Slot</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-table">No tasks found matching criteria.</td>
              </tr>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'completed';
                const riskLevel = task.urgencyScore >= 80 ? 'critical' : task.urgencyScore >= 60 ? 'high' : 'normal';
                
                // Mock AI Recommended slot based on urgency
                const slot = isCompleted ? 'Done' : 
                            riskLevel === 'critical' ? 'Today, 7:00 PM - 8:00 PM' : 
                            riskLevel === 'high' ? 'Tomorrow, Morning Focus' : 'Next Available Block';

                return (
                  <tr key={task.id} className={`${isCompleted ? 'completed-row' : ''} risk-${riskLevel}`}>
                    <td className="task-title-cell">
                      <button 
                        className="complete-toggle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCompleted) {
                            useStore.getState().recordTaskCompletion(task.urgencyScore >= 70);
                            useStore.getState().setTasks(useStore.getState().tasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
                          }
                        }}
                        disabled={isCompleted}
                      >
                        {isCompleted ? <CheckCircle2 size={16} className="success-icon" /> : <AlertCircle size={16} className={`risk-icon-${riskLevel}`} />}
                      </button>
                      <span className={isCompleted ? 'line-through opacity-50' : ''}>{task.title}</span>
                    </td>
                    <td>{format(new Date(task.deadline), 'MMM d, h:mm a')}</td>
                    <td>
                      <div className="duration-pill">
                        <Clock size={12} />
                        {task.estimatedMinutes ? `${Math.round(task.estimatedMinutes)}m` : '--'}
                      </div>
                    </td>
                    <td>
                      <div className="risk-bar-container">
                        <div className={`risk-bar bg-${riskLevel}`} style={{ width: `${task.urgencyScore}%` }}></div>
                        <span>{Math.round(task.urgencyScore)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`priority-badge ${riskLevel}`}>
                        {riskLevel === 'critical' ? 'Critical' : riskLevel === 'high' ? 'High' : 'Normal'}
                      </span>
                    </td>
                    <td className="ai-slot-cell">{slot}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
