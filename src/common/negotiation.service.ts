/**
 * Servizio specializzato per la fase di negoziazione
 */

import { Injectable } from '@nestjs/common';
import { Property } from '@models/types';
import { Logger } from './logger';

export interface NegotiationStrategy {
  propertyId: string;
  initialPrice: number;
  suggestedFirstOffer: number;
  acceptableRange: {
    min: number;
    max: number;
  };
  strategyType: 'aggressive' | 'balanced' | 'conservative';
  negotiationSteps: NegotiationStep[];
  estimatedClosingPrice: number;
  timeline: string;
  successProbability: number; // 0-100
  tips: string[];
  contingencies?: NegotiationContingency[];
}

export interface NegotiationStep {
  step: number;
  action: string;
  expectedPrice?: number;
  negotiationPoints: string[];
}

export interface NegotiationContingency {
  type: 'mortgage_approval_suspensive_clause';
  label: string;
  text: string;
}

@Injectable()
export class NegotiationService {
  private readonly logger = new Logger('NegotiationService');

  /**
   * Genera una strategia di negoziazione
   */
  async generateStrategy(
    property: Property,
    marketValue: number,
    context?: { requiresMortgage?: boolean; dealType?: string },
  ): Promise<NegotiationStrategy> {
    this.logger.log(`Generating negotiation strategy for property: ${property.id}`);

    try {
      const priceDeviation = ((property.price - marketValue) / marketValue) * 100;
      const strategyType = this.determineStrategy(priceDeviation);

      const suggestedFirstOffer = this.calculateFirstOffer(property.price, strategyType);
      const acceptableRange = this.calculateAcceptableRange(property.price, marketValue, strategyType);
      const estimatedClosingPrice = this.estimateClosingPrice(
        property.price,
        suggestedFirstOffer,
        strategyType,
      );

      const negotiationSteps = this.generateNegotiationSteps(
        property.price,
        suggestedFirstOffer,
        estimatedClosingPrice,
        strategyType,
      );

      const tips = this.generateNegotiationTips(property, strategyType);
      const successProbability = this.calculateSuccessProbability(property, priceDeviation, strategyType);
      const contingencies = this.generateContingencies(context);

      return {
        propertyId: property.id,
        initialPrice: property.price,
        suggestedFirstOffer,
        acceptableRange,
        strategyType,
        negotiationSteps,
        estimatedClosingPrice,
        timeline: this.estimateTimeline(strategyType),
        successProbability,
        tips,
        ...(contingencies.length > 0 ? { contingencies } : {}),
      };
    } catch (error) {
      this.logger.error('Error generating negotiation strategy', error as Error);
      throw error;
    }
  }

  /**
   * Determina il tipo di strategia
   */
  private determineStrategy(priceDeviation: number): 'aggressive' | 'balanced' | 'conservative' {
    if (priceDeviation > 15) {
      return 'aggressive'; // Prezzo molto alto
    } else if (priceDeviation < -10) {
      return 'conservative'; // Prezzo già basso
    }
    return 'balanced'; // Prezzo ragionevole
  }

  /**
   * Calcola la prima offerta
   */
  private calculateFirstOffer(price: number, strategy: string): number {
    switch (strategy) {
      case 'aggressive':
        return Math.round(price * 0.82); // -18%
      case 'balanced':
        return Math.round(price * 0.90); // -10%
      case 'conservative':
        return Math.round(price * 0.96); // -4%
      default:
        return price;
    }
  }

  /**
   * Calcola il range accettabile
   */
  private calculateAcceptableRange(
    price: number,
    marketValue: number,
    strategy: string,
  ): { min: number; max: number } {
    const minAcceptable = Math.min(price, marketValue) * 0.95;

    switch (strategy) {
      case 'aggressive':
        return {
          min: Math.round(minAcceptable),
          max: Math.round(marketValue * 1.02),
        };
      case 'balanced':
        return {
          min: Math.round(minAcceptable),
          max: Math.round(price * 0.98),
        };
      case 'conservative':
        return {
          min: Math.round(minAcceptable),
          max: Math.round(price),
        };
      default:
        return { min: minAcceptable, max: price };
    }
  }

  /**
   * Stima il prezzo di chiusura finale
   */
  private estimateClosingPrice(price: number, firstOffer: number, strategy: string): number {
    const gap = price - firstOffer;

    switch (strategy) {
      case 'aggressive':
        return Math.round(firstOffer + gap * 0.4); // Buyer cede il 40% del gap
      case 'balanced':
        return Math.round(firstOffer + gap * 0.5); // Buyer cede il 50% del gap
      case 'conservative':
        return Math.round(firstOffer + gap * 0.65); // Buyer cede il 65% del gap
      default:
        return price;
    }
  }

  /**
   * Genera i step di negoziazione
   */
  private generateNegotiationSteps(
    initialPrice: number,
    firstOffer: number,
    estimatedClosing: number,
    strategy: string,
  ): NegotiationStep[] {
    void strategy;
    const steps: NegotiationStep[] = [];

    const step1Price = firstOffer;
    const step2Price = Math.round(firstOffer + (initialPrice - firstOffer) * 0.3);
    steps.push({
      step: 1,
      action: 'Presentare l\'offerta iniziale',
      expectedPrice: step1Price,
      negotiationPoints: [
        'Giustificare il prezzo con comparabili',
        'Evidenziare esigenze di riparazione',
        'Menzioni fattori di mercato',
      ],
    });

    steps.push({
      step: 2,
      action: 'Rispondere a controproposta',
      expectedPrice: step2Price,
      negotiationPoints: [
        'Mostrare disponibilità a negoziare',
        'Proporre termini di pagamento favorevoli',
        'Suggerire contingencies',
      ],
    });

    steps.push({
      step: 3,
      action: 'Raggiungimento dell\'accordo finale',
      expectedPrice: estimatedClosing,
      negotiationPoints: [
        'Essere pronti a compromesso finale',
        'Negoziare condizioni di chiusura',
        'Costi di transazione',
      ],
    });

    return steps;
  }

  /**
   * Genera consigli per la negoziazione
   */
  private generateNegotiationTips(property: Property, strategy: string): string[] {
    const tips: string[] = [
      '💡 Ottieni una pre-approvazione ipotecaria prima di negoziare',
      '📊 Raccogli dati su proprietà similari nel mercato',
      '⏰ Non avere fretta - i migliori accordi richiedono tempo',
      '💬 Mantieni tono professionale e cordiale',
      '📝 Documenta ogni comunicazione scritta',
    ];

    if (strategy === 'aggressive') {
      tips.push('🎯 Sii pronto a cambiare offerta velocemente se il venditore è ricettivo');
      tips.push('⚖️ Usa ispezioni tecniche come leva di negoziazione');
    }

    if (property.yearBuilt && 2026 - property.yearBuilt > 30) {
      tips.push('🔨 Richiedi credits per riparazioni piuttosto che riduzione prezzo');
    }

    if (!property.amenities?.includes('parking')) {
      tips.push('🅿️ Negozia accesso a parcheggio o sconto per soluzioni alternative');
    }

    return tips;
  }

  /**
   * Genera clausole/condizioni sospensive coerenti con il deal context.
   * Nota: per ora supportiamo solo il caso mutuo approvato (clausola sospensiva).
   */
  private generateContingencies(
    context?: { requiresMortgage?: boolean; dealType?: string },
  ): NegotiationContingency[] {
    const requiresMortgage = context?.requiresMortgage === true;
    const dealType = context?.dealType;

    if (!requiresMortgage) return [];

    // La clausola sospensiva è tipicamente legata a compromesso/accordi preliminari.
    const isCompatibleDeal =
      !dealType || dealType === 'compromesso' || dealType === 'compromesso_finale' || dealType === 'preliminare';

    if (!isCompatibleDeal) return [];

    return [
      {
        type: 'mortgage_approval_suspensive_clause',
        label: 'Clausola sospensiva per approvazione mutuo',
        text: "Accordo subordinato all'approvazione del mutuo da parte dell'istituto di credito, con liberatoria/risoluzione automatica in assenza di esito positivo entro i termini concordati.",
      },
    ];
  }

  /**
   * Stima la timeline di negoziazione
   */
  private estimateTimeline(strategy: string): string {
    switch (strategy) {
      case 'aggressive':
        return '7-14 giorni per ricevere prima controproposta';
      case 'balanced':
        return '10-20 giorni per raggiungere accordo';
      case 'conservative':
        return '5-10 giorni per veloce accordo';
      default:
        return '10-15 giorni';
    }
  }

  /**
   * Calcola la probabilità di successo
   */
  private calculateSuccessProbability(property: Property, priceDeviation: number, strategy: string): number {
    let probability = 70; // base

    // Aggiusta per deviazione di prezzo
    if (priceDeviation > 20) {
      probability -= 15;
    } else if (priceDeviation < -10) {
      probability += 10;
    }

    // Aggiusta per strategia
    if (strategy === 'balanced') {
      probability += 10;
    } else if (strategy === 'aggressive') {
      probability -= 10;
    }

    // Aggiusta per amenities (proprietà con più amenities -> più desiderabili -> meno contrattabili)
    if (property.amenities && property.amenities.length > 3) {
      probability -= 5;
    }

    return Math.max(Math.min(probability, 95), 40);
  }
}
