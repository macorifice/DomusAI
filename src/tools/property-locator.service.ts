/**
 * Property Locator Tool
 */

import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Property } from '@models/types';
import {
  PROPERTY_DATA_PROVIDER,
  NormalizedListing,
  PropertyDataProvider,
  PropertySearchCriteria,
} from './property-provider.port';
import { ListingCacheService } from '@cache/listing-cache.service';
import { ConditionalRulesService, ListingRuleEvaluation } from '@search-rules/conditional-rules.service';
import { ZonePricingService, ZonePricingInsight } from './zone-pricing.service';

export interface EnrichedListing extends NormalizedListing {
  rulesEvaluation: ListingRuleEvaluation;
  market: ZonePricingInsight;
}

export interface PropertySearchResponse {
  total: number;
  properties: EnrichedListing[];
  cache: 'hit' | 'miss';
}

@Injectable()
export class PropertyLocator {
  constructor(
    @Inject(PROPERTY_DATA_PROVIDER) private readonly propertyProvider: PropertyDataProvider,
    private readonly cacheService: ListingCacheService,
    private readonly rulesService: ConditionalRulesService,
    private readonly zonePricingService: ZonePricingService,
  ) {}

  /**
   * Ricerca proprietà per location
   */
  async searchByLocation(location: string, radiusKm: number = 10): Promise<PropertySearchResponse> {
    return this.searchDetailed({
      location,
      radius: radiusKm,
    });
  }

  /**
   * Ricerca proprietà per criteri
   */
  async searchByCriteria(criteria: PropertySearchCriteria): Promise<Property[]> {
    const result = await this.searchDetailed(criteria);
    return result.properties;
  }

  async searchDetailed(criteria: PropertySearchCriteria): Promise<PropertySearchResponse> {
    const cached = this.cacheService.getCachedQuery(criteria);
    const cacheState: 'hit' | 'miss' = cached ? 'hit' : 'miss';
    const listings = cached ?? (await this.safeSearch(criteria));
    if (!cached) {
      this.cacheService.putQuery(criteria, listings);
    }

    const enriched = (await Promise.all(
      listings.map((listing) => this.enrichListing(listing, listings, criteria)),
    ))
      .filter((listing) => listing.rulesEvaluation.pass)
      .sort((a, b) => a.price - b.price);

    return {
      total: enriched.length,
      properties: enriched,
      cache: cacheState,
    };
  }

  /**
   * Ottieni dettagli proprietà
   */
  async getPropertyDetails(propertyId: string): Promise<Property | null> {
    try {
      const cached = this.cacheService.getListingById(propertyId);
      if (cached) {
        return cached;
      }
      return await this.propertyProvider.getById(propertyId);
    } catch {
      throw new ServiceUnavailableException('Property provider temporaneamente non disponibile');
    }
  }

  private async safeSearch(criteria: PropertySearchCriteria): Promise<NormalizedListing[]> {
    try {
      return await this.propertyProvider.search(criteria);
    } catch {
      throw new ServiceUnavailableException('Property provider temporaneamente non disponibile');
    }
  }

  private async enrichListing(
    listing: NormalizedListing,
    allListings: NormalizedListing[],
    criteria: PropertySearchCriteria,
  ): Promise<EnrichedListing> {
    return {
      ...listing,
      rulesEvaluation: this.rulesService.evaluate(listing, criteria),
      market: await this.zonePricingService.evaluate(listing, allListings),
    };
  }
}
