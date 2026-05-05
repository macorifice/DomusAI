import { ZonePricingService } from '@tools/zone-pricing.service';
import { NormalizedListing } from '@tools/property-provider.port';
import { OpenApiRealEstateProvider } from '@tools/providers/openapi-realestate.provider';

describe('ZonePricingService', () => {
  const openApiProviderMock: Pick<OpenApiRealEstateProvider, 'getZoneAveragePricePerSqm'> = {
    getZoneAveragePricePerSqm: jest.fn().mockResolvedValue(null),
  };
  const service = new ZonePricingService(openApiProviderMock as OpenApiRealEstateProvider);

  it('returns under market when listing is below zone average', async () => {
    const listings: NormalizedListing[] = [
      {
        id: 'a',
        source: 'idealista',
        externalId: 'a',
        address: 'Milano Centro',
        zone: 'Milano Centro',
        price: 240000,
        area: 100,
        pricePerSqm: 2400,
        rooms: 3,
        bathrooms: 1,
        propertyType: 'apartment',
      },
      {
        id: 'b',
        source: 'immobiliare',
        externalId: 'b',
        address: 'Milano Centro',
        zone: 'Milano Centro',
        price: 360000,
        area: 100,
        pricePerSqm: 3600,
        rooms: 3,
        bathrooms: 1,
        propertyType: 'apartment',
      },
    ];

    const insight = await service.evaluate(listings[0], listings);
    expect(insight.marketPosition).toBe('under_market');
  });
});
