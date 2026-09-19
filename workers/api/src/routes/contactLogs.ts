import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { badRequest, notFound } from '../lib/errors';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/time';

const contactLogs = new Hono<AppEnv>();

type ContactLogInput = {
  customerId?: string;
  body?: string;
  templateKey?: string | null;
  channel?: string;
};

contactLogs.post('/', async (c) => {
  const body = await c.req.json<ContactLogInput>();
  const customerId = body.customerId?.trim();
  const messageBody = body.body?.trim();

  if (!customerId) return badRequest(c, 'customerId is required');
  if (!messageBody) return badRequest(c, 'body is required');

  const customer = await c.env.DB.prepare(
    'SELECT id FROM customers WHERE id = ? AND archived = 0',
  )
    .bind(customerId)
    .first();

  if (!customer) return notFound(c, 'Customer not found');

  const id = newId();
  const sentAt = nowIso();
  const channel = body.channel?.trim() || 'line_share';

  await c.env.DB.prepare(
    `INSERT INTO contact_logs (id, customer_id, sent_at, channel, template_key, body)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, customerId, sentAt, channel, body.templateKey?.trim() || null, messageBody)
    .run();

  return c.json(
    {
      contactLog: {
        id,
        customerId,
        sentAt,
        channel,
        templateKey: body.templateKey ?? null,
        body: messageBody,
      },
    },
    201,
  );
});

export { contactLogs };
