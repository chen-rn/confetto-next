import { Card } from "@/components/ui/card";

export function InterviewOptionsSkeletons() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-2xl p-6 h-[250px] animate-pulse">
          <div className="rounded-lg bg-gray-200 p-3 w-12 h-12 mb-6" />
          <div className="space-y-2 mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  );
}
