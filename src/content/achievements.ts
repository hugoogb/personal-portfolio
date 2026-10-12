export type AchievementId = "explorer" | "goal" | "hat" | "lap" | "night" | "console";

export interface Achievement {
  id: AchievementId;
  name: string;
  /** Shown in the trophies panel; a nudge, not a walkthrough. */
  hint: string;
}

/** Spec section 7. Quiet: each unlocks once, with a toast, and is saved. */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "explorer", name: "Explorer", hint: "Discover every place in town" },
  { id: "goal", name: "Top corner", hint: "Score a goal in the arena" },
  { id: "hat", name: "Straw hat", hint: "Something is hiding on the beach" },
  { id: "lap", name: "Fastest lap", hint: "Catch a car on the circuit" },
  { id: "night", name: "Night owl", hint: "Visit when it is night in Barcelona" },
  { id: "console", name: "Operator", hint: "Open the console" },
];

export const ACHIEVEMENT_IDS: AchievementId[] = ACHIEVEMENTS.map((a) => a.id);

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<
  AchievementId,
  Achievement
>;
