const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = WEEKDAYS[date.getDay()];
  return `${m}月${d}日（${weekday}）`;
}

export function getWeekRange(anchor = new Date()): { start: string; end: string; days: WeekDay[] } {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      dateKey: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
      day: d.getDate(),
      weekday: WEEKDAYS[d.getDay()],
    });
  }

  return { start: start.toISOString(), end: end.toISOString(), days };
}

export type WeekDay = {
  dateKey: string;
  day: number;
  weekday: string;
};

export function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function nowLocalDatetimeValue(): string {
  return toLocalDatetimeValue(new Date().toISOString());
}

export function localDatetimeToIso(local: string): string {
  return new Date(local).toISOString();
}
