export interface User {
  id: string;
  email: string;
  name: string;
  hasPaidAccess: boolean;
  stripeCustomerId?: string;
  createdAt: string;
  isAdmin?: boolean;
}

export type PaymentStatus = "pending" | "active" | "cancelled" | "expired";

export interface Payment {
  id: string;
  userId: string;
  stripeSessionId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: PaymentStatus;
  plan: string;
  createdAt: string;
  expiresAt?: string;
}
