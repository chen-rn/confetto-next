import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    label: string;
    icon?: LucideIcon;
    variant: "default" | "blue" | "purple" | "success";
  };
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  className,
}: SectionCardProps) {
  const getBadgeStyles = (variant: string) => {
    switch (variant) {
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const BadgeIcon = badge?.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl shadow-sm border border-neutral-200 transition-all duration-300 hover:ring-1 hover:ring-[#635BFF]/20",
        className
      )}
    >
      <CardHeader className="border-b bg-gradient-to-br from-[#635BFF]/5 to-transparent px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Icon className="h-6 w-6 text-[#635BFF]" />
              {title}
            </h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 text-sm font-medium shadow-sm",
                getBadgeStyles(badge.variant)
              )}
            >
              {BadgeIcon && <BadgeIcon className="h-4 w-4" />}
              <span>{badge.label}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
