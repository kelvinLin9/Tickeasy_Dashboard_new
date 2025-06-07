// lib/types/user.ts
export type UserRole = 'user' | 'admin' | 'superuser';

export interface User {
  userId: string;
  email: string;
  name: string;
  nickname?: string;
  role: UserRole;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

// lib/types/concert.ts
export type ConInfoStatus = 'draft' | 'reviewing' | 'published' | 'rejected' | 'finished';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'skipped';

export interface Concert {
  concertId: string;
  organizationId: string;
  venueId?: string;
  locationTagId?: string;
  musicTagId?: string;
  conTitle: string;
  conIntroduction?: string;
  conLocation?: string;
  conAddress?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  imgBanner?: string;
  ticketPurchaseMethod?: string;
  precautions?: string;
  refundPolicy?: string;
  conInfoStatus: ConInfoStatus;
  reviewStatus?: ReviewStatus;
  reviewNote?: string;
  visitCount?: number;
  promotion?: number;
  cancelledAt?: string;
  updatedAt: string;
  createdAt: string;
  // 關聯資料
  organization?: Organization;
  venue?: Venue;
}

export interface Organization {
  organizationId: string;
  userId: string;
  orgName: string;
  orgAddress: string;
  orgMail?: string;
  orgContact?: string;
  orgMobile?: string;
  orgPhone?: string;
  orgWebsite?: string;
  createdAt: string;
}

export interface Venue {
  venueId: string;
  venueName: string;
  venueDescription?: string;
  venueAddress: string;
  venueCapacity?: number;
  venueImageUrl?: string;
  googleMapUrl?: string;
  isAccessible?: boolean;
  hasParking?: boolean;
  hasTransit?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcertStats {
  total: number;
  pending_review: number;
  reviewing: number;
  published: number;
  draft: number;
  rejected: number;
  finished: number;
  review_skipped: number;
}

// lib/types/order.ts
export type OrderStatus = 'held' | 'expired' | 'paid' | 'cancelled' | 'refunded';

export interface Order {
  orderId: string;
  ticketTypeId: string;
  userId: string;
  orderStatus: OrderStatus;
  isLocked: boolean;
  lockToken: string;
  lockExpireTime: string;
  purchaserName?: string;
  purchaserEmail?: string;
  purchaserPhone?: string;
  invoicePlatform?: string;
  invoiceType?: string;
  invoiceCarrier?: string;
  invoiceStatus?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt?: string;
  choosePayment?: string;
  // 關聯資料
  user?: User;
  ticketType?: TicketType;
}

export interface TicketType {
  ticketTypeId: string;
  ticketTypeName?: string;
  entranceType?: string;
  ticketBenefits?: string;
  ticketRefundPolicy?: string;
  ticketTypePrice?: number;
  totalQuantity?: number;
  remainingQuantity?: number;
  sellBeginDate?: string;
  sellEndDate?: string;
  concertSessionId: string;
  createdAt: string;
}