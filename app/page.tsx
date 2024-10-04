import { SignOutButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <SignOutButton />
        <UserButton />
      </div>
    </div>
  );
}
