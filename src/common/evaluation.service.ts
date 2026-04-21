/**
 * Servizio specializzato per la fase di valutazione
 */

import { Injectable } from '@nestjs/common';
import { Property } from '@models/types';
import { Logger } from './logger';

export interface PropertyEvaluation {
  propertyId: string;
  address: string;
  askingPrice: number;
  estimatedValue: number;
  pricePerSqm: number;
  marketPricePerSqm: number;
  priceDeviation: number; // percentuale
  valuation: {
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    potential: 'high' | 'medium' | 'low';
    demand: 'high' | 'medium' | 'low';
  };
  risks: {
    priceRisk: string;
    structuralRisk: string;
    locationRisk: string;
    marketRisk: string;
  };
  recommendations: string[];
  investmentScore: number; // 1-100
}

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger('EvaluationService');

  /**
   * Valuta una proprietà
   */
  async evaluate(property: Property): Promise<PropertyEvaluation> {
    this.logger.log(`Evaluating property: ${property.id}`);

    try {
      const pricePerSqm = property.price / property.area;
      const marketPricePerSqm = this.estimateMarketPricePerSqm(property);
      const estimatedValue = marketPricePerSqm * property.area;
      const priceDeviation = ((property.price - estimatedValue) / estimatedValue) * 100;

      const condition = this.assessCondition(property);
      const potential = this.assessPotential(property);
      const demand = this.estimateDemand(property);

      const risks = this.assessRisks(property, priceDeviation, condition);
      const recommendations = this.generateRecommendations(property, priceDeviation, risks);
      const investmentScore = this.calculateInvestmentScore(property, priceDeviation, potential);

      return {
        propertyId: property.id,
        address: property.address,
        askingPrice: property.price,
        estimatedValue: Math.round(estimatedValue),
        pricePerSqm: Math.round(pricePerSqm),
        marketPricePerSqm: Math.round(marketPricePerSqm),
        priceDeviation: Math.round(priceDeviation * 100) / 100,
        valuation: {
          condition,
          potential,
          demand,
        },
        risks,
        recommendations,
        investmentScore,
      };
    } catch (error) {
      this.logger.error('Error evaluating property', error as Error);
      throw error;
    }
  }

  /**
   * Stima il prezzo di mercato per metro quadro
   */
  private estimateMarketPricePerSqm(property: Property): number {
    // Base market price per sqm per Milano
    let basePricePerSqm = 4500;

    // Ajusta per tipo di proprietà
    if (property.propertyType === 'villa') {
      basePricePerSqm = 3500;
    } else if (property.propertyType === 'house') {
      basePricePerSqm = 4000;
    }

    // Ajusta per età
    const age = 2026 - (property.yearBuilt || 2000);
    if (age > 50) {
      basePricePerSqm *= 0.85; // -15% per proprietà vecchie
    } else if (age < 10) {
      basePricePerSqm *= 1.1; // +10% per proprietà nuove
    }

    // Ajusta per amenities
    if (property.amenities?.includes('parking')) {
      basePricePerSqm *= 1.05;
    }
    if (property.amenities?.includes('terrace')) {
      basePricePerSqm *= 1.08;
    }
    if (property.amenities?.includes('elevator')) {
      basePricePerSqm *= 1.03;
    }

    return basePricePerSqm;
  }

  /**
   * Valuta le condizioni della proprietà
   */
  private assessCondition(property: Property): 'excellent' | 'good' | 'fair' | 'poor' {
    if (!property.yearBuilt) return 'fair';

    const age = 2026 - property.yearBuilt;

    if (age < 5) return 'excellent';
    if (age < 20) return 'good';
    if (age < 50) return 'fair';
    return 'poor';
  }

  /**
   * Valuta il potenziale di apprezzamento
   */
  private assessPotential(property: Property): 'high' | 'medium' | 'low' {
    // Milano centro ha più potenziale
    if (property.address.toLowerCase().includes('duomo') || property.address.toLowerCase().includes('brera')) {
      return 'high';
    }

    // Nuove costruzioni hanno potenziale
    if (property.yearBuilt && 2026 - property.yearBuilt < 5) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Stima la domanda di mercato
   */
  private estimateDemand(property: Property): 'high' | 'medium' | 'low' {
    // Centro storico ha alta domanda
    if (property.address.toLowerCase().includes('duomo') || property.address.toLowerCase().includes('navigli')) {
      return 'high';
    }

    // Appartamenti piccoli hanno alta domanda
    if (property.rooms <= 2) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Valuta i rischi
   */
  private assessRisks(property: Property, priceDeviation: number, condition: string): {
    priceRisk: string;
    structuralRisk: string;
    locationRisk: string;
    marketRisk: string;
  } {
    const risks = {
      priceRisk: priceDeviation > 10 ? 'HIGH - Prezzo superiore al mercato' : priceDeviation < -10 ? 'LOW - Prezzo vantaggioso' : 'MEDIUM - Prezzo in linea',
      structuralRisk: condition === 'poor' ? 'HIGH - Proprietà vecchia' : condition === 'fair' ? 'MEDIUM - Verificare' : 'LOW - Buone condizioni',
      locationRisk: property.address.toLowerCase().includes('navigli') || property.address.toLowerCase().includes('brera') ? 'LOW - Area desiderabile' : 'MEDIUM - Area standard',
      marketRisk: 'MEDIUM - Mercato stabile',
    };

    return risks;
  }

  /**
   * Genera raccomandazioni
   */
  private generateRecommendations(property: Property, priceDeviation: number, risks: Record<string, string>): string[] {
    const recommendations: string[] = [];

    if (priceDeviation > 10) {
      recommendations.push('⚠️ Prezzo superiore al mercato - Considera una controfferta');
    } else if (priceDeviation < -5) {
      recommendations.push('✅ Prezzo vantaggioso - Opportunità interessante');
    }

    if (property.yearBuilt && 2026 - property.yearBuilt > 40) {
      recommendations.push('🔧 Considera una perizia tecnica per verificare lo stato strutturale');
    }

    if (!property.amenities?.includes('parking')) {
      recommendations.push('🅿️ Manca il parcheggio - Verificare posti disponibili in zona');
    }

    if (property.rooms === 1) {
      recommendations.push('📈 Monolocale in area alta domanda - Buon potenziale di rivendita');
    }

    recommendations.push('💡 Confronta con almeno 3 proprietà simili prima di decidere');

    return recommendations;
  }

  /**
   * Calcola il punteggio di investimento
   */
  private calculateInvestmentScore(property: Property, priceDeviation: number, potential: string): number {
    let score = 50; // base

    // Prezzo
    if (priceDeviation < -10) score += 15;
    else if (priceDeviation < 0) score += 10;
    else if (priceDeviation < 10) score += 5;

    // Potenziale
    if (potential === 'high') score += 20;
    else if (potential === 'medium') score += 10;

    // Dimensioni
    if (property.rooms >= 3) score += 10;
    if (property.bathrooms >= 2) score += 5;

    // Amenities
    if (property.amenities) {
      score += Math.min(property.amenities.length * 2, 10);
    }

    return Math.min(score, 100);
  }
}
