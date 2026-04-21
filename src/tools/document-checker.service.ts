/**
 * Document Checker Tool
 */

import { Injectable } from '@nestjs/common';

export interface DocumentVerification {
  allPresent: boolean;
  missing: string[];
  totalRequired: number;
  totalProvided: number;
}

@Injectable()
export class DocumentChecker {
  private requiredDocumentsByType: Record<string, Record<string, string[]>> = {
    apartment: {
      italy: [
        'Certificato di proprietà',
        'Visura catastale',
        'Planimetria immobile',
        'Certificato energetico',
        'Dichiarazione di conformità',
        'Atto di provenienza',
        'Certificato di agibilità',
      ],
    },
    house: {
      italy: [
        'Certificato di proprietà',
        'Visura catastale',
        'Planimetria immobile',
        'Certificato energetico',
        'Dichiarazione di conformità',
        'Atto di provenienza',
        'Certificato di agibilità',
        'Certificato di conformità urbanistica',
      ],
    },
    villa: {
      italy: [
        'Certificato di proprietà',
        'Visura catastale',
        'Planimetria immobile',
        'Certificato energetico',
        'Dichiarazione di conformità',
        'Atto di provenienza',
        'Certificato di agibilità',
        'Certificato di conformità urbanistica',
        'Certificato antincendio',
      ],
    },
  };

  /**
   * Fornisce la lista di documenti necessari
   */
  async getRequiredDocuments(propertyType: string, region: string): Promise<string[]> {
    const docs = this.requiredDocumentsByType[propertyType]?.[region] || [];
    return docs.length > 0 ? docs : this.getDefaultDocuments();
  }

  /**
   * Verifica completezza dei documenti
   */
  async verifyDocuments(documents: string[]): Promise<DocumentVerification> {
    // TODO: Implementare verifiche di validità
    return {
      allPresent: true,
      missing: [],
      totalRequired: documents.length,
      totalProvided: documents.length,
    };
  }

  /**
   * Documenti di default
   */
  private getDefaultDocuments(): string[] {
    return [
      'Certificato di proprietà',
      'Visura catastale',
      'Planimetria',
      'Certificato energetico',
      'Dichiarazione di conformità',
    ];
  }
}
