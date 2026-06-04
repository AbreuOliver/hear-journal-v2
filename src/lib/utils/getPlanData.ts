import plansData from '$lib/data/plans.json';

type PlanEntry = {
  plan: string[];
  memoryVerses: string[];
};

type ReadingPlan = {
  plan: string[];
  memoryVerses: string[];
} | null;

/**
 * LOOK UP THE READING PLAN AND MEMORY VERSE FOR A GIVEN WEEK AND PLAN NAME.
 * @param weekNumber - THE CURRENT WEEK NUMBER (1-52)
 * @param selectedPlan - THE PLAN NAME, e.g. "New Testament"
 * @returns THE PLAN AND MEMORY VERSES OR NULL IF NOT FOUND
 */
export function getReadingPlan(
  weekNumber: number,
  selectedPlan: string
): ReadingPlan {
  const planKeyMap: Record<string, keyof typeof plansData> = {
    "New Testament": "F260_NewTestament",
    "Whole Bible": "F260_WholeBible",
    "Old Testament": "F260_OldTestament",
  };

  const key = planKeyMap[selectedPlan];
  if (!key) {
    console.warn("Unknown plan:", selectedPlan);
    return null;
  }

  const planData = plansData[key] as Record<string, PlanEntry> | undefined;
  if (!planData) {
    console.warn("Missing plan data for key:", key);
    return null;
  }

  const weekStr = weekNumber.toString(); // or padStart if needed
  const weekEntry: PlanEntry | undefined = planData[weekStr];
  if (!weekEntry) {
    console.warn(`Missing week data for week ${weekStr} in plan ${key}`);
    return null;
  }

  if (!weekEntry.memoryVerses) {
    console.warn(`Missing memory verses for week ${weekStr} in plan ${key}`);
  }

  return {
    plan: weekEntry.plan,
    memoryVerses: weekEntry.memoryVerses,
  };
}
