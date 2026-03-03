import type { BilingualText } from "@/types/curriculum";

export interface PlanConfig {
  priceId: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  label: BilingualText;
  savings?: BilingualText;
}

export const PLANS: Record<string, PlanConfig> = {
  monthly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "",
    amount: 29,
    currency: "mad",
    interval: "month",
    label: { fr: "Mensuel", ar: "\u0634\u0647\u0631\u064a" },
  },
  yearly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? "",
    amount: 249,
    currency: "mad",
    interval: "year",
    label: { fr: "Annuel", ar: "\u0633\u0646\u0648\u064a" },
    savings: { fr: "\u00c9conomisez 39%", ar: "\u0648\u0641\u0651\u0631 39%" },
  },
};

export type PlanKey = keyof typeof PLANS;
