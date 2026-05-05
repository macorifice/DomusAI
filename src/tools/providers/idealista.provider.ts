import { Injectable } from '@nestjs/common';
import { NormalizedListing, PropertySearchCriteria } from '../property-provider.port';
import { PortalHttpClient } from './portal-http.client';

@Injectable()
export class IdealistaProvider {
  constructor(private readonly httpClient: PortalHttpClient) {}

  async search(criteria: PropertySearchCriteria): Promise<NormalizedListing[]> {
    const baseUrl = process.env.IDEALISTA_API_URL;
    const token = process.env.IDEALISTA_API_KEY;
    if (!baseUrl || !token) {
      return [];
    }

    const params = new URLSearchParams();
    if (criteria.location) params.set('location', criteria.location);
    if (typeof criteria.budgetMin === 'number') params.set('minPrice', String(criteria.budgetMin));
    if (typeof criteria.budgetMax === 'number') params.set('maxPrice', String(criteria.budgetMax));
    try {
      const payload = await this.httpClient.getJson<{ results?: Array<Record<string, unknown>> }>(
        `${baseUrl}/search?${params.toString()}`,
        { Authorization: `Bearer ${token}` },
      );
      return (payload?.results ?? []).map((item) => this.mapListing(item));
    } catch {
      return [];
    }
  }

  async getById(propertyId: string): Promise<NormalizedListing | null> {
    const baseUrl = process.env.IDEALISTA_API_URL;
    const token = process.env.IDEALISTA_API_KEY;
    if (!baseUrl || !token) {
      return null;
    }
    try {
      const payload = await this.httpClient.getJson<Record<string, unknown>>(
        `${baseUrl}/listing/${propertyId}`,
        { Authorization: `Bearer ${token}` },
      );
      return payload ? this.mapListing(payload) : null;
    } catch {
      return null;
    }
  }

  private mapListing(item: Record<string, unknown>): NormalizedListing {
    const area = this.number(item.area, 1);
    const price = this.number(item.price, 0);
    const id = String(item.id ?? item.propertyCode ?? `idealista-${Math.random()}`);

    return {
      id: `idealista-${id}`,
      source: 'idealista',
      externalId: id,
      address: String(item.address ?? item.location ?? 'N/A'),
      price,
      area,
      pricePerSqm: Math.round(price / area),
      rooms: this.number(item.rooms, 1),
      bathrooms: this.number(item.bathrooms, 1),
      propertyType: 'apartment',
      condition: this.toCondition(item.condition),
      description: String(item.description ?? ''),
      amenities: [],
      images: [],
      zone: String(item.neighborhood ?? item.district ?? ''),
    };
  }

  private number(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toCondition(value: unknown): 'renovated' | 'to_renovate' | 'good' | 'new' {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized.includes('new')) return 'new';
    if (normalized.includes('renovat')) return 'renovated';
    if (normalized.includes('reform') || normalized.includes('ristruttur')) return 'to_renovate';
    return 'good';
  }
}
