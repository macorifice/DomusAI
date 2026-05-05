import { Injectable } from '@nestjs/common';
import { PropertyDataProvider, PropertySearchCriteria, NormalizedListing } from './property-provider.port';

@Injectable()
export class MockPropertyProvider implements PropertyDataProvider {
  private readonly properties: NormalizedListing[] = [
    {
      id: 'prop-001',
      source: 'idealista',
      externalId: 'id-001',
      address: 'Via Roma, 123, Milano',
      price: 350000,
      area: 120,
      pricePerSqm: 2917,
      rooms: 3,
      bathrooms: 2,
      yearBuilt: 2015,
      propertyType: 'apartment',
      condition: 'renovated',
      zone: 'Milano Centro',
      description:
        'Quadrilocale ristrutturato con balcone e doppia esposizione, ideale per famiglie che cercano una zona centrale ben servita.',
      images: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['balcony', 'parking', 'heating', 'elevator', 'fiber'],
      latitude: 45.4642,
      longitude: 9.19,
    },
    {
      id: 'prop-002',
      source: 'immobiliare',
      externalId: 'im-002',
      address: 'Corso Magenta, 456, Milano',
      price: 420000,
      area: 140,
      pricePerSqm: 3000,
      rooms: 3,
      bathrooms: 2,
      yearBuilt: 2010,
      propertyType: 'apartment',
      condition: 'good',
      zone: 'Milano Centro',
      description:
        'Ampio trilocale con terrazza vivibile, cucina abitabile e possibilità box auto. Ottimo compromesso per posizione e metratura.',
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['terrace', 'parking', 'gym', 'concierge', 'air_conditioning'],
      latitude: 45.459,
      longitude: 9.175,
    },
    {
      id: 'prop-003',
      source: 'casa_it',
      externalId: 'ca-003',
      address: 'Via Brera, 789, Milano',
      price: 280000,
      area: 90,
      pricePerSqm: 3111,
      rooms: 2,
      bathrooms: 1,
      yearBuilt: 2005,
      propertyType: 'apartment',
      condition: 'to_renovate',
      zone: 'Brera',
      description:
        'Trilocale da personalizzare in stabile d epoca, con grande potenziale di valorizzazione dopo ristrutturazione.',
      images: [
        'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['heating', 'cellar', 'elevator'],
      latitude: 45.4728,
      longitude: 9.1887,
    },
    {
      id: 'prop-004',
      source: 'idealista',
      externalId: 'id-004',
      address: 'Piazza Duomo, 321, Milano',
      price: 550000,
      area: 180,
      pricePerSqm: 3056,
      rooms: 4,
      bathrooms: 3,
      yearBuilt: 2018,
      propertyType: 'apartment',
      condition: 'new',
      zone: 'Duomo',
      description:
        'Residenza premium di nuova costruzione con vista aperta sul centro storico, finiture di livello alto e domotica completa.',
      images: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1616594039964-3d442f647314?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['terrace', 'parking', 'elevator', 'security', 'smart_home', 'spa'],
      latitude: 45.464,
      longitude: 9.188,
    },
    {
      id: 'prop-005',
      source: 'casa_it',
      externalId: 'im-005',
      address: 'Via Dante, 654, Milano',
      price: 385000,
      area: 130,
      pricePerSqm: 2962,
      rooms: 3,
      bathrooms: 2,
      yearBuilt: 2012,
      propertyType: 'apartment',
      condition: 'renovated',
      zone: 'Milano Centro',
      description:
        'Appartamento contemporaneo con taglio regolare, terrazza coperta e servizi condominiali completi in contesto recente.',
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['terrace', 'parking', 'gym', 'pool', 'doorman'],
      latitude: 45.4663,
      longitude: 9.187,
    },
    {
      id: 'prop-006',
      source: 'casa_it',
      externalId: 'ca-006',
      address: 'Viale Monza, 120, Milano',
      price: 260000,
      area: 82,
      pricePerSqm: 3171,
      rooms: 2,
      bathrooms: 1,
      yearBuilt: 1998,
      propertyType: 'apartment',
      condition: 'good',
      zone: 'Turro',
      description:
        'Bilocale luminoso vicino alla metro, con balcone e cantina. Soluzione ideale per prima casa o investimento a reddito.',
      images: [
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['balcony', 'cellar', 'heating', 'fiber'],
      latitude: 45.4982,
      longitude: 9.2212,
    },
    {
      id: 'prop-007',
      source: 'idealista',
      externalId: 'id-007',
      address: 'Via Washington, 44, Milano',
      price: 495000,
      area: 155,
      pricePerSqm: 3194,
      rooms: 4,
      bathrooms: 2,
      yearBuilt: 2008,
      propertyType: 'apartment',
      condition: 'renovated',
      zone: 'De Angeli',
      description:
        'Quadrilocale rinnovato con doppi servizi, cucina separata e terrazzo loggiato. Contesto tranquillo e ben collegato.',
      images: [
        'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['terrace', 'elevator', 'parking', 'heating', 'air_conditioning'],
      latitude: 45.4598,
      longitude: 9.1534,
    },
    {
      id: 'prop-008',
      source: 'casa_it',
      externalId: 'im-008',
      address: 'Via Ripamonti, 210, Milano',
      price: 310000,
      area: 105,
      pricePerSqm: 2952,
      rooms: 3,
      bathrooms: 2,
      yearBuilt: 2002,
      propertyType: 'apartment',
      condition: 'good',
      zone: 'Ripamonti',
      description:
        'Trilocale con doppio affaccio e ottima distribuzione interna, in area in forte crescita con servizi e parchi.',
      images: [
        'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['balcony', 'parking', 'elevator', 'bike_storage'],
      latitude: 45.4305,
      longitude: 9.2021,
    },
    {
      id: 'prop-009',
      source: 'casa_it',
      externalId: 'ca-009',
      address: 'Piazza Napoli, 8, Milano',
      price: 335000,
      area: 98,
      pricePerSqm: 3418,
      rooms: 3,
      bathrooms: 1,
      yearBuilt: 1978,
      propertyType: 'apartment',
      condition: 'to_renovate',
      zone: 'Solari',
      description:
        'Appartamento con pianta versatile e grande luminosità, perfetto per progetto di ristrutturazione su misura.',
      images: [
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['balcony', 'heating', 'elevator', 'cellar'],
      latitude: 45.4528,
      longitude: 9.1599,
    },
    {
      id: 'prop-010',
      source: 'idealista',
      externalId: 'id-010',
      address: 'Via Mecenate, 76, Milano',
      price: 275000,
      area: 88,
      pricePerSqm: 3125,
      rooms: 2,
      bathrooms: 1,
      yearBuilt: 2016,
      propertyType: 'apartment',
      condition: 'new',
      zone: 'Forlanini',
      description:
        'Bilocale recente in classe energetica alta, con loggia e posto auto. Soluzione pronta da abitare senza lavori.',
      images: [
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['parking', 'elevator', 'air_conditioning', 'smart_home', 'fiber'],
      latitude: 45.4385,
      longitude: 9.2487,
    },
    {
      id: 'prop-011',
      source: 'casa_it',
      externalId: 'im-011',
      address: 'Via Savona, 97, Milano',
      price: 365000,
      area: 112,
      pricePerSqm: 3260,
      rooms: 3,
      bathrooms: 2,
      yearBuilt: 2009,
      propertyType: 'apartment',
      condition: 'renovated',
      zone: 'Tortona',
      description:
        'Trilocale in stile contemporaneo con soggiorno open space e balcone, in quartiere dinamico vicino a servizi e design district.',
      images: [
        'https://picsum.photos/seed/domus-savona-1/1200/800',
        'https://picsum.photos/seed/domus-savona-2/1200/800',
      ],
      amenities: ['balcony', 'elevator', 'air_conditioning', 'fiber', 'bike_storage'],
      latitude: 45.4519,
      longitude: 9.1658,
    },
    {
      id: 'prop-012',
      source: 'immobiliare',
      externalId: 'ca-012',
      address: 'Via Padova, 180, Milano',
      price: 245000,
      area: 79,
      pricePerSqm: 3101,
      rooms: 2,
      bathrooms: 1,
      yearBuilt: 1989,
      propertyType: 'apartment',
      condition: 'good',
      zone: 'NoLo',
      description:
        'Bilocale funzionale con camere ben distribuite e cucina separata, adatto a giovani coppie o investimento locativo.',
      images: [
        'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['heating', 'fiber', 'cellar', 'balcony'],
      latitude: 45.5031,
      longitude: 9.2288,
    },
    {
      id: 'prop-013',
      source: 'idealista',
      externalId: 'id-013',
      address: 'Via Vincenzo Monti, 32, Milano',
      price: 610000,
      area: 170,
      pricePerSqm: 3588,
      rooms: 4,
      bathrooms: 3,
      yearBuilt: 2019,
      propertyType: 'apartment',
      condition: 'new',
      zone: 'Pagano',
      description:
        'Appartamento di rappresentanza con zona living ampia, finiture premium e terrazzo vivibile in contesto signorile.',
      images: [
        'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: ['terrace', 'parking', 'security', 'smart_home', 'doorman', 'elevator'],
      latitude: 45.4701,
      longitude: 9.1625,
    },
  ];

  async search(criteria: PropertySearchCriteria): Promise<NormalizedListing[]> {
    const filtered = this.properties.filter((property) => {
      if (criteria.location && !property.address.toLowerCase().includes(criteria.location.toLowerCase())) {
        return false;
      }
      if (typeof criteria.budgetMin === 'number' && property.price < criteria.budgetMin) {
        return false;
      }
      if (typeof criteria.budgetMax === 'number' && property.price > criteria.budgetMax) {
        return false;
      }
      if (typeof criteria.maxPricePerSqm === 'number' && property.pricePerSqm > criteria.maxPricePerSqm) {
        return false;
      }
      if (
        typeof criteria.maxRenovatedPrice === 'number' &&
        property.condition === 'renovated' &&
        property.price > criteria.maxRenovatedPrice
      ) {
        return false;
      }
      if (
        typeof criteria.maxToRenovatePrice === 'number' &&
        property.condition === 'to_renovate' &&
        property.price > criteria.maxToRenovatePrice
      ) {
        return false;
      }
      if (criteria.propertyType && property.propertyType !== criteria.propertyType) {
        return false;
      }
      if (typeof criteria.rooms === 'number' && property.rooms < criteria.rooms) {
        return false;
      }
      if (typeof criteria.bathrooms === 'number' && property.bathrooms < criteria.bathrooms) {
        return false;
      }
      if (criteria.amenities?.length) {
        const amenities = property.amenities ?? [];
        const hasAny = criteria.amenities.some((amenity) => amenities.includes(amenity));
        if (!hasAny) {
          return false;
        }
      }
      return true;
    });

    return filtered.sort((a, b) => a.price - b.price);
  }

  async getById(propertyId: string): Promise<NormalizedListing | null> {
    return this.properties.find((property) => property.id === propertyId) ?? null;
  }
}
