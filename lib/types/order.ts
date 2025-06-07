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