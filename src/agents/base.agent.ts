/**
 * Base Agent - Classe astratta per tutti gli agenti
 */

import { ExecutionResult, WorkflowState } from '@models/types';

export abstract class BaseAgent {
  constructor(
    protected readonly name: string,
    protected readonly description: string,
  ) {}

  /**
   * Esegue l'agente con i dati di input
   */
  abstract execute(input: Record<string, any>): Promise<ExecutionResult>;

  /**
   * Restituisce informazioni sull'agente
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
    };
  }

  /**
   * Valida i dati di input
   */
  protected validateInput(input: Record<string, any>, requiredFields: string[]): boolean {
    return requiredFields.every((field) => field in input && input[field] !== null);
  }
}
