import { Injectable } from '@nestjs/common';
import { MockPropertyProvider } from '../mock-property.provider';
import { NormalizedListing, PropertyDataProvider, PropertySearchCriteria } from '../property-provider.port';
import { CasaItProvider } from './casa-it.provider';
import { IdealistaProvider } from './idealista.provider';
import { ImmobiliareProvider } from './immobiliare.provider';

@Injectable()
export class MultiPortalProvider implements PropertyDataProvider {
  constructor(
    private readonly idealistaProvider: IdealistaProvider,
    private readonly immobiliareProvider: ImmobiliareProvider,
    private readonly casaItProvider: CasaItProvider,
    private readonly mockProvider: MockPropertyProvider,
  ) {}

  async search(criteria: PropertySearchCriteria): Promise<NormalizedListing[]> {
    const [idealistaResults, immobiliareResults, casaItResults] = await Promise.all([
      this.idealistaProvider.search(criteria),
      this.immobiliareProvider.search(criteria),
      this.casaItProvider.search(criteria),
    ]);

    const merged = this.deduplicate([...idealistaResults, ...immobiliareResults, ...casaItResults]);
    if (merged.length > 0) {
      return merged;
    }

    // Fallback locale per garantire continuita in assenza di credenziali.
    return this.mockProvider.search(criteria);
  }

  async getById(propertyId: string): Promise<NormalizedListing | null> {
    if (propertyId.startsWith('idealista-')) {
      return this.idealistaProvider.getById(propertyId.replace('idealista-', ''));
    }
    if (propertyId.startsWith('immobiliare-')) {
      return this.immobiliareProvider.getById(propertyId.replace('immobiliare-', ''));
    }
    if (propertyId.startsWith('casa_it-')) {
      return this.casaItProvider.getById(propertyId.replace('casa_it-', ''));
    }
    return this.mockProvider.getById(propertyId);
  }

  private deduplicate(listings: NormalizedListing[]): NormalizedListing[] {
    const byIdentity = new Map<string, NormalizedListing>();
    for (const listing of listings) {
      const key = `${listing.address.toLowerCase()}-${listing.price}-${listing.area}`;
      if (!byIdentity.has(key)) {
        byIdentity.set(key, listing);
      }
    }
    return Array.from(byIdentity.values());
  }
}
