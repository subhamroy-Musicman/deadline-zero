import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'cyberpunk' | 'ocean' | 'sunset' | 'neon' | 'aurora' | 'synthwave' | 'emerald' | 'crimson' | 'midnight';
export type Mode = 'dark' | 'light';

import { AgentLog, AgentMemory, PipelineStage, Task, ScheduleEvent, AgentDecision } from '@/types';

interface AppState {
  theme: Theme;
  mode: Mode;
  compactMode: boolean;
  reducedMotion: boolean;
  isSidebarCollapsed: boolean;
  
  tasks: Task[];
  completedTaskDates: string[]; 
  tasksSaved: number;
  
  // Habit Tracker
  habits: { id: string; title: string; streak: number; lastCompleted: string | null; source?: string }[];
  
  agentLogs: AgentLog[];
  agentMemory: AgentMemory;
  decisionHistory: AgentDecision[];
  
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
  
  aiExecutionResult: { oldRisk: number, newRisk: number } | null;
  setAiExecutionResult: (result: { oldRisk: number, newRisk: number } | null) => void;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleCompactMode: () => void;
  toggleReducedMotion: () => void;
  toggleSidebar: () => void;
  
  // Auth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  hasSignedInBefore: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (user: any | null) => void;
  
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
  clearDashboard: () => void;

  startFocusSession: (taskId: string, durationMin: number) => void;
  endFocusSession: () => void;
  updateFocusTime: (seconds: number) => void;
  completeHabit: (habitId: string, source?: string) => void;
  
  // AI Engine Actions
  calculateMetrics: () => void;
  calculateConfidence: () => number;
  calculateImpactScore: (deadlinesPrevented: number, burnoutDrop: number, hoursSaved: number) => string;
  logDecision: (decision: Omit<AgentDecision, 'id' | 'timestamp'>) => void;
  executeDecision: (id: string) => void;
  dismissDecision: (id: string) => void;
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
      theme: 'midnight',
      mode: 'dark',
      compactMode: false,
      reducedMotion: false,
      
      tasks: initialTasks,
      completedTaskDates: [
        new Date().toISOString(),
        new Date(Date.now() - 86400000 * 1).toISOString(),
        new Date(Date.now() - 86400000 * 1).toISOString(),
        new Date(Date.now() - 86400000 * 2).toISOString(),
        new Date(Date.now() - 86400000 * 3).toISOString(),
        new Date(Date.now() - 86400000 * 3).toISOString(),
        new Date(Date.now() - 86400000 * 3).toISOString()
      ],
      tasksSaved: 0,
      
      habits: [
        { id: 'h1', title: 'Deep Work (90m)', streak: 0, lastCompleted: null },
        { id: 'h2', title: 'Plan Tomorrow', streak: 0, lastCompleted: null },
        { id: 'h3', title: 'Clear Inbox', streak: 0, lastCompleted: null }
      ],
      
      agentLogs: [],

      events: [],
      // Sidebar State
      isSidebarCollapsed: false,
      
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
      decisionHistory: [],
      agentMemory: {
        preferredWorkHours: { start: 9, end: 17 },
        completionRate: 85,
        focusPatterns: []
      },
      
      user: null,
      hasSignedInBefore: false,
      aiExecutionResult: null,
      setUser: (user) => {
        const state = get();
        if (user && !state.hasSignedInBefore) {
          // First time signing in on this browser! Reset everything to 0 to make it user-specific.
          set({
             user,
             hasSignedInBefore: true,
             tasks: [],
             completedTaskDates: [],
             events: [],
             deadlinesPrevented: 0,
             hoursSaved: 0,
             workloadOptimized: 0,
             aiDecisionsExecuted: 0,
             historicalCompletionRate: 0,
             focusStreak: 0,
             tasksSaved: 0,
             successPrediction: 0,
             burnoutRisk: 10,
             burnoutFactors: [],
             agentLogs: [{ id: Date.now().toString(), timestamp: new Date().toISOString(), stage: 'Observe', message: `Welcome! AI Coach initialized and ready to adapt to your workflow.` }],
             decisionHistory: [],
             aiActionHistory: [],
             habits: [
               { id: 'h1', title: 'Deep Work (90m)', streak: 0, lastCompleted: null },
               { id: 'h2', title: 'Plan Tomorrow', streak: 0, lastCompleted: null },
               { id: 'h3', title: 'Clear Inbox', streak: 0, lastCompleted: null }
             ]
          });
          setTimeout(() => get().calculateMetrics(), 100);
        } else {
          set({ user });
        }
      },
      setAiExecutionResult: (result) => set({ aiExecutionResult: result }),
      
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      toggleSidebar: () => set((state) => {
        const collapsed = !state.isSidebarCollapsed;
        document.documentElement.style.setProperty('--sidebar-width', collapsed ? '80px' : '320px');
        return { isSidebarCollapsed: collapsed };
      }),
      
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
      
      addTask: (task) => {
        set((state) => {
          const newTasks = [...state.tasks, task];
          const isFuture = new Date(task.deadline).getTime() > Date.now() + 86400000;
          let habits = state.habits;
          if (isFuture) {
            habits = habits.map(h => h.id === 'h2' ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source: 'Planned task for future' } : h);
          }
          return { tasks: newTasks, habits };
        });
        setTimeout(() => get().calculateMetrics(), 0);
      },
      updateTask: (id, updates) => {
        set((state) => {
          const targetTask = state.tasks.find(t => t.id === id);
          const isNowCompleted = updates.status === 'completed' && targetTask?.status !== 'completed';
          
          let newCompletedDates = state.completedTaskDates;
          let habits = state.habits;
          let historicalCompletionRate = state.historicalCompletionRate;

          if (isNowCompleted) {
            newCompletedDates = [...state.completedTaskDates, new Date().toISOString()];
            historicalCompletionRate = Math.min(100, state.historicalCompletionRate + 1);

            const pendingToday = state.tasks.filter(t => new Date(t.deadline).toDateString() === new Date().toDateString() && t.status !== 'completed' && t.id !== id);
            if (pendingToday.length === 0 && state.tasks.filter(t => new Date(t.deadline).toDateString() === new Date().toDateString()).length > 0) {
              habits = habits.map(h => h.id === 'h3' ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toISOString(), source: 'Completed all daily tasks' } : h);
            }
          }

          return {
            tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
            completedTaskDates: newCompletedDates,
            habits,
            historicalCompletionRate
          };
        });
        setTimeout(() => get().calculateMetrics(), 0);
      },
      
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
          deadlinesPrevented: isHighRisk ? state.deadlinesPrevented + 1 : state.deadlinesPrevented,
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
          { id: Date.now().toString() + Math.random().toString(36).substring(2, 7), timestamp: new Date().toISOString(), stage, message },
          ...state.agentLogs
        ].slice(0, 100)
      })),
      
      logDecision: (decision) => set((state) => ({
        decisionHistory: [
          { ...decision, id: Date.now().toString() + Math.random().toString(36).substring(2, 7), timestamp: new Date().toISOString() },
          ...state.decisionHistory
        ].slice(0, 100)
      })),

      executeDecision: (id) => {
        const state = get();
        const decision = state.decisionHistory.find(d => d.id === id);
        if (!decision || decision.status !== 'pending') return;

        let newTasks = state.tasks;
        if (decision.actionPayload?.updatedTasks) {
          newTasks = decision.actionPayload.updatedTasks;
        }

        set({
          tasks: newTasks,
          decisionHistory: state.decisionHistory.map(d => 
            d.id === id ? { ...d, status: 'executed' as const } : d
          ),
          deadlinesPrevented: state.deadlinesPrevented + (decision.actionPayload?.deadlinesPrevented || 0),
          hoursSaved: state.hoursSaved + (decision.actionPayload?.hoursSaved || 0),
          workloadOptimized: state.workloadOptimized + (decision.actionPayload?.hoursSaved ? decision.actionPayload.hoursSaved * 60 : 0),
          aiDecisionsExecuted: state.aiDecisionsExecuted + 1
        });
        
        get().calculateMetrics();
      },

      dismissDecision: (id) => set((state) => ({
        decisionHistory: state.decisionHistory.map(d => 
          d.id === id ? { ...d, status: 'dismissed' as const } : d
        )
      })),
      
      clearDashboard: () => set({
        tasks: [],
        events: [],
        activeFocusTaskId: null,
        focusTimeRemaining: 0,
        activeRoadmap: null,
        burnoutRisk: 10,
        burnoutFactors: [],
        agentLogs: [],
        decisionHistory: [],
        aiActionHistory: [],
        deadlinesPrevented: 0,
        hoursSaved: 0,
        workloadOptimized: 0,
        aiDecisionsExecuted: 0,
        aiExecutionResult: null,
        habits: [
          { id: 'h1', title: 'Deep Work (90m)', streak: 0, lastCompleted: null },
          { id: 'h2', title: 'Plan Tomorrow', streak: 0, lastCompleted: null },
          { id: 'h3', title: 'Clear Inbox', streak: 0, lastCompleted: null }
        ]
      }),
      
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
          habits,
          hoursSaved: state.hoursSaved + (durationMin / 60),
          aiDecisionsExecuted: state.aiDecisionsExecuted + 1
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
        // Only count workload for urgent tasks (due within 48h) to compare against near-term available capacity
        const urgentTasks = pendingTasks.filter(t => new Date(t.deadline).getTime() < Date.now() + 48 * 3600000);
        const workloadMinutes = urgentTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
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
        
        // Success Prediction: Grounded in history, penalized by current pressure
        let success = state.historicalCompletionRate;
        success -= (risk * 0.3); // Burnout risk penalty
        success -= (deadlines48h * 3); // Immediate deadlines penalty
        if (workloadHours > state.availableFocusHours) {
           success -= ((workloadHours - state.availableFocusHours) * 4); // Overbooking penalty
        }
        success += Math.min(10, state.focusStreak * 2); // Focus momentum bonus
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
      
      calculateConfidence: () => {
        const state = get();
        const pendingTasks = state.tasks.filter(t => t.status !== 'completed');
        const overdueTasks = pendingTasks.filter(t => new Date(t.deadline).getTime() < Date.now()).length;
        const deadlines48h = pendingTasks.filter(t => new Date(t.deadline).getTime() < Date.now() + 48 * 3600000).length;
        const workloadMinutes = pendingTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
        const workloadHours = workloadMinutes / 60;
        
        // If Gemini AI generated tasks with a confidence score, calculate the real-time average!
        const aiTasks = pendingTasks.filter(t => t.confidenceScore !== undefined);
        let baseConfidence = 90;
        
        if (aiTasks.length > 0) {
          const sumConfidence = aiTasks.reduce((acc, t) => acc + (t.confidenceScore || 0), 0);
          baseConfidence = sumConfidence / aiTasks.length;
        }
        
        let confidence = baseConfidence;
        
        // Bonus for high completion rate
        confidence += (state.historicalCompletionRate > 80 ? 5 : 0);
        
        // Penalties based on real-time workload
        confidence -= (overdueTasks * 5); // Overdue penalty
        if (workloadHours > state.availableFocusHours) {
          confidence -= ((workloadHours - state.availableFocusHours) * 3); // Workload pressure penalty
        }
        confidence -= (deadlines48h * 2); // Deadline density penalty
        confidence -= (state.events.length > 5 ? 2 : 0); // Scheduling conflict placeholder
        
        return Math.round(Math.min(99, Math.max(10, confidence)));
      },
      
      calculateImpactScore: (deadlinesPrevented: number, burnoutDrop: number, hoursSaved: number) => {
        let score = 5.0; // Base baseline
        score += (deadlinesPrevented * 1.5);
        score += (burnoutDrop / 10);
        score += (hoursSaved * 0.5);
        return Math.min(9.9, score).toFixed(1);
      },
      
      injectWorkloadTest: () => set((state) => {
        const stressIds = ['hackathon', 'dsa', 'ml', 'internship', 'gym'];
        const existingTasksFiltered = state.tasks.filter(t => !stressIds.includes(t.id));
        const newTasks: Task[] = [
          ...existingTasksFiltered,
          { id: 'hackathon', title: 'Hackathon Submission', deadline: new Date(Date.now() + 24 * 3600000).toISOString(), urgencyScore: 98, status: 'pending', estimatedMinutes: 480, reasoning: ['Critical deadline in 24h', 'High impact on portfolio'] },
          { id: 'dsa', title: 'DSA Contest', deadline: new Date(Date.now() + 36 * 3600000).toISOString(), urgencyScore: 90, status: 'pending', estimatedMinutes: 180, reasoning: ['Scheduled contest', 'Cannot be rescheduled'] },
          { id: 'ml', title: 'ML Assignment', deadline: new Date(Date.now() + 12 * 3600000).toISOString(), urgencyScore: 95, status: 'pending', estimatedMinutes: 240, reasoning: ['Due tonight', 'High academic weight'] },
          { id: 'internship', title: 'Internship Application', deadline: new Date(Date.now() + 72 * 3600000).toISOString(), urgencyScore: 70, status: 'pending', estimatedMinutes: 120, reasoning: ['Rolling admissions', 'Flexible deadline'] },
          { id: 'gym', title: 'Missed Gym Habit', deadline: new Date(Date.now() + 24 * 3600000).toISOString(), urgencyScore: 50, status: 'pending', estimatedMinutes: 60, reasoning: ['Missed yesterday', 'Low urgency but important for health'] }
        ];
        
        setTimeout(() => get().calculateMetrics(), 100);
        
        return { tasks: newTasks, focusStreak: 0, availableFocusHours: 6 };
      }),
      
      triggerJudgeDemoMode: () => {
        // Step 1: Inject Chaos
        get().injectWorkloadTest();
        get().logAgentAction('Observe', 'Detected critical workload overload: 18 hours required in next 48h. 6h available capacity.');
        
        // Step 2: Analyze
        setTimeout(() => {
          get().logAgentAction('Analyze', 'Capacity exceeded by 12h. Burnout probability elevated (85%). Predicting high chance of missing ML Assignment and Hackathon.');
        }, 2000);
        
        // Step 3: Plan
        setTimeout(() => {
          get().logAgentAction('Plan', 'Reprioritizing tasks. Planning to defer Internship Application & Gym. Creating focus session for ML Assignment.');
        }, 4000);
        
        // Step 4: Act
        setTimeout(() => {
          get().logAgentAction('Act', 'Executing recovery protocol. Rescheduled 2 low-priority tasks. Generated interventions.');
          get().resolveBurnout();
          get().calculateMetrics();
        }, 6000);
        
        // Step 5: Reflect
        setTimeout(() => {
           get().logAgentAction('Reflect', 'Burnout risk reduced. Deadlines protected. 3 hours recovered.');
           get().setAiExecutionResult({ oldRisk: 85, newRisk: 68 });
        }, 8000);
      },
      
      resolveBurnout: () => {
        const state = get();
        // Calculate the real tasks to reschedule
        const tasksToReschedule = state.tasks.filter(t => t.id === 'internship' || t.id === 'gym' || (!['hackathon', 'dsa', 'ml'].includes(t.id) && t.urgencyScore < 80));
        
        if (tasksToReschedule.length === 0) return; // Nothing to do

        const updatedTasks = state.tasks.map(t => {
          if (tasksToReschedule.find(tr => tr.id === t.id)) {
            return { ...t, deadline: new Date(Date.now() + 86400000 * 7).toISOString() }; 
          }
          return t;
        });
        
        const realHoursSaved = tasksToReschedule.reduce((acc, t) => acc + (t.estimatedMinutes || 60) / 60, 0);
        const realDeadlinesPrevented = tasksToReschedule.filter(t => new Date(t.deadline).getTime() < Date.now() + 86400000 * 2).length;
        
        const oldRisk = state.burnoutRisk;
        let newRisk = oldRisk - 15;
        if (newRisk < 10) newRisk = 10;
        
        const conf = get().calculateConfidence();
        const impact = get().calculateImpactScore(realDeadlinesPrevented, oldRisk - newRisk, realHoursSaved);

        get().logDecision({
          category: "burnout",
          status: "pending",
          observation: [`${oldRisk}% burnout risk detected`, `High workload clustering`],
          analysis: [`Capacity exceeded`, `Predictive failure of critical tasks`],
          decision: `Reschedule ${tasksToReschedule.length} non-critical tasks by 7 days`,
          reasoning: [`Protect critical deadlines`, `Recover ${realHoursSaved.toFixed(1)} hours of focus time`],
          expectedOutcome: `Burnout risk reduced from ${oldRisk}% to ${newRisk}%`,
          confidence: conf,
          impactScore: `${impact} / 10`,
          metricsBefore: { burnoutRisk: oldRisk, availableHours: state.availableFocusHours },
          metricsAfter: { burnoutRisk: newRisk, availableHours: state.availableFocusHours },
          actionPayload: {
            updatedTasks,
            deadlinesPrevented: realDeadlinesPrevented,
            hoursSaved: realHoursSaved
          }
        });
      },
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
          return { 
            activeFocusTaskId: taskId, 
            focusTimeRemaining: durationMin * 60, 
            habits,
            hoursSaved: state.hoursSaved + (durationMin / 60),
            aiDecisionsExecuted: state.aiDecisionsExecuted + 1
          };
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
        set((state) => {
           const sT = new Date(startTime).getTime();
           const eT = new Date(endTime).getTime();
           const mins = Math.max(15, Math.round((eT - sT) / 60000));
           return {
             workloadOptimized: state.workloadOptimized + mins,
             aiDecisionsExecuted: state.aiDecisionsExecuted + 1
           };
        });
      }
    }),
    {
      name: 'deadline-zero-storage-v3',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dataset.theme = state.theme;
          document.documentElement.dataset.mode = state.mode;
        }
      },
    }
  )
);
