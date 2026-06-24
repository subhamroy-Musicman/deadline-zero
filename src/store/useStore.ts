import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'cyberpunk' | 'ocean' | 'sunset' | 'neon' | 'aurora' | 'synthwave' | 'emerald' | 'crimson' | 'midnight';
export type Mode = 'dark' | 'light';

import { AgentLog, AgentMemory, PipelineStage, Task, ScheduleEvent } from '@/types';

interface AppState {
  theme: Theme;
  mode: Mode;
  compactMode: boolean;
  reducedMotion: boolean;
  
  tasks: Task[];
  completedTaskDates: string[]; 
  tasksSaved: number;
  
  // Habit Tracker
  habits: { id: string; title: string; streak: number; lastCompleted: string | null; source?: string }[];
  
  agentLogs: AgentLog[];
  agentMemory: AgentMemory;
  
  // Schedule State
  events: ScheduleEvent[];
  
  // Focus Mode State
  activeFocusTaskId: string | null;
  focusTimeRemaining: number; 
  
  // Roadmap State
  activeRoadmap: { goal: string; totalTasks: number; completedTasks: number; phase: string } | null;
  
  // AI Metrics & State
  availableFocusHours: number;
  historicalCompletionRate: number;
  focusStreak: number;
  
  deadlinesPrevented: number;
  hoursSaved: number;
  workloadOptimized: number; // in minutes
  aiDecisionsExecuted: number;
  
  burnoutRisk: number;
  burnoutFactors: string[];
  
  successPrediction: number;
  successPredictionFactors: string[];
  
  aiActionHistory: { id: string; time: string; description: string; riskDrop?: string; reason?: string[]; confidence?: number }[];
  
  // Actions
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleCompactMode: () => void;
  toggleReducedMotion: () => void;
  
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  recordTaskCompletion: (isHighRisk?: boolean) => void;
  
  setActiveRoadmap: (roadmap: AppState['activeRoadmap']) => void;
  updateRoadmapProgress: () => void;
  
  logAgentAction: (stage: PipelineStage, message: string) => void;
  addAIActionHistory: (desc: string, options?: { riskDrop?: string; reason?: string[]; confidence?: number }) => void;
  updateAgentMemory: (updates: Partial<AgentMemory>) => void;
  clearAgentLogs: () => void;

  startFocusSession: (taskId: string, durationMin: number) => void;
  endFocusSession: () => void;
  updateFocusTime: (seconds: number) => void;
  completeHabit: (habitId: string, source?: string) => void;
  
  // AI Engine Actions
  calculateMetrics: () => void;
  injectWorkloadTest: () => void;
  resolveBurnout: () => void;
  triggerJudgeDemoMode: () => void;

  // Schedule Actions
  addEvent: (event: ScheduleEvent) => void;
  updateEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  snoozeAlarm: (eventId: string, minutes: number) => void;
  dismissAlarm: (eventId: string) => void;
  createFocusSession: (taskId: string, durationMin: number) => void;
  detectConflicts: (newEvent: Omit<ScheduleEvent, 'id'>) => { hasConflict: boolean; conflictingEvents: ScheduleEvent[] };
  acceptAISchedule: (taskId: string, title: string, startTime: string, endTime: string) => void;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare Q3 Financial Deck',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    urgencyScore: 92,
    status: 'pending',
    estimatedMinutes: 240,
    confidenceScore: 89,
    reasoning: ["High-impact deliverable", "Requires deep work block"]
  },
  {
    id: '2',
    title: 'Client Discovery Call Prep',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    urgencyScore: 65,
    status: 'pending',
    estimatedMinutes: 45,
    confidenceScore: 95,
    reasoning: ["Standard preparation", "Low cognitive load"]
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'cyberpunk',
      mode: 'dark',
      compactMode: false,
      reducedMotion: false,
      
      tasks: initialTasks,
      completedTaskDates: [],
      tasksSaved: 0,
      
      habits: [
        { id: 'h1', title: 'Deep Work (90m)', streak: 3, lastCompleted: null },
        { id: 'h2', title: 'Plan Tomorrow', streak: 12, lastCompleted: new Date().toISOString() },
        { id: 'h3', title: 'Clear Inbox', streak: 0, lastCompleted: null }
      ],
      
      agentLogs: [],
      agentMemory: {
        preferredWorkHours: { start: 9, end: 17 },
        focusDurationMin: 45,
        burnoutRiskLevel: 'low',
        historicalPatterns: [],
      },
      events: [],
      
      activeFocusTaskId: null,
      focusTimeRemaining: 0,
      activeRoadmap: null,
      
      // Initial AI State
      availableFocusHours: 4,
      historicalCompletionRate: 85,
      focusStreak: 3,
      
      deadlinesPrevented: 0,
      hoursSaved: 0,
      workloadOptimized: 0,
      aiDecisionsExecuted: 0,
      
      burnoutRisk: 12,
      burnoutFactors: ["Manageable workload", "Good focus streak"],
      
      successPrediction: 91,
      successPredictionFactors: ["Consistent completion rate", "Sufficient focus time available"],
      
      aiActionHistory: [],
      
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      
      setActiveRoadmap: (roadmap) => set({ activeRoadmap: roadmap }),
      updateRoadmapProgress: () => set((state) => {
        if (!state.activeRoadmap) return state;
        return {
          activeRoadmap: {
            ...state.activeRoadmap,
            completedTasks: state.activeRoadmap.completedTasks + 1
          }
        };
      }),
      
      setTasks: (updater) => set((state) => {
        const newTasks = typeof updater === 'function' ? updater(state.tasks) : updater;
        return { tasks: newTasks };
      }),
      
      addTask: (task) => set((state) => {
        const newTasks = [...state.tasks, task];
        // Auto Habit: Plan Tomorrow (if deadline is > 24h away)
        const isFuture = new Date(task.deadline).getTime() > Date.now() + 86400000;
        let habits = state.habits;
        if (isFuture) {
          habits = habits.map(h => h.id === 'h2' ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source: 'Planned task for future' } : h);
        }
        return { tasks: newTasks, habits };
      }),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      
      toggleSubTask: (taskId, subTaskId) => set((state) => ({
        tasks: state.tasks.map(t => {
          if (t.id === taskId && t.subTasks) {
            return {
              ...t,
              subTasks: t.subTasks.map(st => 
                st.id === subTaskId ? { ...st, completed: !st.completed } : st
              )
            };
          }
          return t;
        })
      })),
      
      recordTaskCompletion: (isHighRisk = false) => set((state) => {
        const newState = {
          completedTaskDates: [...state.completedTaskDates, new Date().toISOString()],
          tasksSaved: isHighRisk ? state.tasksSaved + 1 : state.tasksSaved,
          historicalCompletionRate: Math.min(100, state.historicalCompletionRate + 1)
        };
        // Auto Habit: Inbox Zero check
        const pendingToday = state.tasks.filter(t => new Date(t.deadline).toDateString() === new Date().toDateString() && t.status !== 'completed');
        if (pendingToday.length <= 1) { // 1 because the current task is just being marked complete
           return { ...newState, habits: state.habits.map(h => h.id === 'h3' ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source: 'Completed all daily tasks' } : h) };
        }
        return newState;
      }),
      
      logAgentAction: (stage, message) => set((state) => ({
        agentLogs: [
          { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), timestamp: new Date().toISOString(), stage, message },
          ...state.agentLogs
        ].slice(0, 100)
      })),
      
      addAIActionHistory: (desc, options) => set((state) => {
        const newAction = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          description: desc,
          riskDrop: options?.riskDrop,
          reason: options?.reason,
          confidence: options?.confidence
        };
        return {
          aiActionHistory: [newAction, ...state.aiActionHistory].slice(0, 50),
          aiDecisionsExecuted: state.aiDecisionsExecuted + 1
        };
      }),
      
      updateAgentMemory: (updates) => set((state) => ({
        agentMemory: { ...state.agentMemory, ...updates }
      })),
      clearAgentLogs: () => set({ agentLogs: [] }),

      startFocusSession: (taskId, durationMin) => set((state) => {
        // Auto Habit: Deep Work
        let habits = state.habits;
        if (durationMin >= 60) {
          habits = habits.map(h => h.id === 'h1' ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source: `Focus Session ${durationMin}m` } : h);
        }
        return {
          activeFocusTaskId: taskId,
          focusTimeRemaining: durationMin * 60,
          habits
        };
      }),
      
      endFocusSession: () => set({
        activeFocusTaskId: null,
        focusTimeRemaining: 0
      }),
      
      updateFocusTime: (seconds) => set({ focusTimeRemaining: seconds }),
      
      completeHabit: (habitId, source) => set((state) => ({
        habits: state.habits.map(h => {
          if (h.id === habitId) {
            return { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source };
          }
          return h;
        })
      })),
      
      calculateMetrics: () => set((state) => {
        const pendingTasks = state.tasks.filter(t => t.status !== 'completed');
        const workloadMinutes = pendingTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
        const workloadHours = workloadMinutes / 60;
        
        // Burnout Risk = 40% Workload + 25% Deadline Density + 20% Completion Rate + 15% Focus Streak
        // Pressure is capped at 100
        const workloadPressure = Math.min(100, (workloadHours / state.availableFocusHours) * 100);
        
        const deadlines48h = pendingTasks.filter(t => new Date(t.deadline).getTime() < Date.now() + 48 * 3600000).length;
        const deadlineDensity = Math.min(100, (deadlines48h / 4) * 100);
        
        const completionScore = 100 - state.historicalCompletionRate; // lower completion rate = higher risk
        const focusScore = Math.max(0, 100 - (state.focusStreak * 10)); // lower streak = higher risk
        
        let risk = (workloadPressure * 0.4) + (deadlineDensity * 0.25) + (completionScore * 0.2) + (focusScore * 0.15);
        risk = Math.round(Math.min(99, risk));
        
        const bFactors = [];
        if (workloadHours > state.availableFocusHours) bFactors.push(`${Math.round(workloadHours)}h workload remaining`);
        if (deadlines48h >= 2) bFactors.push(`${deadlines48h} deadlines within 48h`);
        if (state.focusStreak < 2) bFactors.push("Focus streak declining");
        if (bFactors.length === 0) bFactors.push("Optimal pacing");
        
        // Success Prediction = Urgency + Completion History + Available Time + Conflicts + Burnout
        let success = 100 - (risk * 0.4) + (state.historicalCompletionRate * 0.4);
        success = Math.round(Math.min(99, Math.max(10, success)));
        
        const sFactors = [];
        if (state.historicalCompletionRate > 80) sFactors.push("+ High completion rate");
        if (workloadHours <= state.availableFocusHours) sFactors.push("+ Sufficient focus time");
        else sFactors.push("- Workload exceeds available time");
        if (deadlines48h > 0) sFactors.push(`- ${deadlines48h} impending deadlines`);
        
        return {
          burnoutRisk: risk,
          burnoutFactors: bFactors,
          successPrediction: success,
          successPredictionFactors: sFactors
        };
      }),
      
      injectWorkloadTest: () => set((state) => {
        const stressIds = ['stress1', 'stress2', 'stress3', 'stress4'];
        const existingTasksFiltered = state.tasks.filter(t => !stressIds.includes(t.id));
        const newTasks: Task[] = [
          ...existingTasksFiltered,
          { id: 'stress1', title: 'Emergency Client Pitch', deadline: new Date(Date.now() + 3600000).toISOString(), urgencyScore: 98, status: 'pending', estimatedMinutes: 180, reasoning: ['Client emailed URGENT request 5 mins ago', 'High revenue impact'] },
          { id: 'stress2', title: 'System Outage Root Cause', deadline: new Date(Date.now() + 7200000).toISOString(), urgencyScore: 95, status: 'pending', estimatedMinutes: 120, reasoning: ['Production system down', 'Multiple user reports'] },
          { id: 'stress3', title: 'Q3 Financials Draft', deadline: new Date(Date.now() + 86400000).toISOString(), urgencyScore: 85, status: 'pending', estimatedMinutes: 240, reasoning: ['Due end of week', 'Requires data synthesis'] },
          { id: 'stress4', title: 'Board Deck Review', deadline: new Date(Date.now() + 86400000).toISOString(), urgencyScore: 80, status: 'pending', estimatedMinutes: 90, reasoning: ['Dependent on Q3 Financials'] }
        ];
        
        get().logAgentAction('Observe', 'Detected critical workload overload: 10+ hours required in next 24h.');
        
        // Trigger calculateMetrics immediately on the new state
        setTimeout(() => get().calculateMetrics(), 100);
        
        return { tasks: newTasks, focusStreak: 0 };
      }),
      
      triggerJudgeDemoMode: () => {
        // Step 1: Inject Chaos
        get().injectWorkloadTest();
        
        // Step 2: Analyze
        setTimeout(() => {
          get().logAgentAction('Analyze', 'Workload (10.5h) exceeds available focus time (4h). Predicting 72% chance of deadline failure.');
        }, 1500);
        
        // Step 3: Plan
        setTimeout(() => {
          get().logAgentAction('Plan', 'Identifying low-priority tasks for deferral. Synthesizing burnout recovery sequence...');
        }, 3000);
        
        // Step 4: Act (Resolve Burnout automatically)
        setTimeout(() => {
          get().logAgentAction('Act', 'Executing recovery protocol. Moving Q3 Financials & Board Deck to next week.');
          get().resolveBurnout();
          get().addAIActionHistory('Rescheduled 2 low-priority tasks to next week to prevent failure.', {
            riskDrop: '95% → 32%',
            reason: ['3 deadlines within 48h', 'Available focus time: 4h', 'Required work: 10.5h'],
            confidence: 96
          });
          get().calculateMetrics();
          
          setTimeout(() => {
             get().logAgentAction('Reflect', 'Burnout risk stabilized. Predicted deadline failure averted.');
          }, 1000);
          
        }, 5000);
      },
      
      resolveBurnout: () => set((state) => {
        get().logAgentAction('Plan', 'Rescheduling non-critical tasks to optimal slots.');
        
        // Reschedule logic: Push stress3 and stress4 out 3 days
        const updatedTasks = state.tasks.map(t => {
          if (t.id === 'stress3' || t.id === 'stress4') {
            return { ...t, deadline: new Date(Date.now() + 86400000 * 3).toISOString() };
          }
          return t;
        });
        
        const oldRisk = state.burnoutRisk;
        
        get().logAgentAction('Act', 'Rescheduled 2 tasks. Blocked focus window.');
        
        setTimeout(() => {
          get().calculateMetrics();
          const newRisk = get().burnoutRisk;
          get().addAIActionHistory('Rescheduled 2 low-priority tasks', {
            reason: [
              `Overload detected: ${oldRisk}% burnout risk`,
              `Conflict with critical project`,
              `Burnout risk reduced ${oldRisk}% → ${newRisk}%`
            ],
            confidence: 91
          });
          get().addAIActionHistory('Created Focus Session', {
            reason: ["Mandatory recovery period needed"],
            confidence: 88
          });
        }, 500);
        
        return { 
          tasks: updatedTasks,
          deadlinesPrevented: state.deadlinesPrevented + 2,
          hoursSaved: state.hoursSaved + 5.5,
          workloadOptimized: state.workloadOptimized + 14
        };
      }),
      
      // --- Schedule Actions ---
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id)
      })),
      snoozeAlarm: (eventId, minutes) => set((state) => {
        const events = state.events.map(e => {
          if (e.id === eventId) {
            const newStart = new Date(Date.now() + minutes * 60000).toISOString();
            // We just shift the start time and clear the dismissal so it triggers again
            return { ...e, startTime: newStart, alarmDismissed: false };
          }
          return e;
        });
        return { events };
      }),
      dismissAlarm: (eventId) => set((state) => ({
        events: state.events.map(e => e.id === eventId ? { ...e, alarmDismissed: true } : e)
      })),
      createFocusSession: (taskId, durationMin) => {
        // Also add to schedule if not already there
        const task = get().tasks.find(t => t.id === taskId);
        if (task) {
          get().addEvent({
            id: `focus-${Date.now()}`,
            title: `Focus Session: ${task.title}`,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + durationMin * 60000).toISOString(),
            isAlarmSet: true,
            isFocusSession: true,
            createdByAI: true,
            taskId
          });
        }
        
        set((state) => {
          let habits = state.habits;
          if (durationMin >= 60) {
            habits = habits.map(h => h.id === 'h1' ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source: `Focus Session ${durationMin}m` } : h);
          }
          return { activeFocusTaskId: taskId, focusTimeRemaining: durationMin * 60, habits };
        });
      },
      detectConflicts: (newEvent) => {
        const events = get().events;
        const newStart = new Date(newEvent.startTime).getTime();
        const newEnd = new Date(newEvent.endTime).getTime();
        
        const conflictingEvents = events.filter(e => {
          const eStart = new Date(e.startTime).getTime();
          const eEnd = new Date(e.endTime).getTime();
          // Check for overlap
          return Math.max(newStart, eStart) < Math.min(newEnd, eEnd);
        });
        
        return { hasConflict: conflictingEvents.length > 0, conflictingEvents };
      },
      acceptAISchedule: (taskId, title, startTime, endTime) => {
        get().addEvent({
          id: `ai-sched-${Date.now()}`,
          title,
          startTime,
          endTime,
          isAlarmSet: true,
          createdByAI: true,
          priority: 'high',
          taskId
        });
        get().logAgentAction('Act', `Added "${title}" to your schedule at ${new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      }
    }),
    {
      name: 'deadline-zero-storage-v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dataset.theme = state.theme;
          document.documentElement.dataset.mode = state.mode;
        }
      },
    }
  )
);
