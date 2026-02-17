import { Compound, InjectionLog } from '../types';

export const isCompoundDueOnDate = (compound: Compound, date: Date): boolean => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const startDate = new Date(compound.startDate);
  startDate.setHours(0, 0, 0, 0);

  if (startOfDay < startDate) return false;

  if (compound.frequencyType === 'specific_days') {
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = WEEKDAYS[startOfDay.getDay()];
    return compound.frequencySpecificDays?.includes(dayName) || false;
  } else if (compound.frequencyDays) {
    const diffTime = startOfDay.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % compound.frequencyDays === 0;
  }
  return false;
};

export const getScheduledCompounds = (compounds: Compound[], date: Date): Compound[] => {
  return compounds.filter((c) => !c.isArchived && isCompoundDueOnDate(c, date));
};

export const getLogsOnDate = (logs: InjectionLog[], date: Date): InjectionLog[] => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return logs.filter((l) => {
    const t = new Date(l.timestamp);
    return t >= start && t <= end;
  });
};

export const getNextScheduledDose = (
  compounds: Compound[],
  fromDate: Date = new Date(),
  logs: InjectionLog[] = []
): { date: Date; compound: Compound } | null => {
  let earliest: { date: Date; compound: Compound } | null = null;
  const startFrom = new Date(fromDate);
  startFrom.setHours(0, 0, 0, 0);

  compounds
    .filter((c) => !c.isArchived)
    .forEach((c) => {
      let nextDate: Date | null = null;

      if (c.frequencyType === 'specific_days' && c.frequencySpecificDays) {
        const map: Record<string, number> = {
          Sun: 0,
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
        };
        const targetDays = c.frequencySpecificDays.map((d) => map[d]).sort((a, b) => a - b);
        const currentDay = startFrom.getDay();

        // Find next day in list that is AFTER today
        // If we want "next from today", we look for > currentDay
        let nextDayIndex = targetDays.find((d) => d > currentDay);
        let daysToAdd = 0;

        if (nextDayIndex !== undefined) {
          daysToAdd = nextDayIndex - currentDay;
        } else {
          // Wrap to next week
          nextDayIndex = targetDays[0];
          daysToAdd = 7 - (currentDay - nextDayIndex!);
        }

        // If daysToAdd is 0 (shouldn't happen with > check), add 7
        if (daysToAdd === 0) daysToAdd = 7;

        nextDate = new Date(startFrom);
        nextDate.setDate(startFrom.getDate() + daysToAdd);
      } else if (c.frequencyDays) {
        // Interval Logic
        // Try to find the last log for this compound
        const cLogs = logs
          .filter((l) => l.compoundId === c.id)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const lastLog = cLogs[cLogs.length - 1];

        if (lastLog) {
          const lastDate = new Date(lastLog.timestamp);
          lastDate.setHours(0, 0, 0, 0);
          nextDate = new Date(lastDate);
          nextDate.setDate(lastDate.getDate() + c.frequencyDays);

          // If next date is in the past, calculate next interval from today to be safe, or show it as overdue (which is effectively "next" to do)
          if (nextDate <= startFrom) {
            // It is due today or past due. Since we want the "Next" one looking forward from "No doses scheduled TODAY",
            // this implies we checked today and it wasn't there.
            // However, if we use this function generally, we should just return the calculated next date.
            // If the user cleared "Today's" list, this function shouldn't return today.
            // Let's assume strict future for this specific UI requirement.
            while (nextDate <= startFrom) {
              nextDate.setDate(nextDate.getDate() + c.frequencyDays);
            }
          }
        } else {
          // No logs, project from start date
          const startDate = new Date(c.startDate);
          startDate.setHours(0, 0, 0, 0);

          if (startDate > startFrom) {
            nextDate = startDate;
          } else {
            const diffTime = startFrom.getTime() - startDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const remainder = diffDays % c.frequencyDays;
            const daysUntilNext = c.frequencyDays - remainder;
            nextDate = new Date(startFrom);
            nextDate.setDate(startFrom.getDate() + daysUntilNext);
          }
        }
      }

      if (nextDate) {
        if (!earliest || nextDate < earliest.date) {
          earliest = { date: nextDate, compound: c };
        }
      }
    });

  return earliest;
};
