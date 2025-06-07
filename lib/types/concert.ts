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