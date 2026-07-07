import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a 24-hour "HH:MM" time string (as stored on ScheduleEvent, and as
 * produced by native <input type="time"> fields) into 12-hour AM/PM form for
 * display, e.g. "14:30" -> "2:30 PM". Falls back to the raw string if it
 * doesn't match the expected shape.
 */
export function formatTime12h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${minute} ${period}`;
}
