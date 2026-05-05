import { ConditionalRulesService } from '@search-rules/conditional-rules.service';
import { NormalizedListing } from '@tools/property-provider.port';

describe('ConditionalRulesService', () => {
  const service = new ConditionalRulesService();

  it('passes when all configured rules are satisfied', () => {
    const listing: NormalizedListing = {
      id: 'idealista-1',
      source: 'idealista',
      externalId: '1',
      address: 'Milano Centro',
      price: 240000,
      area: 80,
      pricePerSqm: 3000,
      rooms: 3,
      bathrooms: 1,
      propertyType: 'apartment',
      condition: 'renovated',
    };

    const evaluation = service.evaluate(listing, {
      maxPricePerSqm: 3100,
      maxRenovatedPrice: 250000,
    });

    expect(evaluation.pass).toBe(true);
  });

  it('fails when condition-aware price threshold is exceeded', () => {
    const listing: NormalizedListing = {
      id: 'casa_it-2',
      source: 'casa_it',
      externalId: '2',
      address: 'Milano',
      price: 230000,
      area: 70,
      pricePerSqm: 3285,
      rooms: 2,
      bathrooms: 1,
      propertyType: 'apartment',
      condition: 'to_renovate',
    };

    const evaluation = service.evaluate(listing, {
      maxPricePerSqm: 3500,
      maxToRenovatePrice: 200000,
    });

    expect(evaluation.pass).toBe(false);
    expect(evaluation.outcomes.some((outcome) => !outcome.pass)).toBe(true);
  });
});
