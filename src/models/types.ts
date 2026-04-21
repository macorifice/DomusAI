/**
 * Modelli dati per DomusAI
 */

export interface Property {
  id: string;
  address: string;
  price: number;
  area: number; // in metri quadri
  rooms: number;
  bathrooms: number;
  yearBuilt?: number;
  propertyType: 'apartment' | 'house' | 'villa' | 'other';
  description?: string;
  images?: string[];
  amenities?: string[];
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  propertyTypePreference?: string;
  roomsNeeded?: number;
  bathroomsNeeded?: number;
  mustHaveFeatures?: string[];
  restrictions?: string[];
}

export interface Transaction {
  id: string;
  buyerId: string;
  propertyId: string;
  offerPrice: number;
  offerDate: Date;
  status: 'offer' | 'negotiation' | 'signed' | 'completed' | 'cancelled';
  documents?: string[];
  notes?: string;
  negotiationHistory?: NegotiationEntry[];
}

export interface NegotiationEntry {
  timestamp: Date;
  from: string;
  message: string;
  price?: number;
  terms?: Record<string, any>;
}

export interface ExecutionResult<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface WorkflowState {
  phase: 'search' | 'evaluation' | 'negotiation' | 'documentation' | 'completed';
  userId: string;
  propertyId?: string;
  transactionId?: string;
  metadata: Record<string, any>;
}
