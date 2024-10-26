interface StripePlan {
  name: string;
  priceId: string;
  interval: "month" | "quarter" | "year";
  price: number;
  description?: string;
}

export const stripePlans: Record<string, StripePlan> = {
  monthly: {
    name: "Monthly Plan",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID!,
    interval: "month",
    price: 199,
    description: "Unlimited mock interviews, billed monthly",
  },
  quarterly: {
    name: "Quarterly Plan",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_ID!,
    interval: "quarter",
    price: 299,
    description: "Unlimited mock interviews, billed every 3 months",
  },
  yearly: {
    name: "Yearly Plan",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID!,
    interval: "year",
    price: 499,
    description: "Unlimited mock interviews, billed annually",
  },
} as const;

// Add debug log
console.log("Loaded stripe plans:", {
  monthly: stripePlans.monthly.priceId,
  quarterly: stripePlans.quarterly.priceId,
  yearly: stripePlans.yearly.priceId,
});
