import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ChecklistStepStatusMap {
  [stepId: string]: boolean;
}

@Injectable()
export class WorkflowChecklistRepository {
  private readonly client: SupabaseClient | null;
  private readonly fallbackStore = new Map<string, ChecklistStepStatusMap>();

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.client = url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;
  }

  async getStepStatuses(userId: string): Promise<ChecklistStepStatusMap> {
    if (!this.client) {
      return this.fallbackStore.get(userId) || {};
    }

    const { data, error } = await this.client
      .from('workflow_checklist_steps')
      .select('step_id, done')
      .eq('workflow_user_id', userId);

    if (error || !data) {
      return this.fallbackStore.get(userId) || {};
    }

    return data.reduce<ChecklistStepStatusMap>((acc, row) => {
      const stepId = String(row.step_id);
      acc[stepId] = row.done === true;
      return acc;
    }, {});
  }

  async setStepStatus(userId: string, stepId: string, done: boolean): Promise<void> {
    const current = this.fallbackStore.get(userId) || {};
    this.fallbackStore.set(userId, {
      ...current,
      [stepId]: done,
    });

    if (!this.client) {
      return;
    }

    await this.client.from('workflow_checklist_steps').upsert(
      {
        workflow_user_id: userId,
        step_id: stepId,
        done,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'workflow_user_id,step_id' },
    );
  }
}
