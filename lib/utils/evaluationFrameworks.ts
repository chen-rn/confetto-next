import { School } from "@prisma/client";

export type EvaluationFramework = "CANMEDS" | "AAMC" | "GMC" | string;

export function determineEvaluationFrameworks(schools: School[]): EvaluationFramework[] {
  if (!schools?.length) return ["AAMC"]; // Default to AAMC if no schools

  const frameworks = new Set<EvaluationFramework>();

  for (const school of schools) {
    switch (school.country) {
      case "Canada":
        frameworks.add("CANMEDS");
        break;
      case "United States of America":
        frameworks.add("AAMC");
        break;
      case "United Kingdom":
        frameworks.add("GMC");
        break;
      // Easy to add more frameworks for other countries
      // case 'Malaysia':
      //   frameworks.add('MALAYSIAN_FRAMEWORK');
      //   break;
    }
  }

  return Array.from(frameworks);
}

export function getEvaluationPrompt(frameworks: EvaluationFramework[]): string {
  const frameworkDescriptions = frameworks.map((framework) => {
    switch (framework) {
      case "CANMEDS":
        return "the CanMEDs framework (focusing on medical expert, communicator, collaborator, leader, health advocate, scholar, and professional roles)";
      case "AAMC":
        return "the AAMC framework (focusing on patient care, medical knowledge, practice-based learning, interpersonal skills, professionalism, and systems-based practice)";
      case "GMC":
        return "the GMC framework (focusing on knowledge skills and performance, safety and quality, communication partnership and teamwork, and maintaining trust)";
      default:
        return framework;
    }
  });

  if (frameworkDescriptions.length > 1) {
    return `Please evaluate this response using multiple frameworks: ${frameworkDescriptions.join(
      " and "
    )}`;
  }

  return `Please evaluate this response using ${frameworkDescriptions[0]}`;
}
