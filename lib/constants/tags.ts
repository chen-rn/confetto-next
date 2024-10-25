export const TagType = {
  TOPIC: "TOPIC",
  COUNTRY: "COUNTRY",
  STATE: "STATE",
} as const;

export type TagType = (typeof TagType)[keyof typeof TagType];

export interface Tag {
  name: string;
  type: TagType;
}

export const TOPIC_TAGS: Tag[] = [
  { name: "Ethics", type: "TOPIC" },
  { name: "Critical Thinking", type: "TOPIC" },
  { name: "Communication", type: "TOPIC" },
  { name: "Social Issues", type: "TOPIC" },
  { name: "Professionalism", type: "TOPIC" },
  { name: "Empathy", type: "TOPIC" },
  { name: "Decision Making", type: "TOPIC" },
  { name: "Cultural Competency", type: "TOPIC" },
  { name: "Teamwork", type: "TOPIC" },
  { name: "Leadership", type: "TOPIC" },
  { name: "Time Management", type: "TOPIC" },
  { name: "Conflict Resolution", type: "TOPIC" },
  { name: "Patient Care", type: "TOPIC" },
  { name: "Healthcare Policy", type: "TOPIC" },
  { name: "Research Ethics", type: "TOPIC" },
  { name: "Medical Ethics", type: "TOPIC" },
  { name: "Personal Growth", type: "TOPIC" },
];

export const COUNTRY_TAGS: Tag[] = [
  { name: "United States", type: "COUNTRY" },
  { name: "Canada", type: "COUNTRY" },
];
export const STATE_TAGS: Tag[] = [
  // US States
  { name: "AL", type: "STATE" },
  { name: "AK", type: "STATE" },
  { name: "AZ", type: "STATE" },
  { name: "AR", type: "STATE" },
  { name: "CA", type: "STATE" },
  { name: "CO", type: "STATE" },
  { name: "CT", type: "STATE" },
  { name: "DC", type: "STATE" }, // Add District of Columbia
  { name: "DE", type: "STATE" },
  { name: "FL", type: "STATE" },
  { name: "GA", type: "STATE" },
  { name: "HI", type: "STATE" },
  { name: "ID", type: "STATE" },
  { name: "IL", type: "STATE" },
  { name: "IN", type: "STATE" },
  { name: "IA", type: "STATE" },
  { name: "KS", type: "STATE" },
  { name: "KY", type: "STATE" },
  { name: "LA", type: "STATE" },
  { name: "ME", type: "STATE" },
  { name: "MD", type: "STATE" },
  { name: "MA", type: "STATE" },
  { name: "MI", type: "STATE" },
  { name: "MN", type: "STATE" },
  { name: "MS", type: "STATE" },
  { name: "MO", type: "STATE" },
  { name: "MT", type: "STATE" },
  { name: "NE", type: "STATE" },
  { name: "NV", type: "STATE" },
  { name: "NH", type: "STATE" },
  { name: "NJ", type: "STATE" },
  { name: "NM", type: "STATE" },
  { name: "NY", type: "STATE" },
  { name: "NC", type: "STATE" },
  { name: "ND", type: "STATE" },
  { name: "OH", type: "STATE" },
  { name: "OK", type: "STATE" },
  { name: "OR", type: "STATE" },
  { name: "PA", type: "STATE" },
  { name: "RI", type: "STATE" },
  { name: "SC", type: "STATE" },
  { name: "SD", type: "STATE" },
  { name: "TN", type: "STATE" },
  { name: "TX", type: "STATE" },
  { name: "UT", type: "STATE" },
  { name: "VT", type: "STATE" },
  { name: "VA", type: "STATE" },
  { name: "WA", type: "STATE" },
  { name: "WV", type: "STATE" },
  { name: "WI", type: "STATE" },
  { name: "WY", type: "STATE" },

  // Canadian Provinces and Territories
  { name: "AB", type: "STATE" },
  { name: "BC", type: "STATE" },
  { name: "MB", type: "STATE" },
  { name: "NB", type: "STATE" },
  { name: "NL", type: "STATE" },
  { name: "NS", type: "STATE" },
  { name: "ON", type: "STATE" },
  { name: "PE", type: "STATE" },
  { name: "QC", type: "STATE" },
  { name: "SK", type: "STATE" },
  { name: "NT", type: "STATE" },
  { name: "NU", type: "STATE" },
  { name: "YT", type: "STATE" },

  // Add Puerto Rico
  { name: "PR", type: "STATE" },
];

export const ALL_TAGS: Tag[] = [...TOPIC_TAGS, ...COUNTRY_TAGS, ...STATE_TAGS];

// Helper functions
export function getTagsByType(type: TagType): Tag[] {
  return ALL_TAGS.filter((tag) => tag.type === type);
}

export function isValidTag(name: string): boolean {
  return ALL_TAGS.some((tag) => tag.name === name);
}

export function getTagByName(name: string): Tag | undefined {
  return ALL_TAGS.find((tag) => tag.name === name);
}
