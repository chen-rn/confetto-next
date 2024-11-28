interface StripePlan {
  name: string;
  priceId: string;
  interval: "month" | "quarter" | "year";
  price: number;
  description?: string;
}

export const stripePlans: Record<string, StripePlan> = {
  monthly: {
    name: "1 Month Access",
    priceId: "price_1QQG5qEymCCZJNo79ypzJUX8",
    interval: "month",
    price: 199,
    description: "Unlimited mock interviews for 1 month",
  },
  quarterly: {
    name: "3 Months Access",
    priceId: "price_1QQG6GEymCCZJNo7zKQtiHUn",
    interval: "quarter",
    price: 299,
    description: "Unlimited mock interviews for 3 months",
  },
  yearly: {
    name: "1 Year Access",
    priceId: "price_1QQG6eEymCCZJNo7211UDUFj",
    interval: "year",
    price: 599,
    description: "Unlimited mock interviews for 1 year",
  },
} as const;

// Add debug log
console.log("Loaded stripe plans:", {
  monthly: stripePlans.monthly.priceId,
  quarterly: stripePlans.quarterly.priceId,
  yearly: stripePlans.yearly.priceId,
});
