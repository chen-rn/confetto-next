import { Card } from "@/components/ui/card";
import { Clock, ListChecks } from "lucide-react";

export function MMIApproach() {
  const timelineSteps = [
    {
      phase: "1. Initial Reflection",
      duration: "1 minute",
      content: "Analyze the question and organize your thoughts into a coherent structure",
    },
    {
      phase: "2. Structured Response",
      duration: "4-5 minutes",
      subSteps: [
        {
          title: "Opening Statement",
          duration: "30 seconds",
          content: "Clearly state the ethical dilemma and key considerations",
        },
        {
          title: "Ethical Framework",
          duration: "1 minute",
          content: "Apply relevant principles (autonomy, beneficence, justice, non-maleficence)",
        },
        {
          title: "Individual Perspective",
          duration: "1 minute",
          content: "Discuss personal rights and autonomy considerations",
        },
        {
          title: "Broader Impact",
          duration: "1 minute",
          content: "Address community/societal implications and stakeholder perspectives",
        },
        {
          title: "Balanced Resolution",
          duration: "1 minute",
          content: "Present a nuanced approach that considers all viewpoints",
        },
      ],
    },
    {
      phase: "3. Follow-up Questions",
      duration: "3-4 minutes",
      content: "Be prepared to elaborate on specific points or address new scenarios",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#635BFF]">
        <ListChecks className="h-5 w-5" />
        <h3 className="font-semibold">Strategy</h3>
      </div>
      <div className="grid gap-4">
        {timelineSteps.map((step, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-[#635BFF]">{step.phase}</h4>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {step.duration}
                </div>
              </div>

              {step.content && <p className="text-sm text-muted-foreground">{step.content}</p>}

              {step.subSteps && (
                <div className="ml-4 mt-2 space-y-2">
                  {step.subSteps.map((subStep, subIndex) => (
                    <div key={subIndex} className="border-l-2 border-[#635BFF]/10 pl-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{subStep.title}</span>
                        <span className="text-xs text-muted-foreground">{subStep.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{subStep.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
