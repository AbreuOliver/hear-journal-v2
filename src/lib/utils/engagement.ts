import { get } from 'svelte/store';
import { engagement, type EngagementState } from '$lib/stores/engagement.store'

function localDayKey(d = new Date()): string {
  // Local date as YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function recordAppOpenOncePerDay() {
  const today = localDayKey();
  const current = get(engagement);

  // Already counted today
  if (current.lastOpenDate === today) return;

  const next: EngagementState = {
    totalOpenDays: Math.max(0, (current.totalOpenDays ?? 0) + 1),
    lastOpenDate: today
  };

  engagement.set(next);
}
