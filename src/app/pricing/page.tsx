import type { Metadata } from "next";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Abonnement premium BAC Sciences: quiz, simulations interactives et analyses de progression.",
};

export default function PricingPage() {
  return <PricingClient />;
}
