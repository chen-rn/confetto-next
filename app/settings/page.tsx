import { SchoolPreferences } from "@/components/settings/SchoolPreferences";
import { UserProfile } from "@/components/settings/UserProfile";
import { SignOutButton } from "@clerk/nextjs";

export default async function SettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and school preferences.
          </p>
        </div>
        <UserProfile />
        <SchoolPreferences />
        <SignOutButton />
      </div>
    </div>
  );
}
