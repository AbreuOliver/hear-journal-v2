import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type EngagementState = {
  totalOpenDays: number;
  lastOpenDate: string | null; // YYYY-MM-DD in user's local time
};

const STORAGE_KEY = 'hear_engagement_v1';

function readFromStorage(): EngagementState {
  if (!browser) return { totalOpenDays: 0, lastOpenDate: null };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { totalOpenDays: 0, lastOpenDate: null };

    const parsed = JSON.parse(raw) as Partial<EngagementState>;

    const totalOpenDays =
      typeof parsed.totalOpenDays === 'number' && Number.isFinite(parsed.totalOpenDays)
        ? parsed.totalOpenDays
        : 0;

    const lastOpenDate =
      typeof parsed.lastOpenDate === 'string' && parsed.lastOpenDate.length >= 10
        ? parsed.lastOpenDate
        : null;

    return { totalOpenDays, lastOpenDate };
  } catch {
    return { totalOpenDays: 0, lastOpenDate: null };
  }
}


function writeToStorage(state: EngagementState) {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = readFromStorage();

export const engagement = writable<EngagementState>(initial);

// Persist on changes (client only)
if (browser) {
  engagement.subscribe((state) => writeToStorage(state));
}
