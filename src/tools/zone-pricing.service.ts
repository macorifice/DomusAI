import { Injectable } from '@nestjs/common';
import { NormalizedListing } from './property-provider.port';
import { OpenApiRealEstateProvider } from './providers/openapi-realestate.provider';

export interface ZonePricingInsight {
  zoneAvgPricePerSqm: number;
  deltaPct: number;
  marketPosition: 'under_market' | 'fair_market' | 'over_market';
  negotiationHint: string;
}

@Injectable()
export class ZonePricingService {
  constructor(private readonly openApiRealEstateProvider: OpenApiRealEstateProvider) {}

  async evaluate(listing: NormalizedListing, allListings: NormalizedListing[]): Promise<ZonePricingInsight> {
    const zone = (listing.zone || listing.address).toLowerCase();
    const zoneListings = allListings.filter((current) =>
      (current.zone || current.address).toLowerCase().includes(zone),
    );
    const target = zoneListings.length > 0 ? zoneListings : allListings;
    const localAvg = target.reduce((sum, current) => sum + current.pricePerSqm, 0) / Math.max(target.length, 1);
    const remoteAvg = await this.openApiRealEstateProvider.getZoneAveragePricePerSqm(listing);
    const avg = remoteAvg ?? localAvg;
    const deltaPct = ((listing.pricePerSqm - avg) / avg) * 100;

    if (deltaPct < -8) {
      return {
        zoneAvgPricePerSqm: Math.round(avg),
        deltaPct: Math.round(deltaPct * 100) / 100,
        marketPosition: 'under_market',
        negotiationHint: 'Prezzo sotto mercato: margine negoziale basso, muoversi rapidamente.',
      };
    }
    if (deltaPct > 8) {
      return {
        zoneAvgPricePerSqm: Math.round(avg),
        deltaPct: Math.round(deltaPct * 100) / 100,
        marketPosition: 'over_market',
        negotiationHint: 'Prezzo sopra mercato: proporre offerta aggressiva supportata da comparabili.',
      };
    }
    return {
      zoneAvgPricePerSqm: Math.round(avg),
      deltaPct: Math.round(deltaPct * 100) / 100,
      marketPosition: 'fair_market',
      negotiationHint: 'Prezzo in linea col mercato: negoziazione graduale e focus su condizioni.',
    };
  }
}
