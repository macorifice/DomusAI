/**
 * Negotiation Agent - Agente per la negoziazione
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ExecutionResult, Property } from '@models/types';
import { NegotiationService, type NegotiationStrategy } from '@common/negotiation.service';

@Injectable()
export class NegotiationAgent extends BaseAgent {
  constructor(private readonly negotiationService: NegotiationService) {
    super(
      'NegotiationAgent',
      'Agente specializzato nella negoziazione intelligente dell\'accordo',
    );
  }

  async execute(input: Record<string, any>): Promise<ExecutionResult<NegotiationStrategy>> {
    try {
      if (!this.validateInput(input, ['property'])) {
        return {
          status: 'error',
          error: 'Proprietà richiesta per la negoziazione',
          timestamp: new Date(),
        };
      }

      const property: Property = input.property;
      const marketValue = input.marketValue || input.estimatedValue || property.price;

      const dealContext = input.dealContext ?? {
        requiresMortgage: input.requiresMortgage,
        dealType: input.dealType,
      };

      const strategy = await this.negotiationService.generateStrategy(property, marketValue, dealContext);

      return {
        status: 'success',
        data: strategy,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Errore nella negoziazione',
        timestamp: new Date(),
      };
    }
  }
}
