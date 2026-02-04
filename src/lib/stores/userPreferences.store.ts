import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type MeetingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ReadingPlan = 'New Testament' | 'Old Testament' | 'Whole Bible';

export interface UserPreferences {
  meetingDay: MeetingDay;
  readingPlan: ReadingPlan;
  completedDays: string[];
  weekOffset: number;
}

const defaultPreferences: UserPreferences = {
  meetingDay: 0,
  readingPlan: 'New Testament',
  completedDays: [],
  weekOffset: 0
};

// Load from localStorage if available
const stored = browser && localStorage.getItem('userPreferences');
const initialValue: UserPreferences = stored 
  ? JSON.parse(stored) 
  : defaultPreferences;

export const userPreferences = writable<UserPreferences>(initialValue);

// Subscribe to changes and save to localStorage
if (browser) {
  userPreferences.subscribe(value => {
    localStorage.setItem('userPreferences', JSON.stringify(value));
  });
}