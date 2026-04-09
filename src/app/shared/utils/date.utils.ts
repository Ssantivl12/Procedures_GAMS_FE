/**
 * Parses a date string as a pure local date, ignoring any time/timezone component.
 * Use this for all date fields that come from the API as ISO strings (e.g. "2026-04-16T00:00:00.000Z")
 * to avoid the browser shifting the date to the previous day in negative-offset timezones (UTC-4, etc.).
 */
export function parsePureDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatPureDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return parsePureDate(dateStr).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
