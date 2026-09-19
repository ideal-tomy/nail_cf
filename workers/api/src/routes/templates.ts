import { Hono } from 'hono';
import type { AppEnv } from '../env';

const templates = new Hono<AppEnv>();

type TemplateRow = {
  id: string;
  title: string;
  body: string;
  sort_order: number;
};

templates.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, body, sort_order
     FROM message_templates
     ORDER BY sort_order ASC`,
  ).all<TemplateRow>();

  return c.json({
    templates: (results ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      sortOrder: row.sort_order,
    })),
  });
});

export { templates };
