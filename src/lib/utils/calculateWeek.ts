/**
 * CALCULATE THE CURRENT WEEK NUMBER OF THE YEAR WITH A CUSTOM START DAY
 * @param date - THE DATE TO CALCULATE THE WEEK FOR (DEFAULT TO TODAY)
 * @param weekStartDay - THE DAY WEEK STARTS ON (0 = SUNDAY, 1 = MONDAY, ..., 6 = SATURDAY)
 * @returns THE WEEK NUMBER AS A 1-BASED INTEGER
 */
export function getWeekOfYear(date: Date = new Date(), weekStartDay: number = 0): number {
  const target = new Date(date.getTime());
  target.setHours(0, 0, 0, 0);

  const dayOfWeek = target.getDay();
  const dayOffset = (dayOfWeek < weekStartDay) 
    ? 7 - (weekStartDay - dayOfWeek)
    : dayOfWeek - weekStartDay;

  target.setDate(target.getDate() - dayOffset);

  const yearStart = new Date(target.getFullYear(), 0, 1);
  yearStart.setHours(0, 0, 0, 0);

  const yearStartDayOfWeek = yearStart.getDay();
  const yearStartOffset = (yearStartDayOfWeek < weekStartDay)
    ? 7 - (weekStartDay - yearStartDayOfWeek)
    : yearStartDayOfWeek - weekStartDay;

  yearStart.setDate(yearStart.getDate() - yearStartOffset);

  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const diff = target.getTime() - yearStart.getTime();
  let weekNumber = Math.floor(diff / oneWeekMs) + 1; // ✅ Fixed: was + 2

  if (weekNumber > 52) {
    weekNumber = ((weekNumber - 1) % 52) + 1;
  }

  return weekNumber;
}

// getWeekRange remains the same

/**
 * GET THE START AND END DATES OF THE WEEK FOR A GIVEN DATE AND WEEK START DAY
 * @param date - THE DATE TO CALCULATE THE WEEK RANGE FOR (DEFAULT TO TODAY)
 * @param weekStartDay - THE DAY WEEK STARTS ON (0 = SUNDAY, 1 = MONDAY, ..., 6 = SATURDAY)
 * @returns AN OBJECT WITH `start` AND `end` DATES REPRESENTING THE WEEK RANGE
 */
export function getWeekRange(date: Date = new Date(), weekStartDay: number = 0): { start: Date; end: Date } {
  // COPY DATE TO AVOID MUTATING ORIGINAL
  const target = new Date(date.getTime());
  target.setHours(0, 0, 0, 0);

  // GET THE DAY OF WEEK (0=SUN,...)
  const dayOfWeek = target.getDay();

  // CALCULATE OFFSET TO START OF WEEK
  const dayOffset = (dayOfWeek < weekStartDay) ? 7 - (weekStartDay - dayOfWeek) : dayOfWeek - weekStartDay;

  // CALCULATE START OF WEEK DATE
  const start = new Date(target);
  start.setDate(target.getDate() - dayOffset);
  start.setHours(0, 0, 0, 0);

  // CALCULATE END OF WEEK DATE (6 DAYS AFTER START)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
