import { Property } from '@models/types';

export type ListingSource = 'idealista' | 'immobiliare' | 'casa_it';
export type ListingCondition = 'renovated' | 'to_renovate' | 'good' | 'new';

export interface PropertySearchCriteria {
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  rooms?: number;
  bathrooms?: number;
  radius?: number;
  amenities?: string[];
  maxPricePerSqm?: number;
  maxRenovatedPrice?: number;
  maxToRenovatePrice?: number;
}

export interface NormalizedListing extends Property {
  source: ListingSource;
  externalId: string;
  condition?: ListingCondition;
  pricePerSqm: number;
  zone?: string;
}

export interface PropertyDataProvider {
  search(criteria: PropertySearchCriteria): Promise<NormalizedListing[]>;
  getById(propertyId: string): Promise<NormalizedListing | null>;
}

export const PROPERTY_DATA_PROVIDER = 'PROPERTY_DATA_PROVIDER';
