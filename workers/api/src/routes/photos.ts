import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { badRequest, notFound } from '../lib/errors';
import { newId } from '../lib/ids';
import { nowIso } from '../lib/time';
import type { VisitRow } from '../types';

const photoServe = new Hono<AppEnv>();
const visitPhotos = new Hono<AppEnv>();

const MAX_PHOTOS_PER_VISIT = 5;

function isUploadBlob(value: unknown): value is Blob {
  return value != null && typeof value === 'object' && 'arrayBuffer' in value;
}

photoServe.get('/*', async (c) => {
  const key = c.req.path.replace(/^\/api\/photos\/?/, '');
  if (!key) return notFound(c);

  const object = await c.env.PHOTOS.get(key);
  if (!object) return notFound(c, 'Photo not found');

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
});

visitPhotos.post('/:visitId/photos', async (c) => {
  const visitId = c.req.param('visitId');
  const visit = await c.env.DB.prepare('SELECT * FROM visits WHERE id = ?')
    .bind(visitId)
    .first<VisitRow>();

  if (!visit) return notFound(c, 'Visit not found');

  const countRow = await c.env.DB.prepare(
    'SELECT COUNT(*) AS count FROM visit_photos WHERE visit_id = ?',
  )
    .bind(visitId)
    .first<{ count: number }>();

  const currentCount = countRow?.count ?? 0;
  if (currentCount >= MAX_PHOTOS_PER_VISIT) {
    return badRequest(c, `Maximum ${MAX_PHOTOS_PER_VISIT} photos per visit`);
  }

  const form = await c.req.formData();
  const display = form.get('display');
  const thumb = form.get('thumb');

  if (!isUploadBlob(display) || !isUploadBlob(thumb)) {
    return badRequest(c, 'display and thumb files are required');
  }

  const photoId = newId();
  const basePath = `${visit.customer_id}/${visitId}/${photoId}`;
  const displayKey = `${basePath}.jpg`;
  const thumbKey = `${basePath}_thumb.jpg`;

  const displayBytes = new Uint8Array(await display.arrayBuffer());
  const thumbBytes = new Uint8Array(await thumb.arrayBuffer());

  await c.env.PHOTOS.put(displayKey, displayBytes, {
    httpMetadata: { contentType: display.type ?? 'image/jpeg' },
  });
  await c.env.PHOTOS.put(thumbKey, thumbBytes, {
    httpMetadata: { contentType: thumb.type ?? 'image/jpeg' },
  });

  const ts = nowIso();
  const sortOrder = currentCount;
  await c.env.DB.prepare(
    `INSERT INTO visit_photos (id, visit_id, path, thumb_path, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(photoId, visitId, displayKey, thumbKey, sortOrder, ts)
    .run();

  return c.json(
    {
      photo: {
        id: photoId,
        visitId,
        path: displayKey,
        thumbPath: thumbKey,
        sortOrder,
        createdAt: ts,
      },
    },
    201,
  );
});

export { photoServe, visitPhotos };
