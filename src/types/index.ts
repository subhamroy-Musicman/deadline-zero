export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string; // ISO string
  urgencyScore: number; // 1-100, calculated by AI
  status: TaskStatus;
  estimatedMinutes?: number;
  subTasks?: SubTask[];
  confidenceScore?: number; // 1-100, Agent's certainty in its plan
  reasoning?: string[]; // Array of strings explaining why the agent made a decision
}

export type PipelineStage = 'Observe' | 'Analyze' | 'Plan' | 'Act' | 'Reflect';

export interface AgentLog {
  id: string;
  timestamp: string;
  stage: PipelineStage;
  message: string;
}

export interface AgentMemory {
  preferredWorkHours: { start: number; end: number }; // 0-23 hours
  completionRate: number; // 0-100 percentage of tasks completed on time
  focusPatterns: string[]; // e.g. ["Completes most work between 8PM-11PM"]
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  category: "burnout" | "scheduling" | "priority" | "focus" | "conflict" | "prediction";
  observation: string[];
  analysis: string[];
  decision: string;
  reasoning: string[];
  expectedOutcome: string;
  confidence: number;
  impactScore: string;
  status?: "pending" | "executed" | "dismissed";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionPayload?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metricsBefore?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metricsAfter?: Record<string, any>;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CoachMessage {
  id: string;
  type: 'suggestion' | 'warning' | 'encouragement' | 'clarification' | 'greeting';
  text: string;
  timestamp: string; // ISO string
  actionable?: boolean; // If true, shows action buttons
  focusTaskId?: string; // If provided, shows a "Start Focus Session" button
}
export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAlarmSet: boolean;
  alarmDismissed?: boolean;
  taskId?: string;
  createdByAI?: boolean;
  priority?: "low" | "medium" | "high" | "critical";
  isFocusSession?: boolean;
  hasConflict?: boolean;
}
