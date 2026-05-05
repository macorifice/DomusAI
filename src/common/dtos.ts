/**
 * DTOs (Data Transfer Objects) per la validazione degli input
 */

import { IsString, IsNumber, IsOptional, IsArray, IsEmail, Min, Max } from 'class-validator';

/**
 * DTO per la ricerca di proprietà
 */
export class SearchPropertyDto {
  @IsString()
  location: string = '';

  @IsNumber()
  @Min(0)
  budgetMin!: number;

  @IsNumber()
  @Min(0)
  budgetMax!: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  radius?: number;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPricePerSqm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRenovatedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxToRenovatePrice?: number;
}

/**
 * DTO per il profilo utente
 */
export class UserProfileDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  budgetMin!: number;

  @IsNumber()
  @Min(0)
  budgetMax!: number;

  @IsArray()
  preferredLocations!: string[];

  @IsOptional()
  @IsString()
  propertyTypePreference?: string;

  @IsOptional()
  @IsNumber()
  roomsNeeded?: number;

  @IsOptional()
  @IsNumber()
  bathroomsNeeded?: number;

  @IsOptional()
  @IsArray()
  mustHaveFeatures?: string[];
}

/**
 * DTO per la valutazione di proprietà
 */
export class PropertyEvaluationDto {
  @IsString()
  propertyId!: string;

  @IsNumber()
  askingPrice!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO per la negoziazione
 */
export class NegotiationDto {
  @IsString()
  propertyId!: string;

  @IsNumber()
  @Min(0)
  suggestedOfferPrice!: number;

  @IsOptional()
  @IsArray()
  proposedConditions?: string[];

  @IsOptional()
  @IsString()
  negotiationNotes?: string;
}

/**
 * DTO per la documentazione
 */
export class DocumentationDto {
  @IsString()
  propertyId!: string;

  @IsString()
  propertyType!: string; // apartment, house, villa

  @IsString()
  region!: string;

  @IsOptional()
  @IsArray()
  providedDocuments?: string[];
}
