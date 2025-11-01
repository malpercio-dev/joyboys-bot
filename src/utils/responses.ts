import { ResponseSet } from "../config/responses.js";

/**
 * Randomly selects a response from a ResponseSet and applies string replacements.
 * 
 * @param set - The ResponseSet containing array of possible responses
 * @param replacements - Optional object mapping placeholder keys to values (e.g., {inGameName: "Bob"})
 * @returns A randomly selected response with replacements applied
 */
export function getRandomResponse(
  set: ResponseSet,
  replacements?: Record<string, string>
): string {
  if (!set.responses || set.responses.length === 0) {
    return "An error occurred. Please try again.";
  }

  // Randomly select a response
  const randomIndex = Math.floor(Math.random() * set.responses.length);
  let response = set.responses[randomIndex];

  // Apply replacements if provided
  if (replacements) {
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{${key}}`;
      response = response.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value || "");
    }
  }

  return response;
}
