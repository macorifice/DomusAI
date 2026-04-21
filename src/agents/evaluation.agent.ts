/**
 * Evaluation Agent - Agente per la valutazione di proprietà
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ExecutionResult, Property } from '@models/types';
import { EvaluationService, type PropertyEvaluation } from '@common/evaluation.service';

@Injectable()
export class EvaluationAgent extends BaseAgent {
  constructor(private readonly evaluationService: EvaluationService) {
    super(
      'EvaluationAgent',
      'Agente specializzato nella valutazione intelligente di proprietà',
    );
  }

  async execute(input: Record<string, any>): Promise<ExecutionResult<PropertyEvaluation>> {
    try {
      if (!this.validateInput(input, ['property'])) {
        return {
          status: 'error',
          error: 'Proprietà richiesta per la valutazione',
          timestamp: new Date(),
        };
      }

      const property: Property = input.property;
      const evaluation = await this.evaluationService.evaluate(property);

      return {
        status: 'success',
        data: evaluation,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Errore nella valutazione',
        timestamp: new Date(),
      };
    }
  }
}
