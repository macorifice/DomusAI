/**
 * Servizio specializzato per la fase di ricerca
 */

import { Injectable } from '@nestjs/common';
import { Property } from '@models/types';
import { Logger } from './logger';

export interface SearchFilters {
  location: string;
  budgetMin: number;
  budgetMax: number;
  propertyType?: string;
  rooms?: number;
  bathrooms?: number;
  amenities?: string[];
  radius?: number;
}

export interface SearchResult {
  total: number;
  properties: Property[];
  appliedFilters: SearchFilters;
  searchTime: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger('SearchService');
  private readonly mockProperties = this.generateMockProperties();

  /**
   * Esegue la ricerca di proprietà
   */
  async search(filters: SearchFilters): Promise<SearchResult> {
    const startTime = Date.now();
    this.logger.log(`Searching properties with filters:`, filters);

    try {
      let results = this.mockProperties;

      // Applica filtri di ricerca
      results = this.applyLocationFilter(results, filters.location, filters.radius || 10);
      results = this.applyPriceFilter(results, filters.budgetMin, filters.budgetMax);

      if (filters.propertyType) {
        results = results.filter((p) => p.propertyType === filters.propertyType);
      }

      if (filters.rooms) {
        results = results.filter((p) => p.rooms >= filters.rooms!);
      }

      if (filters.bathrooms) {
        results = results.filter((p) => p.bathrooms >= filters.bathrooms!);
      }

      if (filters.amenities && filters.amenities.length > 0) {
        results = results.filter((p) =>
          filters.amenities!.some((amenity) => p.amenities?.includes(amenity)),
        );
      }

      // Ordina por rilevanza (prezzo vicino al budget)
      results = this.rankByRelevance(results, filters.budgetMin, filters.budgetMax);

      const searchTime = Date.now() - startTime;

      this.logger.log(`Found ${results.length} properties in ${searchTime}ms`);

      return {
        total: results.length,
        properties: results,
        appliedFilters: filters,
        searchTime,
      };
    } catch (error) {
      this.logger.error('Error during search', error as Error);
      throw error;
    }
  }

  /**
   * Filtra per location
   */
  private applyLocationFilter(properties: Property[], location: string, radius: number): Property[] {
    return properties.filter((p) => {
      const propertyLocation = p.address.toLowerCase();
      const searchLocation = location.toLowerCase();
      return propertyLocation.includes(searchLocation);
    });
  }

  /**
   * Filtra per prezzo
   */
  private applyPriceFilter(properties: Property[], min: number, max: number): Property[] {
    return properties.filter((p) => p.price >= min && p.price <= max);
  }

  /**
   * Ordina per rilevanza
   */
  private rankByRelevance(properties: Property[], minBudget: number, maxBudget: number): Property[] {
    const midpoint = (minBudget + maxBudget) / 2;

    return properties.sort((a, b) => {
      const distanceA = Math.abs(a.price - midpoint);
      const distanceB = Math.abs(b.price - midpoint);
      return distanceA - distanceB;
    });
  }

  /**
   * Genera proprietà mock per demo
   */
  private generateMockProperties(): Property[] {
    return [
      {
        id: 'prop-001',
        address: 'Via Roma, 123, Milano',
        price: 350000,
        area: 120,
        rooms: 3,
        bathrooms: 2,
        yearBuilt: 2015,
        propertyType: 'apartment',
        description: 'Bellissimo appartamento in zona Duomo',
        images: ['img1.jpg', 'img2.jpg'],
        amenities: ['balcony', 'parking', 'heating'],
        latitude: 45.4642,
        longitude: 9.19,
      },
      {
        id: 'prop-002',
        address: 'Corso Magenta, 456, Milano',
        price: 420000,
        area: 140,
        rooms: 3,
        bathrooms: 2,
        yearBuilt: 2010,
        propertyType: 'apartment',
        description: 'Appartamento con terrazza panoramica',
        images: ['img3.jpg'],
        amenities: ['terrace', 'parking', 'gym'],
        latitude: 45.459,
        longitude: 9.175,
      },
      {
        id: 'prop-003',
        address: 'Via Brera, 789, Milano',
        price: 280000,
        area: 90,
        rooms: 2,
        bathrooms: 1,
        yearBuilt: 2005,
        propertyType: 'apartment',
        description: 'Accogliente trilocale in zona artistica',
        images: ['img4.jpg'],
        amenities: ['heating'],
      },
      {
        id: 'prop-004',
        address: 'Piazza Duomo, 321, Milano',
        price: 550000,
        area: 180,
        rooms: 4,
        bathrooms: 3,
        yearBuilt: 2018,
        propertyType: 'apartment',
        description: 'Lussuoso appartamento vista Duomo',
        images: ['img5.jpg', 'img6.jpg'],
        amenities: ['terrace', 'parking', 'elevator', 'security'],
        latitude: 45.464,
        longitude: 9.188,
      },
      {
        id: 'prop-005',
        address: 'Via Dante, 654, Milano',
        price: 385000,
        area: 130,
        rooms: 3,
        bathrooms: 2,
        yearBuilt: 2012,
        propertyType: 'apartment',
        description: 'Moderno appartamento con terrazza',
        images: ['img7.jpg'],
        amenities: ['terrace', 'parking', 'gym', 'pool'],
      },
    ];
  }
}
