import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { NormalizedListing, PropertySearchCriteria } from '@tools/property-provider.port';

interface CacheEntry {
  expiresAt: number;
  data: NormalizedListing[];
}

@Injectable()
export class ListingCacheService {
  private readonly queryCache = new Map<string, CacheEntry>();
  private readonly listingStore = new Map<string, NormalizedListing>();
  private readonly ttlMs = Number(process.env.LISTING_CACHE_TTL_MS ?? 5 * 60 * 1000);

  getCachedQuery(criteria: PropertySearchCriteria): NormalizedListing[] | null {
    const key = this.criteriaKey(criteria);
    const entry = this.queryCache.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt < Date.now()) {
      this.queryCache.delete(key);
      return null;
    }
    return entry.data;
  }

  putQuery(criteria: PropertySearchCriteria, listings: NormalizedListing[]): void {
    const key = this.criteriaKey(criteria);
    this.queryCache.set(key, {
      data: listings,
      expiresAt: Date.now() + this.ttlMs,
    });
    for (const listing of listings) {
      this.listingStore.set(listing.id, listing);
    }
  }

  getListingById(id: string): NormalizedListing | null {
    return this.listingStore.get(id) ?? null;
  }

  private criteriaKey(criteria: PropertySearchCriteria): string {
    return createHash('sha256').update(JSON.stringify(criteria)).digest('hex');
  }
}
