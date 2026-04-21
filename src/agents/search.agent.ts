/**
 * Search Agent - Agente per la ricerca di proprietà
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ExecutionResult, Property } from '@models/types';
import { SearchService } from '@common/search.service';

export interface SearchAgentResult {
  properties: Property[];
  total: number;
  searchTime: number;
  criteria: Record<string, any>;
}

@Injectable()
export class SearchAgent extends BaseAgent {
  constructor(private readonly searchService: SearchService) {
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

      const result = await this.searchService.search({
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
          searchTime: result.searchTime,
          criteria: result.appliedFilters,
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
