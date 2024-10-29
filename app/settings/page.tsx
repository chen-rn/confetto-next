import { Suspense } from "react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { SettingsContent } from "./SettingsContent";
import { SettingsSkeleton } from "./SettingsSkeleton";

export default async function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account preferences" />
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </PageContainer>
  );
}
