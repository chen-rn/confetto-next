import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="space-x-4">
          <Link href={ROUTES.CREATE_MOCK}>
            <Button>View Questions</Button>
          </Link>
          <Link href={ROUTES.MOCK_HISTORY}>
            <Button variant="outline">Mock History</Button>
          </Link>
        </div>
        <UserButton />
      </div>
    </div>
  );
}
