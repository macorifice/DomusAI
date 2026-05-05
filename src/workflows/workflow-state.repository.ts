import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WorkflowState } from '@models/types';
import type { LoadedWorkflowSnapshot, WorkflowProgress } from './workflow-types';

interface HistoryRowDTO {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  result?: unknown;
  timestamp: string;
}

function parseHistory(rows: HistoryRowDTO[] | null): WorkflowProgress[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => ({
    phase: row.phase,
    status: row.status,
    result: row.result,
    timestamp: new Date(row.timestamp),
  }));
}

function serializeHistory(history: WorkflowProgress[]): HistoryRowDTO[] {
  return history.map((entry) => ({
    phase: entry.phase,
    status: entry.status,
    result: entry.result,
    timestamp: entry.timestamp.toISOString(),
  }));
}

@Injectable()
export class WorkflowStateRepository {
  private readonly client: SupabaseClient | null;
  private readonly fallback = new Map<string, LoadedWorkflowSnapshot>();

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.client = url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;
  }

  async load(userId: string): Promise<LoadedWorkflowSnapshot | null> {
    if (!this.client) {
      return this.fallback.get(userId) ?? null;
    }

    const { data, error } = await this.client
      .from('purchase_workflows')
      .select('phase, metadata, history, property_id, transaction_id')
      .eq('workflow_user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return this.fallback.get(userId) ?? null;
    }

    const meta = data.metadata && typeof data.metadata === 'object' ? (data.metadata as Record<string, unknown>) : {};
    const state: WorkflowState = {
      phase: data.phase as WorkflowState['phase'],
      userId,
      metadata: meta,
      propertyId: data.property_id ?? undefined,
      transactionId: data.transaction_id ?? undefined,
    };

    const history = parseHistory(data.history as HistoryRowDTO[] | null);

    return { state, history };
  }

  async save(userId: string, state: WorkflowState, history: WorkflowProgress[]): Promise<void> {
    const snapshot: LoadedWorkflowSnapshot = { state, history };
    this.fallback.set(userId, snapshot);

    if (!this.client) {
      return;
    }

    const payload = {
      workflow_user_id: userId,
      phase: state.phase,
      metadata: state.metadata ?? {},
      history: serializeHistory(history),
      property_id: state.propertyId ?? null,
      transaction_id: state.transactionId ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client.from('purchase_workflows').upsert(payload, { onConflict: 'workflow_user_id' });

    if (error) {
      throw new Error(`Persistenza workflow fallita: ${error.message}`);
    }
  }

  async delete(userId: string): Promise<void> {
    this.fallback.delete(userId);

    if (!this.client) {
      return;
    }

    await this.client.from('purchase_workflows').delete().eq('workflow_user_id', userId);
  }
}
