export function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeIso(value: string | null | undefined): string {
  if (!value) return nowIso();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? nowIso() : d.toISOString();
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
