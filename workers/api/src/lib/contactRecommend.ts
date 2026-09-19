import type { VisitPhotoRow, VisitRow } from '../types';

export type CustomerStatusRow = {
  id: string;
  name: string;
  contact_interval_days: number;
  last_visit: string | null;
  days_since: number | null;
  last_contact: string | null;
};

export type ContactRecommendation = {
  customerId: string;
  name: string;
  daysSince: number;
  lastVisit: string;
  lastDesign: string | null;
  contactIntervalDays: number;
  latestVisitId: string;
  thumbPath: string | null;
  photoPath: string | null;
};

const RECENT_CONTACT_DAYS = 14;

export function isRecentlyContacted(sentAt: string | null, now = new Date()): boolean {
  if (!sentAt) return false;
  const sent = new Date(sentAt);
  if (Number.isNaN(sent.getTime())) return false;
  const diffMs = now.getTime() - sent.getTime();
  return diffMs < RECENT_CONTACT_DAYS * 24 * 60 * 60 * 1000;
}

export async function loadContactRecommendations(
  db: D1Database,
  now = new Date(),
): Promise<ContactRecommendation[]> {
  const nowIso = now.toISOString();

  const { results: statuses } = await db
    .prepare(
      `SELECT cs.id, cs.name, cs.last_visit, cs.days_since, cs.last_contact, c.contact_interval_days
       FROM customer_status cs
       JOIN customers c ON c.id = cs.id
       WHERE cs.days_since IS NOT NULL
         AND cs.last_visit IS NOT NULL
         AND cs.days_since >= c.contact_interval_days`,
    )
    .all<CustomerStatusRow>();

  if (!statuses?.length) return [];

  const { results: futureBookings } = await db
    .prepare(
      `SELECT DISTINCT customer_id
       FROM bookings
       WHERE status = 'reserved' AND starts_at > ?`,
    )
    .bind(nowIso)
    .all<{ customer_id: string }>();

  const booked = new Set((futureBookings ?? []).map((row) => row.customer_id));

  const candidates = (statuses ?? []).filter((row) => {
    if (booked.has(row.id)) return false;
    if (isRecentlyContacted(row.last_contact, now)) return false;
    return true;
  });

  candidates.sort((a, b) => (b.days_since ?? 0) - (a.days_since ?? 0));

  const recommendations: ContactRecommendation[] = [];

  for (const row of candidates) {
    const visit = await db
      .prepare(
        `SELECT * FROM visits
         WHERE customer_id = ?
         ORDER BY visited_on DESC, created_at DESC
         LIMIT 1`,
      )
      .bind(row.id)
      .first<VisitRow>();

    if (!visit) continue;

    const photo = await db
      .prepare(
        `SELECT path, thumb_path FROM visit_photos
         WHERE visit_id = ?
         ORDER BY sort_order ASC, created_at ASC
         LIMIT 1`,
      )
      .bind(visit.id)
      .first<Pick<VisitPhotoRow, 'path' | 'thumb_path'>>();

    recommendations.push({
      customerId: row.id,
      name: row.name,
      daysSince: row.days_since ?? 0,
      lastVisit: row.last_visit!,
      lastDesign: visit.design,
      contactIntervalDays: row.contact_interval_days,
      latestVisitId: visit.id,
      thumbPath: photo?.thumb_path ?? null,
      photoPath: photo?.path ?? null,
    });
  }

  return recommendations;
}
