import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { addMinutes } from '../lib/jst';
import { loadBookingsBetween, rowToBooking } from '../lib/bookings';
import { badRequest, notFound } from '../lib/errors';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/time';
import type { BookingInput, BookingRow } from '../types';

const bookings = new Hono<AppEnv>();

const VALID_STATUS = new Set(['reserved', 'done', 'canceled']);

bookings.get('/', async (c) => {
  const from = c.req.query('from');
  const to = c.req.query('to');
  const status = c.req.query('status');

  if (!from || !to) {
    return badRequest(c, 'from and to query params are required (ISO8601)');
  }

  const list = await loadBookingsBetween(c.env.DB, from, to, status || undefined);
  return c.json({ bookings: list });
});

bookings.post('/', async (c) => {
  const body = await c.req.json<BookingInput>();
  const startsAt = body.startsAt?.trim();
  if (!startsAt) return badRequest(c, 'startsAt is required');

  const starts = new Date(startsAt);
  if (Number.isNaN(starts.getTime())) return badRequest(c, 'startsAt is invalid');

  let endsAt = body.endsAt?.trim();
  if (!endsAt) {
    const duration = body.durationMin ?? 60;
    if (duration < 15 || duration > 480) {
      return badRequest(c, 'durationMin must be between 15 and 480');
    }
    endsAt = addMinutes(startsAt, duration);
  }

  const ends = new Date(endsAt);
  if (Number.isNaN(ends.getTime()) || ends <= starts) {
    return badRequest(c, 'endsAt must be after startsAt');
  }

  if (body.customerId) {
    const customer = await c.env.DB.prepare('SELECT id FROM customers WHERE id = ? AND archived = 0')
      .bind(body.customerId)
      .first();
    if (!customer) return notFound(c, 'Customer not found');
  }

  const status = body.status ?? 'reserved';
  if (!VALID_STATUS.has(status)) return badRequest(c, 'invalid status');

  const ts = nowIso();
  const id = newId();

  await c.env.DB.prepare(
    `INSERT INTO bookings (
      id, customer_id, starts_at, ends_at, menu, note, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      body.customerId ?? null,
      starts.toISOString(),
      ends.toISOString(),
      body.menu?.trim() || null,
      body.note?.trim() || null,
      status,
      ts,
      ts,
    )
    .run();

  const row = await c.env.DB.prepare(
    `SELECT b.*, c.name AS customer_name
     FROM bookings b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.id = ?`,
  )
    .bind(id)
    .first<BookingRow & { customer_name: string | null }>();

  if (!row) return c.json({ error: 'Failed to create booking' }, 500);
  return c.json({ booking: rowToBooking(row) }, 201);
});

bookings.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first<BookingRow>();

  if (!existing) return notFound(c, 'Booking not found');

  const body = await c.req.json<BookingInput>();
  const startsAt = body.startsAt !== undefined ? body.startsAt.trim() : existing.starts_at;
  const starts = new Date(startsAt);
  if (Number.isNaN(starts.getTime())) return badRequest(c, 'startsAt is invalid');

  let endsAt = body.endsAt?.trim() ?? existing.ends_at;
  if (body.durationMin != null && body.startsAt !== undefined) {
    endsAt = addMinutes(startsAt, body.durationMin);
  }

  const ends = new Date(endsAt);
  if (Number.isNaN(ends.getTime()) || ends <= starts) {
    return badRequest(c, 'endsAt must be after startsAt');
  }

  const customerId =
    body.customerId !== undefined ? body.customerId : existing.customer_id;
  if (customerId) {
    const customer = await c.env.DB.prepare('SELECT id FROM customers WHERE id = ? AND archived = 0')
      .bind(customerId)
      .first();
    if (!customer) return notFound(c, 'Customer not found');
  }

  const status = body.status ?? existing.status;
  if (!VALID_STATUS.has(status)) return badRequest(c, 'invalid status');

  const ts = nowIso();
  await c.env.DB.prepare(
    `UPDATE bookings SET
      customer_id = ?, starts_at = ?, ends_at = ?, menu = ?, note = ?, status = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      customerId,
      starts.toISOString(),
      ends.toISOString(),
      body.menu !== undefined ? body.menu?.trim() || null : existing.menu,
      body.note !== undefined ? body.note?.trim() || null : existing.note,
      status,
      ts,
      id,
    )
    .run();

  const row = await c.env.DB.prepare(
    `SELECT b.*, c.name AS customer_name
     FROM bookings b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.id = ?`,
  )
    .bind(id)
    .first<BookingRow & { customer_name: string | null }>();

  if (!row) return notFound(c, 'Booking not found');
  return c.json({ booking: rowToBooking(row) });
});

bookings.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT id FROM bookings WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Booking not found');

  await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

export { bookings };
