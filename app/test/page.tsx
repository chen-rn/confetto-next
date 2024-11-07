"use client";

import { seedMockData } from "@/app/actions/seed-mock-data";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const handleClick = async () => {
    await seedMockData();
  };

  return (
    <div className="p-8">
      <Button onClick={handleClick}>Seed Mock Data</Button>
    </div>
  );
}
