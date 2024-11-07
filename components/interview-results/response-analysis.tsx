import { MessageSquare } from "lucide-react";
import { SectionCard } from "./shared/section-card";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnalysisType } from "@prisma/client";

interface ResponseAnalysisProps {
  mockInterviewId: string;
}

export async function ResponseAnalysis({ mockInterviewId }: ResponseAnalysisProps) {
  const feedback = await prisma.feedback.findUnique({
    where: { mockInterviewId },
    include: {
      mockInterview: {
        select: {
          recordingTranscription: true,
        },
      },
      analysisPoints: true,
    },
  });

  if (!feedback) return null;

  const strengths = feedback.analysisPoints.filter((point) => point.type === "STRENGTH");
  const improvements = feedback.analysisPoints.filter((point) => point.type === "IMPROVEMENT");
  const missingPoints = feedback.analysisPoints.filter((point) => point.type === "MISSING");

  console.log(
    "Analysis Points:",
    feedback.analysisPoints.map((p) => p.type)
  );

  return (
    <SectionCard
      title="Response Analysis"
      subtitle="Detailed feedback on your response"
      icon={MessageSquare}
    >
      <div className="space-y-10">
        {/* Effective Points Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">Effective Points</h3>
              <Badge variant="outline" className="bg-green-50/50">
                {strengths.length} {strengths.length === 1 ? "strength" : "strengths"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            {strengths.map((point, index) => (
              <div
                key={point.id}
                className="group rounded-xl border border-green-100 bg-gradient-to-b from-green-50/40 to-green-50/20 hover:shadow-md transition-all duration-200"
              >
                {point.quote && (
                  <blockquote className="p-4 border-b border-green-100/80">
                    <div className="flex gap-2">
                      <span className="text-green-600 font-medium">#{index + 1}</span>
                      <p className="text-sm text-gray-900 italic leading-relaxed">
                        "{point.quote}"
                      </p>
                    </div>
                  </blockquote>
                )}
                <div className="p-4 flex items-start gap-3">
                  <Badge className="shrink-0 mt-0.5 bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                    Strength
                  </Badge>
                  <p className="text-sm text-gray-700 leading-relaxed">{point.analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements section - now only showing IMPROVEMENT type */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">Areas for Improvement</h3>
              <Badge variant="outline" className="bg-red-50/50">
                {improvements.length} {improvements.length === 1 ? "area" : "areas"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            {improvements.map((point, index) => (
              <div
                key={point.id}
                className="group rounded-xl border border-red-100 bg-gradient-to-b from-red-50/40 to-red-50/20 hover:shadow-md transition-all duration-200"
              >
                {point.quote && (
                  <blockquote className="p-4 border-b border-red-100/80">
                    <div className="flex gap-2">
                      <span className="text-red-600 font-medium">#{index + 1}</span>
                      <p className="text-sm text-gray-900 italic leading-relaxed">
                        "{point.quote}"
                      </p>
                    </div>
                  </blockquote>
                )}
                <div className="p-4 flex items-start gap-3">
                  <Badge className="shrink-0 mt-0.5 bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                    Improvement
                  </Badge>
                  <p className="text-sm text-gray-700 leading-relaxed">{point.analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Missing Points section */}
        {missingPoints.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">Missing Points</h3>
                <Badge variant="outline" className="bg-orange-50/50">
                  {missingPoints.length} {missingPoints.length === 1 ? "point" : "points"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              {missingPoints.map((point, index) => (
                <div
                  key={point.id}
                  className="group rounded-xl border border-orange-100 bg-gradient-to-b from-orange-50/40 to-orange-50/20 hover:shadow-md transition-all duration-200"
                >
                  {point.quote && (
                    <blockquote className="p-4 border-b border-orange-100/80">
                      <div className="flex gap-2">
                        <span className="text-orange-600 font-medium">#{index + 1}</span>
                        <p className="text-sm text-gray-900 italic leading-relaxed">
                          "{point.quote}"
                        </p>
                      </div>
                    </blockquote>
                  )}
                  <div className="p-4 flex items-start gap-3">
                    <Badge className="shrink-0 mt-0.5 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                      Missing Point
                    </Badge>
                    <p className="text-sm text-gray-700 leading-relaxed">{point.analysis}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
