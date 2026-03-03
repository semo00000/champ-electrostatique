"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth/context";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";

// ── Beta flag ───────────────────────────────────────────────────────────
// Set to true to give every user premium access for free during beta.
// When a payment gateway is integrated, set this to false.
const BETA_FREE_ACCESS = true;
// ─────────────────────────────────────────────────────────────────────────

interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  plan: string | null;
  expiresAt: string | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState>({
  isPremium: BETA_FREE_ACCESS,
  isLoading: false,
  plan: null,
  expiresAt: null,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(BETA_FREE_ACCESS);
  const [isLoading, setIsLoading] = useState(!BETA_FREE_ACCESS);
  const [plan, setPlan] = useState<string | null>(
    BETA_FREE_ACCESS ? "beta" : null
  );
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    // During beta, everyone gets premium access — skip DB check
    if (BETA_FREE_ACCESS) {
      setIsPremium(true);
      setPlan("beta");
      setIsLoading(false);
      return;
    }

    if (!user?.$id) {
      setIsPremium(false);
      setPlan(null);
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENTS,
        [
          Query.equal("userId", user.$id),
          Query.equal("status", "active"),
          Query.orderDesc("createdAt"),
          Query.limit(1),
        ]
      );

      if (response.documents.length > 0) {
        const payment = response.documents[0];
        const notExpired =
          !payment.expiresAt ||
          new Date(payment.expiresAt as string) > new Date();
        setIsPremium(notExpired);
        setPlan(notExpired ? (payment.plan as string) : null);
        setExpiresAt(notExpired ? (payment.expiresAt as string) : null);
      } else {
        setIsPremium(false);
        setPlan(null);
        setExpiresAt(null);
      }
    } catch (error) {
      console.warn("[Subscription Check Error]", error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, isLoading, plan, expiresAt, refresh: checkSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
