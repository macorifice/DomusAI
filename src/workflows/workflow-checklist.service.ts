import { Injectable } from '@nestjs/common';
import { ChecklistStepStatusMap } from './workflow-checklist.repository';

export type ChecklistPriority = 'required' | 'recommended' | 'optional';
export type WorkflowPhase = 'search' | 'evaluation' | 'negotiation' | 'documentation' | 'completed';
export type ChecklistStepState = 'locked' | 'available' | 'done';

export interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  priority: ChecklistPriority;
  availableAfterPhase: Exclude<WorkflowPhase, 'completed'>;
  dependsOnPhases?: Array<Exclude<WorkflowPhase, 'completed'>>;
  parallelizable?: boolean;
}

export interface ChecklistStepWithState extends ChecklistStep {
  state: ChecklistStepState;
  done: boolean;
}

export interface WorkflowChecklist {
  steps: ChecklistStepWithState[];
  meta: {
    requiresMortgage: boolean;
    dealType?: string;
  };
}

@Injectable()
export class WorkflowChecklistService {
  buildChecklist(preferences: Record<string, any>): Omit<WorkflowChecklist, 'steps'> & { steps: ChecklistStep[] } {
    const requiresMortgage = preferences?.requiresMortgage === true;
    const dealType = typeof preferences?.dealType === 'string' ? preferences.dealType : undefined;

    const steps: ChecklistStep[] = [
      {
        id: 'analyze-search-results',
        title: 'Analizza shortlist immobili',
        description: 'Confronta 3-5 immobili emersi dalla ricerca e seleziona i candidati migliori.',
        priority: 'required',
        availableAfterPhase: 'evaluation',
        dependsOnPhases: ['search'],
      },
      {
        id: 'prepare-viewings',
        title: 'Organizza visite e check tecnici',
        description: 'Pianifica visite, verifica stato immobile e segnala eventuali criticita per la trattativa.',
        priority: 'required',
        availableAfterPhase: 'evaluation',
        dependsOnPhases: ['search'],
      },
      {
        id: 'mortgage-comparators',
        title: 'Confronta mutui con comparatori',
        description:
          'Raccogli simulazioni indicative su tasso, TAEG e rata per restringere 2-3 banche target prima del colloquio.',
        priority: requiresMortgage ? 'recommended' : 'optional',
        availableAfterPhase: 'evaluation',
        dependsOnPhases: ['search'],
        parallelizable: true,
      },
      {
        id: 'bank-preselection',
        title: 'Pre-seleziona banche',
        description:
          'Se richiedi mutuo, prepara documenti anagrafici/reddituali e pianifica colloqui preliminari con le banche selezionate.',
        priority: requiresMortgage ? 'recommended' : 'optional',
        availableAfterPhase: 'evaluation',
        dependsOnPhases: ['search', 'evaluation'],
        parallelizable: true,
      },
      {
        id: 'define-offer-strategy',
        title: 'Definisci strategia di offerta',
        description: 'Allinea prezzo obiettivo, margine di negoziazione e condizioni non economiche.',
        priority: 'required',
        availableAfterPhase: 'negotiation',
        dependsOnPhases: ['evaluation'],
      },
      {
        id: 'collect-documents',
        title: 'Raccogli documentazione',
        description:
          'Procedi con checklist documentale (visure, planimetrie, APE, conformita) in parallelo alle ultime fasi negoziali.',
        priority: 'required',
        availableAfterPhase: 'documentation',
        dependsOnPhases: ['negotiation'],
        parallelizable: true,
      },
    ];

    if (requiresMortgage && this.isMortgageClauseApplicable(dealType)) {
      steps.push({
        id: 'mortgage-suspensive-clause',
        title: 'Inserisci clausola sospensiva mutuo',
        description:
          "Inserisci nel compromesso una clausola sospensiva legata all'approvazione del mutuo entro termini concordati.",
        priority: 'required',
        availableAfterPhase: 'negotiation',
        dependsOnPhases: ['evaluation'],
      });
    }

    return {
      steps,
      meta: {
        requiresMortgage,
        ...(dealType ? { dealType } : {}),
      },
    };
  }

  private isMortgageClauseApplicable(dealType?: string): boolean {
    if (!dealType) return true;
    return ['compromesso', 'compromesso_finale', 'preliminare'].includes(dealType);
  }

  materializeChecklist(
    checklist: Omit<WorkflowChecklist, 'steps'> & { steps: ChecklistStep[] },
    phase: WorkflowPhase,
    statuses: ChecklistStepStatusMap,
  ): WorkflowChecklist {
    const steps = checklist.steps.map((step) => {
      const isDone = statuses[step.id] === true;
      const available = this.isStepAvailable(step, phase);
      const state: ChecklistStepState = isDone ? 'done' : available ? 'available' : 'locked';

      return {
        ...step,
        state,
        done: isDone,
      };
    });

    return {
      ...checklist,
      steps,
    };
  }

  canUpdateStep(
    checklist: Omit<WorkflowChecklist, 'steps'> & { steps: ChecklistStep[] },
    phase: WorkflowPhase,
    stepId: string,
  ): boolean {
    const step = checklist.steps.find((entry) => entry.id === stepId);
    if (!step) return false;
    return this.isStepAvailable(step, phase);
  }

  hasStep(checklist: Omit<WorkflowChecklist, 'steps'> & { steps: ChecklistStep[] }, stepId: string): boolean {
    return checklist.steps.some((entry) => entry.id === stepId);
  }

  private isStepAvailable(step: ChecklistStep, phase: WorkflowPhase): boolean {
    // Rende disponibili solo gli step coerenti con la fase corrente.
    // Gli step completati restano visibili come `done` (gestito in materializeChecklist).
    if (phase === 'completed') return false;

    return step.availableAfterPhase === phase;
  }
}
