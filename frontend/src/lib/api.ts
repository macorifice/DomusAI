export type WorkflowPhase =
  | 'search'
  | 'evaluation'
  | 'negotiation'
  | 'documentation'
  | 'completed';

export interface AgentInfo {
  name: string;
  description: string;
}

export interface WorkflowState {
  phase: WorkflowPhase;
  userId: string;
  metadata: Record<string, unknown>;
}

export interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  priority: 'required' | 'recommended' | 'optional';
  state: 'locked' | 'available' | 'done';
  done: boolean;
  dependsOnPhases?: string[];
  parallelizable?: boolean;
}

export interface WorkflowChecklist {
  steps: ChecklistStep[];
  meta: {
    requiresMortgage?: boolean;
    dealType?: string;
  };
}

type Json = Record<string, unknown>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

type AccessTokenGetter = () => Promise<string | null>;

let getAccessToken: AccessTokenGetter | null = null;

/** Collega il Bearer JWT (es. access token Supabase) alle chiamate workflow. */
export function setWorkflowApiAccessTokenGetter(getter: AccessTokenGetter | null) {
  getAccessToken = getter;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken ? await getAccessToken() : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const payload = (await response.json()) as Json;
  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : (payload.message as string);
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return payload as T;
}

export const workflowApi = {
  getAgents: () => apiRequest<AgentInfo[]>('/workflow/agents'),

  startWorkflow: (body: Json) =>
    apiRequest<WorkflowState>('/workflow/start', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  runWorkflowPhase: (userId: string, endpoint: string, body: Json) =>
    apiRequest<Json>(`/workflow/${userId}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getState: (userId: string) => apiRequest<WorkflowState>(`/workflow/${userId}/state`),

  getHistory: (userId: string) => apiRequest<Json[]>(`/workflow/${userId}/history`),

  getChecklist: (userId: string) => apiRequest<WorkflowChecklist>(`/workflow/${userId}/checklist`),

  setChecklistStepStatus: (userId: string, stepId: string, done: boolean) =>
    apiRequest<WorkflowChecklist>(`/workflow/${userId}/checklist/${stepId}/status`, {
      method: 'POST',
      body: JSON.stringify({ done }),
    }),
};
