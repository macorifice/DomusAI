/**
 * Documentation Agent - Agente per la gestione della documentazione
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ExecutionResult } from '@models/types';
import { DocumentChecker } from '@tools/document-checker.service';

export interface DocumentationChecklist {
  requiredDocuments: string[];
  providedDocuments: string[];
  missingDocuments: string[];
  completionPercentage: number;
  nextSteps: string[];
}

@Injectable()
export class DocumentationAgent extends BaseAgent {
  constructor(private readonly documentChecker: DocumentChecker) {
    super(
      'DocumentationAgent',
      'Agente per la gestione intelligente della documentazione',
    );
  }

  async execute(input: Record<string, any>): Promise<ExecutionResult<DocumentationChecklist>> {
    try {
      if (!this.validateInput(input, ['propertyType', 'region'])) {
        return {
          status: 'error',
          error: 'Tipo proprietà e regione richiesti',
          timestamp: new Date(),
        };
      }

      const requiredDocs = await this.documentChecker.getRequiredDocuments(
        input.propertyType,
        input.region,
      );

      const providedDocs = input.documents || [];
      const missing = requiredDocs.filter((doc) => !providedDocs.includes(doc));

      return {
        status: 'success',
        data: {
          requiredDocuments: requiredDocs,
          providedDocuments: providedDocs,
          missingDocuments: missing,
          completionPercentage: Math.round(((requiredDocs.length - missing.length) / requiredDocs.length) * 100),
          nextSteps: this.generateNextSteps(missing),
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Errore nella gestione documentale',
        timestamp: new Date(),
      };
    }
  }

  private generateNextSteps(missing: string[]): string[] {
    if (missing.length === 0) {
      return ['Tutti i documenti sono pronti. Procedi alla firma.'];
    }

    return [
      `Raccogli i ${missing.length} documenti mancanti:`,
      ...missing.map((doc) => `- Ottieni: ${doc}`),
      'Contatta il notaio per confermere la data di firma',
    ];
  }
}
