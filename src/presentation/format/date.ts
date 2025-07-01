/**
 * Formats a date as a readable string using the user's locale
 * Example: "July 1, 2024 at 2:30 PM"
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}