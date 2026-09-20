import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { badRequest, notFound } from '../lib/errors';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/time';
import { deleteStoredPhotos } from '../lib/visitPhotos';
import type {
  CustomerInput,
  CustomerRow,
  VisitInput,
  VisitPhotoRow,
  VisitRow,
} from '../types';

const customers = new Hono<AppEnv>();

function rowToCustomer(row: CustomerRow) {
  return {
    id: row.id,
    name: row.name,
    nameKana: row.name_kana,
    phone: row.phone,
    lineName: row.line_name,
    birthday: row.birthday,
    preference: row.preference,
    note: row.note,
    contactIntervalDays: row.contact_interval_days,
    archived: row.archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToVisit(row: VisitRow, photos: VisitPhotoRow[]) {
  return {
    id: row.id,
    customerId: row.customer_id,
    bookingId: row.booking_id,
    visitedOn: row.visited_on,
    menu: row.menu,
    design: row.design,
    note: row.note,
    price: row.price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    photos: photos.map((p) => ({
      id: p.id,
      path: p.path,
      thumbPath: p.thumb_path,
      sortOrder: p.sort_order,
      createdAt: p.created_at,
    })),
  };
}

async function loadPhotos(db: D1Database, visitIds: string[]) {
  if (visitIds.length === 0) return new Map<string, VisitPhotoRow[]>();

  const placeholders = visitIds.map(() => '?').join(', ');
  const { results } = await db
    .prepare(
      `SELECT id, visit_id, path, thumb_path, sort_order, created_at
       FROM visit_photos
       WHERE visit_id IN (${placeholders})
       ORDER BY sort_order ASC, created_at ASC`,
    )
    .bind(...visitIds)
    .all<VisitPhotoRow>();

  const map = new Map<string, VisitPhotoRow[]>();
  for (const photo of results ?? []) {
    const list = map.get(photo.visit_id) ?? [];
    list.push(photo);
    map.set(photo.visit_id, list);
  }
  return map;
}

customers.get('/', async (c) => {
  const q = c.req.query('q')?.trim();
  let stmt;
  if (q) {
    stmt = c.env.DB.prepare(
      `SELECT * FROM customers
       WHERE archived = 0 AND name LIKE ?
       ORDER BY name ASC`,
    ).bind(`%${q}%`);
  } else {
    stmt = c.env.DB.prepare(
      `SELECT * FROM customers
       WHERE archived = 0
       ORDER BY name ASC`,
    );
  }

  const { results } = await stmt.all<CustomerRow>();
  return c.json({ customers: (results ?? []).map(rowToCustomer) });
});

customers.post('/', async (c) => {
  const body = await c.req.json<CustomerInput>();
  const name = body.name?.trim();
  if (!name) return badRequest(c, 'name is required');

  const interval = body.contact_interval_days ?? 28;
  if (interval < 7 || interval > 365) {
    return badRequest(c, 'contact_interval_days must be between 7 and 365');
  }

  const ts = nowIso();
  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO customers (
      id, name, name_kana, phone, line_name, birthday, preference, note,
      contact_interval_days, archived, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(
      id,
      name,
      body.name_kana?.trim() || null,
      body.phone?.trim() || null,
      body.line_name?.trim() || null,
      body.birthday?.trim() || null,
      body.preference?.trim() || null,
      body.note?.trim() || null,
      interval,
      ts,
      ts,
    )
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?')
    .bind(id)
    .first<CustomerRow>();

  if (!row) return c.json({ error: 'Failed to create customer' }, 500);
  return c.json({ customer: rowToCustomer(row) }, 201);
});

customers.get('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?')
    .bind(id)
    .first<CustomerRow>();

  if (!row || row.archived === 1) return notFound(c, 'Customer not found');
  return c.json({ customer: rowToCustomer(row) });
});

customers.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?')
    .bind(id)
    .first<CustomerRow>();

  if (!existing || existing.archived === 1) return notFound(c, 'Customer not found');

  const body = await c.req.json<CustomerInput>();
  const name = body.name !== undefined ? body.name.trim() : existing.name;
  if (!name) return badRequest(c, 'name is required');

  const interval =
    body.contact_interval_days !== undefined
      ? body.contact_interval_days
      : existing.contact_interval_days;
  if (interval < 7 || interval > 365) {
    return badRequest(c, 'contact_interval_days must be between 7 and 365');
  }

  const ts = nowIso();
  await c.env.DB.prepare(
    `UPDATE customers SET
      name = ?, name_kana = ?, phone = ?, line_name = ?, birthday = ?,
      preference = ?, note = ?, contact_interval_days = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      name,
      body.name_kana !== undefined ? body.name_kana?.trim() || null : existing.name_kana,
      body.phone !== undefined ? body.phone?.trim() || null : existing.phone,
      body.line_name !== undefined ? body.line_name?.trim() || null : existing.line_name,
      body.birthday !== undefined ? body.birthday?.trim() || null : existing.birthday,
      body.preference !== undefined ? body.preference?.trim() || null : existing.preference,
      body.note !== undefined ? body.note?.trim() || null : existing.note,
      interval,
      ts,
      id,
    )
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?')
    .bind(id)
    .first<CustomerRow>();

  if (!row) return notFound(c, 'Customer not found');
  return c.json({ customer: rowToCustomer(row) });
});

customers.get('/:id/visits', async (c) => {
  const id = c.req.param('id');
  const customer = await c.env.DB.prepare('SELECT id FROM customers WHERE id = ? AND archived = 0')
    .bind(id)
    .first();

  if (!customer) return notFound(c, 'Customer not found');

  const { results: visits } = await c.env.DB.prepare(
    `SELECT * FROM visits
     WHERE customer_id = ?
     ORDER BY visited_on DESC, created_at DESC`,
  )
    .bind(id)
    .all<VisitRow>();

  const visitList = visits ?? [];
  const photoMap = await loadPhotos(
    c.env.DB,
    visitList.map((v) => v.id),
  );

  return c.json({
    visits: visitList.map((v) => rowToVisit(v, photoMap.get(v.id) ?? [])),
  });
});

customers.post('/:id/visits', async (c) => {
  const customerId = c.req.param('id');
  const customer = await c.env.DB.prepare('SELECT id FROM customers WHERE id = ? AND archived = 0')
    .bind(customerId)
    .first();

  if (!customer) return notFound(c, 'Customer not found');

  const body = await c.req.json<VisitInput>();
  const visitedOn = body.visited_on?.trim();
  if (!visitedOn) return badRequest(c, 'visited_on is required');

  if (body.price != null && (body.price < 0 || !Number.isInteger(body.price))) {
    return badRequest(c, 'price must be a non-negative integer');
  }

  const ts = nowIso();
  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO visits (
      id, customer_id, booking_id, visited_on, menu, design, note, price, created_at, updated_at
    ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      customerId,
      visitedOn,
      body.menu?.trim() || null,
      body.design?.trim() || null,
      body.note?.trim() || null,
      body.price ?? null,
      ts,
      ts,
    )
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM visits WHERE id = ?')
    .bind(id)
    .first<VisitRow>();

  if (!row) return c.json({ error: 'Failed to create visit' }, 500);
  return c.json({ visit: rowToVisit(row, []) }, 201);
});

customers.patch('/:id/visits/:visitId', async (c) => {
  const customerId = c.req.param('id');
  const visitId = c.req.param('visitId');

  const existing = await c.env.DB.prepare(
    'SELECT * FROM visits WHERE id = ? AND customer_id = ?',
  )
    .bind(visitId, customerId)
    .first<VisitRow>();

  if (!existing) return notFound(c, 'Visit not found');

  const body = await c.req.json<VisitInput>();
  const visitedOn =
    body.visited_on !== undefined ? body.visited_on.trim() : existing.visited_on;
  if (!visitedOn) return badRequest(c, 'visited_on is required');

  const price =
    body.price !== undefined ? body.price : existing.price;
  if (price != null && (price < 0 || !Number.isInteger(price))) {
    return badRequest(c, 'price must be a non-negative integer');
  }

  const ts = nowIso();
  await c.env.DB.prepare(
    `UPDATE visits SET
      visited_on = ?, menu = ?, design = ?, note = ?, price = ?, updated_at = ?
     WHERE id = ? AND customer_id = ?`,
  )
    .bind(
      visitedOn,
      body.menu !== undefined ? body.menu?.trim() || null : existing.menu,
      body.design !== undefined ? body.design?.trim() || null : existing.design,
      body.note !== undefined ? body.note?.trim() || null : existing.note,
      price,
      ts,
      visitId,
      customerId,
    )
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM visits WHERE id = ?')
    .bind(visitId)
    .first<VisitRow>();

  if (!row) return notFound(c, 'Visit not found');

  const photoMap = await loadPhotos(c.env.DB, [visitId]);
  return c.json({ visit: rowToVisit(row, photoMap.get(visitId) ?? []) });
});

customers.delete('/:id/visits/:visitId', async (c) => {
  const customerId = c.req.param('id');
  const visitId = c.req.param('visitId');

  const existing = await c.env.DB.prepare(
    'SELECT * FROM visits WHERE id = ? AND customer_id = ?',
  )
    .bind(visitId, customerId)
    .first<VisitRow>();

  if (!existing) return notFound(c, 'Visit not found');

  const { results: photos } = await c.env.DB.prepare(
    'SELECT * FROM visit_photos WHERE visit_id = ?',
  )
    .bind(visitId)
    .all<VisitPhotoRow>();

  await deleteStoredPhotos(c.env.PHOTOS, photos ?? []);
  await c.env.DB.prepare('DELETE FROM visits WHERE id = ? AND customer_id = ?')
    .bind(visitId, customerId)
    .run();

  return c.json({ ok: true });
});

export { customers };
