import { Button } from "@/components/ui/button";
import { SignOutButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <Button>Create Session</Button>
        <UserButton />
      </div>
    </div>
  );
}
