/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  BUYER = 'BUYER',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  balance?: number; // for organizers payout
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  ownerId: string;
  isVerified: boolean;
  city: string;
  revenue: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string; // 'General Admission', 'VIP', 'Early Bird', etc.
  price: number;
  capacity: number;
  sold: number;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  categoryId: string;
  organizerId: string; // references Organization.id
  venueId: string; // references Venue.id
  date: string; // ISO string or YYYY-MM-DD
  time: string; // e.g. "19:00"
  city: string; // Karachi, Lahore, etc.
  isFeatured: boolean;
  isApproved: boolean;
  terms: string[];
  refundPolicy: string;
  faqs: { question: string; answer: string }[];
  ticketTiers: TicketTier[];
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  paymentMethod: 'STRIPE' | 'PAYFAST' | 'JAZZCASH' | 'EASYPAYSA' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  promoCodeUsed?: string;
  ticketQuantity: number;
}

export interface Pass {
  id: string;
  orderId: string;
  userId: string;
  eventId: string;
  ticketTierId: string;
  status: 'ACTIVE' | 'USED' | 'REFUNDED';
  attendeeName: string;
  attendeeEmail: string;
  uniqueCode: string; // Immutable unique core ticket code
  createdAt: string;
}

// Represents the dynamic cryptographically rotating token
export interface QRToken {
  passId: string;
  timestamp: number; // generation unix time
  expiry: number; // expiration unix time (usually timestamp + 10s)
  signature: string; // secure HMAC/JWT-like signature
}

export interface CheckIn {
  id: string;
  passId: string;
  scannedById: string; // references User.id
  scannedAt: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

export interface Refund {
  id: string;
  orderId: string;
  passId: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
}

export interface PromoCode {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isActive: boolean;
  expiryDate: string;
  maxUses?: number;
  usesCount: number;
}

export interface Review {
  id: string;
  userId: string;
  eventId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  organizationId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  method: string;
  accountDetails: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string; // user doing action
  userEmail: string;
  action: string; // 'CREATE_EVENT', 'SCAN_TICKET', etc.
  details: string; // JSON or text summary
  ipAddress: string;
  createdAt: string;
}
