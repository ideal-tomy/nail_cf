const TZ = 'Asia/Tokyo';

export function jstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date);
}

export function jstDayBounds(dateStr?: string): { start: string; end: string; date: string } {
  const date = dateStr ?? jstDateString();
  const start = new Date(`${date}T00:00:00+09:00`);
  const end = new Date(`${date}T23:59:59.999+09:00`);
  return { start: start.toISOString(), end: end.toISOString(), date };
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}
