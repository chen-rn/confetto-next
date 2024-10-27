"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  priceId: string;
  interval: "month" | "year";
  popular?: boolean;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  priceId,
  interval,
  popular,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      const url = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={cn("relative p-6 bg-card", popular && "border-primary shadow-lg")}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/{interval}</span>
        </div>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button className="w-full" onClick={handleSubscribe} disabled={isLoading}>
        {isLoading ? "Loading..." : "Start 7-Day Free Trial"}
      </Button>
    </Card>
  );
}
