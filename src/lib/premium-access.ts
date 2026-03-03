import type { Topic } from "@/types/curriculum";

/**
 * Check if a topic is the first in its subject (index 0).
 * First topics get free access to quiz + simulation.
 */
export function isFirstTopic(
  subjectTopics: Topic[],
  topicId: string
): boolean {
  return subjectTopics.length > 0 && subjectTopics[0].id === topicId;
}

/**
 * Can the user access this topic's quiz?
 * Free if: first topic in subject OR user has premium.
 */
export function canAccessQuiz(
  isPremium: boolean,
  subjectTopics: Topic[],
  topicId: string
): boolean {
  return isPremium || isFirstTopic(subjectTopics, topicId);
}

/**
 * Can the user access this topic's simulation?
 * Always requires premium (no free sim).
 */
export function canAccessSimulation(isPremium: boolean): boolean {
  return isPremium;
}
