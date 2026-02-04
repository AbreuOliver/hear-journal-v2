import { derived } from 'svelte/store';
import { userPreferences } from './userPreferences.store';
import { getWeekOfYear, getWeekRange } from '$lib/utils/calculateWeek';
import { getReadingPlan } from '$lib/utils/getPlanData';

export const weekData = derived(userPreferences, ($prefs) => {
  const today = new Date();
  const displayDate = new Date(today);
  displayDate.setDate(displayDate.getDate() + $prefs.weekOffset * 7);

  const currentWeek = getWeekOfYear(displayDate, $prefs.meetingDay);
  const { start, end } = getWeekRange(displayDate, $prefs.meetingDay);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const weekRangeString = `${formatDate(start)} - ${formatDate(end)}`;
  const isCurrentWeek = $prefs.weekOffset === 0;
  const reading = getReadingPlan(currentWeek, $prefs.readingPlan);

  return {
    currentWeek,
    weekRangeString,
    isCurrentWeek,
    reading,
    displayDate,
  };
});