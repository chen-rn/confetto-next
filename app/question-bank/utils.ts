export function getTagStyles(tagName: string) {
  // Communication-related tags
  if (tagName === "Communication") {
    return "bg-blue-100 text-blue-700 hover:bg-blue-200";
  }

  // Ethics & Professionalism-related tags
  if (["Ethics", "Professionalism", "Medical Ethics", "Research Ethics"].includes(tagName)) {
    return "bg-purple-100 text-purple-700 hover:bg-purple-200";
  }

  // Cultural & Social tags
  if (["Cultural Competency", "Social Issues"].includes(tagName)) {
    return "bg-rose-100 text-rose-700 hover:bg-rose-200";
  }

  // Leadership & Decision Making tags
  if (["Leadership", "Decision Making", "Teamwork"].includes(tagName)) {
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
  }

  // Healthcare-specific tags
  if (["Patient Care", "Healthcare Policy"].includes(tagName)) {
    return "bg-amber-100 text-amber-700 hover:bg-amber-200";
  }

  // Default style for other tags
  return "bg-gray-100 text-gray-700 hover:bg-gray-200";
}
