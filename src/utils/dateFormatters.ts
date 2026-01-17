/**
 * Date formatting utilities for consistent date/time display across the app
 */

/**
 * Formats a date for event cards (e.g., "Mon, Jan 15")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatEventCardDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a time for event cards (e.g., "3:00 PM")
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export function formatEventCardTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date for event detail pages (e.g., "Mon, 15 Jan 2024")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatEventDetailDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a time for event detail pages (e.g., "15:00")
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export function formatEventDetailTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a full date and time (e.g., "Mon, 15 Jan 2024 at 15:00")
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export function formatEventDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = formatEventDetailDate(dateObj);
  const formattedTime = formatEventDetailTime(dateObj);
  return `${formattedDate} at ${formattedTime}`;
}
