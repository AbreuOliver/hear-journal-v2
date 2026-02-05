import { derived } from 'svelte/store';
import { userPreferences } from './userPreferences.store';

export const engagementMetrics = derived(userPreferences, ($prefs) => {
  const totalDaysCompleted = $prefs.completedDays.length;
  
  // Calculate current streak (consecutive days from most recent)
  const currentStreak = calculateCurrentStreak($prefs.completedDays);
  
  // Calculate longest streak ever
  const longestStreak = calculateLongestStreak($prefs.completedDays);
  
  return {
    totalDaysCompleted,
    currentStreak,
    longestStreak,
  };
});

function calculateCurrentStreak(completedDays: string[]): number {
  if (completedDays.length === 0) return 0;
  
  // Sort dates descending (most recent first)
  const sorted = [...completedDays]
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  for (const completedDate of sorted) {
    const completed = new Date(completedDate);
    completed.setHours(0, 0, 0, 0);
    
    // Check if this date matches our expected streak date
    if (completed.getTime() === checkDate.getTime()) {
      streak++;
      // Move back one day
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (completed.getTime() < checkDate.getTime()) {
      // Gap found, streak is broken
      break;
    }
  }
  
  return streak;
}

function calculateLongestStreak(completedDays: string[]): number {
  if (completedDays.length === 0) return 0;
  
  const sorted = [...completedDays]
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (dayDiff > 1) {
      currentStreak = 1;
    }
    // If dayDiff === 0, same day was added twice, just continue
  }
  
  return maxStreak;
}