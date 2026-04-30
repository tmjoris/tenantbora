export type UserRole = 'landlord' | 'tenant';

export interface AppUser {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  verified?: boolean;
  employmentDetails?: {
    company?: string;
    position?: string;
    salaryRange?: string;
    verifiedAt?: string;
  };
  createdAt: any;
}

export interface Property {
  id: string;
  landlordId: string;
  name: string;
  location: string;
  rentAmount: number;
  description: string;
  images: string[];
  amenities: string[];
  available: boolean;
  createdAt: any;
}

export interface Application {
  id: string;
  tenantId: string;
  propertyId: string;
  landlordId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message: string;
  documents: string[];
  createdAt: any;
  tenantName?: string;
  propertyName?: string;
}

export interface Tenancy {
  id: string;
  tenantId: string;
  propertyId: string;
  unitNumber?: string;
  landlordId: string;
  startDate: any;
  rentAmount: number;
  rentDueDate: number; // day of month
  rentStatus: 'current' | 'overdue';
}

export interface TenantInvite {
  id: string;
  landlordId: string;
  propertyId: string;
  unitNumber?: string;
  tenantEmail: string;
  rentAmount: number;
  rentDueDate: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

export interface Payment {
  id: string;
  tenancyId?: string;
  tenantId: string;
  propertyId?: string;
  amount: number;
  date: any;
  transactionCode: string;
  status: 'completed' | 'pending' | 'flagged';
  aiVerified: boolean;
  aiMetadata?: {
    isLegit: boolean;
    anomalyDetected?: string;
    extractedAmount?: number;
    extractedDate?: string;
  };
}

export interface MaintenanceRequest {
  id: string;
  tenancyId: string;
  tenantId: string;
  propertyId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  urgency: 'low' | 'medium' | 'high';
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
