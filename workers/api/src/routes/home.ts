import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { loadTodayBookings } from '../lib/bookings';
import { loadContactRecommendations } from '../lib/contactRecommend';

const home = new Hono<AppEnv>();

home.get('/', async (c) => {
  const [todayBookings, contactRecommendations] = await Promise.all([
    loadTodayBookings(c.env.DB),
    loadContactRecommendations(c.env.DB),
  ]);

  return c.json({
    todayBookings,
    contactRecommendations,
  });
});

export { home };
