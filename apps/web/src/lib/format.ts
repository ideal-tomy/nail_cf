export function formatDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPrice(value: number | null): string {
  if (value == null) return '—';
  return `¥${value.toLocaleString('ja-JP')}`;
}
