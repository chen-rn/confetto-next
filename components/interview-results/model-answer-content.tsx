import { Card } from "@/components/ui/card";
import { MessageSquare, AlertCircle, CheckCircle2, Check, X } from "lucide-react";

export function ModelAnswerContent() {
  const modelAnswer = {
    question:
      "A 15-year-old patient requests birth control but doesn't want their parents to know. How would you handle this situation?",
    keyPoints: [
      "Patient confidentiality and minor's rights",
      "Parental involvement benefits",
      "Risk assessment",
      "Legal considerations",
    ],
    sampleAnswer: `I would begin by acknowledging that this situation involves balancing patient confidentiality with the complexities of treating minors. First, I would ensure the patient feels safe and comfortable discussing their healthcare needs.

I would explain that while I respect their privacy, I need to assess several factors to provide the best care. This includes their medical history, understanding of contraception, and any potential risks.

In most jurisdictions, minors can consent to contraceptive care without parental notification. However, I would explore their reasons for not wanting to involve their parents, as family support can be beneficial for ongoing healthcare.

I would also ensure they understand:
- The importance of safe sex practices
- Various contraceptive options
- Potential side effects
- The value of regular health check-ups

My approach would prioritize their health while maintaining professional ethics and legal compliance.`,
    doAndDonts: {
      do: [
        "Maintain professional confidentiality",
        "Assess patient maturity and understanding",
        "Provide comprehensive education",
        "Document all discussions and decisions",
      ],
      dont: [
        "Break patient trust",
        "Make assumptions about the situation",
        "Ignore signs of potential abuse or coercion",
        "Fail to address safety concerns",
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#635BFF]" />
          <h3 className="font-semibold">Model Response</h3>
        </div>
        <Card className="p-4">
          <p className="text-sm whitespace-pre-line">{modelAnswer.sampleAnswer}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 border-green-200 bg-green-50">
          <h4 className="font-medium text-green-700 mb-2">Do's</h4>
          <ul className="space-y-2">
            {modelAnswer.doAndDonts.do.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 border-red-200 bg-red-50">
          <h4 className="font-medium text-red-700 mb-2">Don'ts</h4>
          <ul className="space-y-2">
            {modelAnswer.doAndDonts.dont.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-red-600">
                <X className="h-4 w-4" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
