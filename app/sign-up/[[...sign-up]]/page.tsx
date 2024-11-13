import { ROUTES } from "@/lib/routes";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#635BFF",
            colorTextOnPrimaryBackground: "white",
            colorBackground: "white",
            borderRadius: "0.75rem",
          },
          elements: {
            card: "shadow-md",
            formButtonPrimary: "bg-[#635BFF] hover:bg-[#635BFF]/90 text-white transition-all h-10",
            formFieldInput:
              "rounded-lg border-neutral-200 focus:border-[#635BFF] focus:ring-[#635BFF]/20 h-10",
            footerActionLink: "text-[#635BFF] hover:text-[#635BFF]/80",
            headerTitle: "text-xl font-semibold text-neutral-900",
            headerSubtitle: "text-sm text-neutral-500",
            socialButtonsBlockButton: "border-neutral-200 hover:bg-neutral-50 transition-all h-10",
            dividerLine: "bg-neutral-200",
            dividerText: "text-neutral-600",
            formFieldLabel: "text-sm font-medium",
            rootBox: "py-8 px-4",
          },
        }}
        fallbackRedirectUrl={ROUTES.ONBOARDING}
      />
    </div>
  );
}
