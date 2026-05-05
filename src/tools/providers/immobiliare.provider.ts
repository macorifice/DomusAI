import { Injectable } from '@nestjs/common';
import { NormalizedListing, PropertySearchCriteria } from '../property-provider.port';
import { PortalHttpClient } from './portal-http.client';

@Injectable()
export class ImmobiliareProvider {
  constructor(private readonly httpClient: PortalHttpClient) {}

  async search(criteria: PropertySearchCriteria): Promise<NormalizedListing[]> {
    const baseUrl = process.env.IMMOBILIARE_API_URL;
    const token = process.env.IMMOBILIARE_API_KEY;
    if (!baseUrl || !token) {
      return [];
    }
    const params = new URLSearchParams();
    if (criteria.location) params.set('city', criteria.location);
    if (typeof criteria.budgetMin === 'number') params.set('priceMin', String(criteria.budgetMin));
    if (typeof criteria.budgetMax === 'number') params.set('priceMax', String(criteria.budgetMax));

    try {
      const payload = await this.httpClient.getJson<{ items?: Array<Record<string, unknown>> }>(
        `${baseUrl}/listings?${params.toString()}`,
        { 'x-api-key': token },
      );
      return (payload?.items ?? []).map((item) => this.mapListing(item));
    } catch {
      return [];
    }
  }

  async getById(propertyId: string): Promise<NormalizedListing | null> {
    const baseUrl = process.env.IMMOBILIARE_API_URL;
    const token = process.env.IMMOBILIARE_API_KEY;
    if (!baseUrl || !token) {
      return null;
    }
    try {
      const payload = await this.httpClient.getJson<Record<string, unknown>>(
        `${baseUrl}/listings/${propertyId}`,
        { 'x-api-key': token },
      );
      return payload ? this.mapListing(payload) : null;
    } catch {
      return null;
    }
  }

  private mapListing(item: Record<string, unknown>): NormalizedListing {
    const area = this.number(item.squareMeters, 1);
    const price = this.number(item.price, 0);
    const id = String(item.id ?? item.listingId ?? `imm-${Math.random()}`);

    return {
      id: `immobiliare-${id}`,
      source: 'immobiliare',
      externalId: id,
      address: String(item.address ?? item.city ?? 'N/A'),
      price,
      area,
      pricePerSqm: Math.round(price / area),
      rooms: this.number(item.rooms, 1),
      bathrooms: this.number(item.bathrooms, 1),
      propertyType: 'apartment',
      condition: this.toCondition(item.state),
      description: String(item.description ?? ''),
      amenities: [],
      images: [],
      zone: String(item.zone ?? item.district ?? ''),
    };
  }

  private number(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toCondition(value: unknown): 'renovated' | 'to_renovate' | 'good' | 'new' {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized.includes('new')) return 'new';
    if (normalized.includes('ristrutturat') || normalized.includes('renovat')) return 'renovated';
    if (normalized.includes('da ristrutt')) return 'to_renovate';
    return 'good';
  }
}
