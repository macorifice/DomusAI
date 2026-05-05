import { Injectable } from '@nestjs/common';
import { NormalizedListing } from '../property-provider.port';

interface SqmStartResponse {
  data?: {
    id?: string;
    stato?: string;
    quotazione?: {
      med?: number;
    };
  };
}

@Injectable()
export class OpenApiRealEstateProvider {
  async getZoneAveragePricePerSqm(listing: NormalizedListing): Promise<number | null> {
    try {
      const token = process.env.REALESTATE_OPENAPI_BEARER_TOKEN;
      const baseUrl = process.env.REALESTATE_OPENAPI_URL ?? 'https://test.realestate.openapi.com';
      if (!token) {
        return null;
      }

      const address = listing.address;
      const propertyType = listing.propertyType === 'apartment' ? 20 : 1;
      const first = await this.callSqmStart(baseUrl, token, address, propertyType);
      if (!first?.data) {
        return null;
      }

      if (first.data.quotazione?.med) {
        return first.data.quotazione.med;
      }

      if (first.data.id && first.data.stato === 'in_erogazione') {
        const resolved = await this.pollSqmStart(baseUrl, token, first.data.id);
        return resolved?.data?.quotazione?.med ?? null;
      }

      return null;
    } catch {
      // Best-effort: non vogliamo far fallire l'intero search se la chiamata esterna non è disponibile.
      return null;
    }
  }

  private async callSqmStart(
    baseUrl: string,
    token: string,
    address: string,
    propertyType: number,
  ): Promise<SqmStartResponse | null> {
    try {
      const response = await fetch(`${baseUrl}/IT-sqm_value_start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          for: 'sale',
          type: propertyType,
        }),
      });

      if (!response.ok) {
        return null;
      }
      return (await response.json()) as SqmStartResponse;
    } catch {
      return null;
    }
  }

  private async pollSqmStart(baseUrl: string, token: string, requestId: string): Promise<SqmStartResponse | null> {
    for (let i = 0; i < 3; i += 1) {
      try {
        const response = await fetch(`${baseUrl}/IT-sqm_value_start/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          return null;
        }
        const payload = (await response.json()) as SqmStartResponse;
        if (payload.data?.quotazione?.med) {
          return payload;
        }
      } catch {
        return null;
      }
    }

    return null;
  }
}
