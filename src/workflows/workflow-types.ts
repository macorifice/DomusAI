import { WorkflowState } from '@models/types';

export interface WorkflowInput {
  userId: string;
  preferences: Record<string, unknown>;
}

export interface WorkflowProgress {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  result?: unknown;
  timestamp: Date;
}

export interface LoadedWorkflowSnapshot {
  state: WorkflowState;
  history: WorkflowProgress[];
}
