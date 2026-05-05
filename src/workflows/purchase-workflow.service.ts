/**
 * Purchase Workflow Service
 */

import { Injectable } from '@nestjs/common';
import { SearchAgent } from '@agents/search.agent';
import { EvaluationAgent } from '@agents/evaluation.agent';
import { NegotiationAgent } from '@agents/negotiation.agent';
import { DocumentationAgent } from '@agents/documentation.agent';
import { WorkflowState, Property, ExecutionResult } from '@models/types';
import { Logger } from '@common/logger';
import { WorkflowChecklistService, WorkflowChecklist } from './workflow-checklist.service';
import { WorkflowChecklistRepository } from './workflow-checklist.repository';
import { WorkflowStateRepository } from './workflow-state.repository';
import type { WorkflowInput, WorkflowProgress } from './workflow-types';

export type { WorkflowInput, WorkflowProgress } from './workflow-types';

@Injectable()
export class PurchaseWorkflow {
  private readonly logger = new Logger('PurchaseWorkflow');
  private states: Map<string, WorkflowState> = new Map();
  private history: Map<string, WorkflowProgress[]> = new Map();

  constructor(
    private readonly searchAgent: SearchAgent,
    private readonly evaluationAgent: EvaluationAgent,
    private readonly negotiationAgent: NegotiationAgent,
    private readonly documentationAgent: DocumentationAgent,
    private readonly workflowChecklistService: WorkflowChecklistService,
    private readonly workflowChecklistRepository: WorkflowChecklistRepository,
    private readonly workflowStateRepository: WorkflowStateRepository,
  ) {}

  /**
   * Avvia il workflow
   */
  async start(input: WorkflowInput): Promise<WorkflowState> {
    this.logger.log(`Starting workflow for user: ${input.userId}`);

    const state: WorkflowState = {
      phase: 'search',
      userId: input.userId,
      metadata: input.preferences as Record<string, unknown>,
    };

    this.states.set(input.userId, state);
    this.history.set(input.userId, []);
    this.recordProgress(input.userId, 'setup', 'completed', { preferences: input.preferences });

    await this.persist(input.userId);
    return state;
  }

  /**
   * Fase 1: Ricerca
   */
  async search(userId: string, searchCriteria: Record<string, any>): Promise<ExecutionResult> {
    await this.ensureLoaded(userId);
    const state = this.syncGetState(userId);
    this.logger.log(`Search phase initiated for user: ${userId}`);

    try {
      this.recordProgress(userId, 'search', 'in-progress');

      const result = await this.searchAgent.execute(searchCriteria);

      if (result.status === 'success') {
        state.phase = 'evaluation';
        state.metadata.searchResults = result.data;
        state.metadata.checklist = this.workflowChecklistService.buildChecklist(state.metadata);
        this.recordProgress(userId, 'search', 'completed', result.data);
      } else {
        this.recordProgress(userId, 'search', 'pending', { error: result.error });
      }

      return result;
    } catch (error) {
      this.logger.error('Error in search phase', error as Error);
      this.recordProgress(userId, 'search', 'pending', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      await this.persist(userId);
    }
  }

  /**
   * Fase 2: Valutazione
   */
  async evaluate(userId: string, property: Property): Promise<ExecutionResult> {
    await this.ensureLoaded(userId);
    const state = this.syncGetState(userId);
    this.logger.log(`Evaluation phase initiated for property: ${property.id}`);

    try {
      this.recordProgress(userId, 'evaluation', 'in-progress');

      const result = await this.evaluationAgent.execute({ property });

      if (result.status === 'success') {
        state.phase = 'negotiation';
        state.propertyId = property.id;
        state.metadata.evaluation = result.data;
        this.recordProgress(userId, 'evaluation', 'completed', result.data);
      } else {
        this.recordProgress(userId, 'evaluation', 'pending', { error: result.error });
      }

      return result;
    } catch (error) {
      this.logger.error('Error in evaluation phase', error as Error);
      this.recordProgress(userId, 'evaluation', 'pending', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      await this.persist(userId);
    }
  }

  /**
   * Fase 3: Negoziazione
   */
  async negotiate(userId: string, property: Property): Promise<ExecutionResult> {
    await this.ensureLoaded(userId);
    const state = this.syncGetState(userId);
    const evaluation = state.metadata.evaluation;
    const marketValue = evaluation?.estimatedValue || property.price;

    const requiresMortgage = state.metadata?.requiresMortgage === true;
    const dealType = state.metadata?.dealType;

    this.logger.log(`Negotiation phase initiated for property: ${property.id}`);

    try {
      this.recordProgress(userId, 'negotiation', 'in-progress');

      const result = await this.negotiationAgent.execute({
        property,
        marketValue,
        estimatedValue: marketValue,
        dealContext: { requiresMortgage, dealType },
      });

      if (result.status === 'success') {
        state.phase = 'documentation';
        state.metadata.negotiationStrategy = result.data;
        this.recordProgress(userId, 'negotiation', 'completed', result.data);
      } else {
        this.recordProgress(userId, 'negotiation', 'pending', { error: result.error });
      }

      return result;
    } catch (error) {
      this.logger.error('Error in negotiation phase', error as Error);
      this.recordProgress(userId, 'negotiation', 'pending', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      await this.persist(userId);
    }
  }

  /**
   * Fase 4: Documentazione
   */
  async manageDocumentation(
    userId: string,
    propertyType: string,
    region: string,
    documents?: string[],
  ): Promise<ExecutionResult> {
    await this.ensureLoaded(userId);
    const state = this.syncGetState(userId);
    this.logger.log(`Documentation phase initiated`);

    try {
      this.recordProgress(userId, 'documentation', 'in-progress');

      const result = await this.documentationAgent.execute({
        propertyType,
        region,
        documents,
      });

      if (result.status === 'success') {
        state.phase = 'completed';
        state.metadata.documentation = result.data;
        this.recordProgress(userId, 'documentation', 'completed', result.data);
        this.recordProgress(userId, 'completion', 'completed', { status: 'workflow completed' });
      } else {
        this.recordProgress(userId, 'documentation', 'pending', { error: result.error });
      }

      return result;
    } catch (error) {
      this.logger.error('Error in documentation phase', error as Error);
      this.recordProgress(userId, 'documentation', 'pending', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      await this.persist(userId);
    }
  }

  /**
   * Completa il workflow
   */
  async complete(userId: string): Promise<WorkflowState> {
    await this.ensureLoaded(userId);
    const state = this.syncGetState(userId);
    state.phase = 'completed';
    this.recordProgress(userId, 'completion', 'completed', { status: 'workflow completed' });
    this.logger.log(`Workflow completed for user: ${userId}`);
    await this.persist(userId);
    return state;
  }

  /**
   * Ottieni lo stato del workflow (carica da DB se necessario)
   */
  async getState(userId: string): Promise<WorkflowState> {
    await this.ensureLoaded(userId);
    return this.syncGetState(userId);
  }

  /**
   * Ottieni la cronologia/progresso
   */
  async getProgress(userId: string): Promise<WorkflowProgress[]> {
    await this.ensureLoaded(userId);
    return this.history.get(userId) || [];
  }

  async getChecklist(userId: string): Promise<WorkflowChecklist> {
    const state = await this.getState(userId);
    const fallback = this.workflowChecklistService.buildChecklist(state.metadata);
    const baseChecklist = (state.metadata?.checklist || fallback) as typeof fallback;

    const statuses = await this.workflowChecklistRepository.getStepStatuses(userId);
    return this.workflowChecklistService.materializeChecklist(baseChecklist, state.phase, statuses);
  }

  async setChecklistStepStatus(userId: string, stepId: string, done: boolean): Promise<WorkflowChecklist> {
    const state = await this.getState(userId);
    const fallback = this.workflowChecklistService.buildChecklist(state.metadata);
    const baseChecklist = (state.metadata?.checklist || fallback) as typeof fallback;

    if (!this.workflowChecklistService.hasStep(baseChecklist, stepId)) {
      throw new Error(`Step non valido: ${stepId}`);
    }

    if (!this.workflowChecklistService.canUpdateStep(baseChecklist, state.phase, stepId)) {
      throw new Error(`Step non disponibile nella fase corrente: ${stepId}`);
    }

    await this.workflowChecklistRepository.setStepStatus(userId, stepId, done);
    return this.getChecklist(userId);
  }

  /**
   * Resetta il workflow (per testing e riavvio da zero)
   */
  async reset(userId: string): Promise<void> {
    this.states.delete(userId);
    this.history.delete(userId);
    await this.workflowStateRepository.delete(userId);
    this.logger.log(`Workflow reset for user: ${userId}`);
  }

  private async ensureLoaded(userId: string): Promise<void> {
    if (this.states.has(userId)) {
      return;
    }
    const loaded = await this.workflowStateRepository.load(userId);
    if (!loaded) {
      return;
    }
    this.states.set(userId, loaded.state);
    this.history.set(userId, loaded.history);
  }

  private syncGetState(userId: string): WorkflowState {
    const state = this.states.get(userId);
    if (!state) {
      throw new Error(`Workflow non trovato per l'utente ${userId}`);
    }
    return state;
  }

  private async persist(userId: string): Promise<void> {
    const state = this.states.get(userId);
    if (!state) {
      return;
    }
    const hist = this.history.get(userId) || [];
    await this.workflowStateRepository.save(userId, state, hist);
  }

  /**
   * Registra il progresso di una fase
   */
  private recordProgress(
    userId: string,
    phase: string,
    status: 'completed' | 'in-progress' | 'pending',
    result?: any,
  ): void {
    const userHistory = this.history.get(userId) || [];
    userHistory.push({
      phase,
      status,
      result,
      timestamp: new Date(),
    });
    this.history.set(userId, userHistory);
  }
}
