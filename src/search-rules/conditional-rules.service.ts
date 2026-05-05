import { Injectable } from '@nestjs/common';
import { NormalizedListing, PropertySearchCriteria } from '@tools/property-provider.port';

export interface RuleOutcome {
  rule: string;
  pass: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export interface ListingRuleEvaluation {
  listingId: string;
  pass: boolean;
  outcomes: RuleOutcome[];
}

@Injectable()
export class ConditionalRulesService {
  evaluate(listing: NormalizedListing, criteria: PropertySearchCriteria): ListingRuleEvaluation {
    const outcomes: RuleOutcome[] = [];

    if (typeof criteria.maxPricePerSqm === 'number') {
      const pass = listing.pricePerSqm <= criteria.maxPricePerSqm;
      outcomes.push({
        rule: 'maxPricePerSqm',
        pass,
        severity: 'high',
        reason: pass
          ? `Prezzo/m2 ok (${listing.pricePerSqm})`
          : `Prezzo/m2 troppo alto (${listing.pricePerSqm} > ${criteria.maxPricePerSqm})`,
      });
    }

    if (typeof criteria.maxRenovatedPrice === 'number' && listing.condition === 'renovated') {
      const pass = listing.price <= criteria.maxRenovatedPrice;
      outcomes.push({
        rule: 'maxRenovatedPrice',
        pass,
        severity: 'medium',
        reason: pass
          ? 'Soglia ristrutturato rispettata'
          : `Annuncio ristrutturato oltre soglia (${listing.price} > ${criteria.maxRenovatedPrice})`,
      });
    }

    if (typeof criteria.maxToRenovatePrice === 'number' && listing.condition === 'to_renovate') {
      const pass = listing.price <= criteria.maxToRenovatePrice;
      outcomes.push({
        rule: 'maxToRenovatePrice',
        pass,
        severity: 'medium',
        reason: pass
          ? 'Soglia da ristrutturare rispettata'
          : `Annuncio da ristrutturare oltre soglia (${listing.price} > ${criteria.maxToRenovatePrice})`,
      });
    }

    const pass = outcomes.every((outcome) => outcome.pass);
    return {
      listingId: listing.id,
      pass,
      outcomes,
    };
  }
}
