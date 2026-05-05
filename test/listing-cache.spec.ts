import { ListingCacheService } from '@cache/listing-cache.service';
import { NormalizedListing } from '@tools/property-provider.port';

describe('ListingCacheService', () => {
  it('stores and retrieves query results', () => {
    const cache = new ListingCacheService();
    const criteria = { location: 'Milano', budgetMin: 200000, budgetMax: 300000 };
    const listings: NormalizedListing[] = [
      {
        id: 'idealista-1',
        source: 'idealista',
        externalId: '1',
        address: 'Milano',
        price: 250000,
        area: 80,
        pricePerSqm: 3125,
        rooms: 3,
        bathrooms: 2,
        propertyType: 'apartment',
      },
    ];

    cache.putQuery(criteria, listings);
    const cached = cache.getCachedQuery(criteria);

    expect(cached).not.toBeNull();
    expect(cached?.[0].id).toBe('idealista-1');
    expect(cache.getListingById('idealista-1')?.price).toBe(250000);
  });
});
