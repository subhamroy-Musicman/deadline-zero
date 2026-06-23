"use client";

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Play, Flame, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import './DemoControls.css';

export default function DemoControls() {
  const { logAgentAction, updateAgentMemory, injectWorkloadTest } = useStore();
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateBurnout = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    toast.info("Injecting simulated workload...");

    injectWorkloadTest();
    
    setIsSimulating(false);
  };

  return (
    <div className="demo-controls">
      <div className="demo-header">
        <Play size={14} className="text-success" />
        <span>Hackathon Demo Mode</span>
      </div>
      <div className="demo-actions">
        <button 
          className="demo-btn" 
          onClick={simulateBurnout}
          disabled={isSimulating}
        >
          <Flame size={14} /> Inject Workload Test
        </button>
      </div>
    </div>
  );
}
