import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="space-x-4">
          <Link href="/create-mock">
            <Button>Start Mock</Button>
          </Link>
          <Link href="/mock-history">
            <Button variant="outline">Mock History</Button>
          </Link>
        </div>
        <UserButton />
      </div>
    </div>
  );
}
