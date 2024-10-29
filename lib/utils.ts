// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges them with Tailwind rules.
 *
 * @param inputs - Class names to combine.
 * @returns A single string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}
/**
 * Formats a date into a human-readable string.
 * Returns 'N/A' if the date is null or undefined.
 *
 * @param date - Date to format
 * @returns Formatted date string or 'N/A'
 */
export function formatDate(date: Date | null | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
