import { jstDayBounds } from './jst';
import type { BookingRow } from '../types';

export type BookingDto = {
  id: string;
  customerId: string | null;
  customerName: string | null;
  startsAt: string;
  endsAt: string;
  menu: string | null;
  note: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type BookingQueryRow = BookingRow & { customer_name: string | null };

export function rowToBooking(row: BookingQueryRow): BookingDto {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    menu: row.menu,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const bookingSelect = `
  SELECT b.*, c.name AS customer_name
  FROM bookings b
  LEFT JOIN customers c ON c.id = b.customer_id
`;

export async function loadBookingsBetween(
  db: D1Database,
  from: string,
  to: string,
  status?: string,
): Promise<BookingDto[]> {
  let sql = `${bookingSelect}
    WHERE b.starts_at >= ? AND b.starts_at <= ?`;
  const binds: string[] = [from, to];

  if (status) {
    sql += ' AND b.status = ?';
    binds.push(status);
  }

  sql += ' ORDER BY b.starts_at ASC';

  const { results } = await db.prepare(sql).bind(...binds).all<BookingQueryRow>();
  return (results ?? []).map(rowToBooking);
}

export async function loadTodayBookings(db: D1Database, dateStr?: string): Promise<BookingDto[]> {
  const { start, end } = jstDayBounds(dateStr);
  return loadBookingsBetween(db, start, end, 'reserved');
}
