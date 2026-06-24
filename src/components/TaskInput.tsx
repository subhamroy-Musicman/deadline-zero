"use client";

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import './TaskInput.css';

interface TaskInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function TaskInput({ onSubmit, isLoading }: TaskInputProps) {
  const [input, setInput] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (input.length > 500) {
      setError('Input too long. Please keep it under 500 characters.');
      return;
    }
    onSubmit(input);
    setInput('');
    setError(null);
  };

  return (
    <div className="task-input-container glass-card">
      <div className="input-header">
        <Sparkles size={18} className="text-accent" />
        <h3>What&apos;s on your mind?</h3>
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          className={`task-textarea ${error ? 'error-border' : ''}`}
          placeholder="e.g. I need to finish the hackathon project by Sunday and buy groceries tomorrow..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          rows={3}
          disabled={isLoading}
          maxLength={550}
        />
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</div>}
        <div className="input-actions" style={{ marginTop: '0.5rem' }}>
          <span className="input-hint">
            {input.length}/500 - Deadline Zero will automatically extract deadlines and prioritize.
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={!input.trim() || input.length > 500 || isLoading}
            >
              {isLoading ? <span className="loader"></span> : <><span>Plan it</span><Send size={16} /></>}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="roadmap-btn"
              disabled={!input.trim() || isLoading}
              onClick={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  // In page.tsx, we would intercept this or use a specific callback
                  onSubmit(`[ROADMAP] ${input}`);
                  setInput('');
                }
              }}
            >
              <span>Goal → Roadmap</span>
              <Sparkles size={16} />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
