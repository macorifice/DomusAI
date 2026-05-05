import { Injectable } from '@nestjs/common';
import { NormalizedListing, PropertySearchCriteria } from '../property-provider.port';
import { PortalHttpClient } from './portal-http.client';

@Injectable()
export class CasaItProvider {
  constructor(private readonly httpClient: PortalHttpClient) {}

  async search(criteria: PropertySearchCriteria): Promise<NormalizedListing[]> {
    const baseUrl = process.env.CASA_IT_API_URL;
    const token = process.env.CASA_IT_API_KEY;
    if (!baseUrl || !token) {
      return [];
    }
    const params = new URLSearchParams();
    if (criteria.location) params.set('location', criteria.location);
    if (typeof criteria.budgetMin === 'number') params.set('budgetMin', String(criteria.budgetMin));
    if (typeof criteria.budgetMax === 'number') params.set('budgetMax', String(criteria.budgetMax));

    try {
      const payload = await this.httpClient.getJson<{ listings?: Array<Record<string, unknown>> }>(
        `${baseUrl}/search?${params.toString()}`,
        { Authorization: `Token ${token}` },
      );
      return (payload?.listings ?? []).map((item) => this.mapListing(item));
    } catch {
      return [];
    }
  }

  async getById(propertyId: string): Promise<NormalizedListing | null> {
    const baseUrl = process.env.CASA_IT_API_URL;
    const token = process.env.CASA_IT_API_KEY;
    if (!baseUrl || !token) {
      return null;
    }
    try {
      const payload = await this.httpClient.getJson<Record<string, unknown>>(
        `${baseUrl}/listing/${propertyId}`,
        { Authorization: `Token ${token}` },
      );
      return payload ? this.mapListing(payload) : null;
    } catch {
      return null;
    }
  }

  private mapListing(item: Record<string, unknown>): NormalizedListing {
    const area = this.number(item.area, 1);
    const price = this.number(item.price, 0);
    const id = String(item.id ?? item.code ?? `casa-${Math.random()}`);

    return {
      id: `casa_it-${id}`,
      source: 'casa_it',
      externalId: id,
      address: String(item.address ?? item.city ?? 'N/A'),
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
      zone: String(item.zone ?? item.neighborhood ?? ''),
    };
  }

  private number(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toCondition(value: unknown): 'renovated' | 'to_renovate' | 'good' | 'new' {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized.includes('new')) return 'new';
    if (normalized.includes('renovat') || normalized.includes('ristrutturat')) return 'renovated';
    if (normalized.includes('to renew') || normalized.includes('da ristrutt')) return 'to_renovate';
    return 'good';
  }
}
