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
  focusDurationMin: number;
  burnoutRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  historicalPatterns: string[];
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
}
