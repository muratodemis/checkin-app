import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MONTH_NAMES } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date to "YYYY-MM-DD" using LOCAL time (no UTC shift) */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse "YYYY-MM-DD" to a Date at local midnight */
function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Get Monday of the current week (ISO week) */
export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const dow = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = d.getDate() - dow + (dow === 0 ? -6 : 1);
  d.setDate(diff);
  return toLocalDateStr(d);
}

/** Format a date string to Turkish format: "10 Şubat 2026" */
export function formatDateTurkish(dateStr: string): string {
  const d = parseLocal(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format short date: "10 Şub" */
export function formatDateShort(dateStr: string): string {
  const d = parseLocal(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

/** Get the actual date for a given week start + day number (1=Mon..5=Fri) */
export function getDayDate(weekStart: string, dayNum: number): string {
  const monday = parseLocal(weekStart);
  monday.setDate(monday.getDate() + (dayNum - 1));
  return toLocalDateStr(monday);
}

/** Format week range: "9-15 Şubat 2026" (always Monday to Sunday) */
export function formatWeekRange(weekStart: string): string {
  const startDate = parseLocal(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // Sunday

  const startMonth = MONTH_NAMES[startDate.getMonth()];
  const endMonth = MONTH_NAMES[endDate.getMonth()];

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}-${endDate.getDate()} ${endMonth} ${endDate.getFullYear()}`;
  }
  return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth} ${endDate.getFullYear()}`;
}

/** Navigate to previous/next Monday */
export function getAdjacentMonday(weekStart: string, direction: "prev" | "next"): string {
  const d = parseLocal(weekStart);
  d.setDate(d.getDate() + (direction === "prev" ? -7 : 7));
  return toLocalDateStr(d);
}
