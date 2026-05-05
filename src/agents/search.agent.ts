/**
 * Search Agent - Agente per la ricerca di proprietà
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ExecutionResult } from '@models/types';
import { PropertyLocator } from '@tools/property-locator.service';

export interface SearchAgentResult {
  properties: unknown[];
  total: number;
  searchTime?: number;
  criteria: Record<string, any>;
  cache: 'hit' | 'miss';
}

@Injectable()
export class SearchAgent extends BaseAgent {
  constructor(private readonly propertyLocator: PropertyLocator) {
    super(
      'SearchAgent',
      'Agente specializzato nella ricerca intelligente di proprietà immobiliari',
    );
  }

  async execute(input: Record<string, any>): Promise<ExecutionResult<SearchAgentResult>> {
    try {
      if (!this.validateInput(input, ['location', 'budgetMin', 'budgetMax'])) {
        return {
          status: 'error',
          error: 'Input mancante: location, budgetMin, budgetMax richiesti',
          timestamp: new Date(),
        };
      }

      const result = await this.propertyLocator.searchDetailed({
        location: input.location,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        propertyType: input.propertyType,
        rooms: input.rooms,
        bathrooms: input.bathrooms,
        amenities: input.amenities,
        radius: input.radius,
      });

      return {
        status: 'success',
        data: {
          properties: result.properties,
          total: result.total,
          criteria: input,
          cache: result.cache,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Errore nella ricerca',
        timestamp: new Date(),
      };
    }
  }
}
