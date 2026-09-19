import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv } from './env';
import { requireAuth } from './middleware/requireAuth';
import { auth } from './routes/auth';
import { bookings } from './routes/bookings';
import { contactLogs } from './routes/contactLogs';
import { customers } from './routes/customers';
import { home } from './routes/home';
import { photoServe, visitPhotos } from './routes/photos';
import { templates } from './routes/templates';

const app = new Hono<AppEnv>();

app.use(
  '/api/*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
  }),
);

app.get('/api/health', async (c) => {
  let dbOk = false;
  try {
    await c.env.DB.prepare('select 1 as ok').first();
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return c.json({
    ok: true,
    service: 'nail-cf',
    db: dbOk,
    ts: new Date().toISOString(),
  });
});

app.route('/api/auth', auth);

app.use('/api/*', async (c, next) => {
  const path = c.req.path;
  if (path.startsWith('/api/auth') || path === '/api/health') {
    return next();
  }
  return requireAuth(c, next);
});

app.route('/api/home', home);
app.route('/api/bookings', bookings);
app.route('/api/customers', customers);
app.route('/api/templates', templates);
app.route('/api/contact-logs', contactLogs);
app.route('/api/photos', photoServe);
app.route('/api/visits', visitPhotos);

/** SPA + 静的アセット（ビルド済み Vite） */
app.all('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
