-- nail_cf v1 schema
-- 正本: docs/cf-rebuild/nail-実装PLAN.md B2

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kana TEXT,
  phone TEXT,
  line_name TEXT,
  birthday TEXT,
  preference TEXT,
  note TEXT,
  contact_interval_days INTEGER NOT NULL DEFAULT 28 CHECK (contact_interval_days BETWEEN 7 AND 365),
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS customers_name_idx ON customers (name);
CREATE INDEX IF NOT EXISTS customers_archived_idx ON customers (archived);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  menu TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'done', 'canceled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS bookings_starts_idx ON bookings (starts_at);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings (customer_id, starts_at DESC);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  visited_on TEXT NOT NULL,
  menu TEXT,
  design TEXT,
  note TEXT,
  price INTEGER CHECK (price IS NULL OR price >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS visits_booking_uniq ON visits (booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS visits_customer_date_idx ON visits (customer_id, visited_on DESC);

CREATE TABLE IF NOT EXISTS visit_photos (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  thumb_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS visit_photos_visit_idx ON visit_photos (visit_id, sort_order);

CREATE TABLE IF NOT EXISTS contact_logs (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sent_at TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'line_share',
  template_key TEXT,
  body TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS contact_logs_customer_idx ON contact_logs (customer_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 連絡推奨判定用（VIEW CSV は投入しない。ここで再計算）
CREATE VIEW IF NOT EXISTS customer_status AS
SELECT
  c.id,
  c.name,
  c.contact_interval_days,
  v.last_visit,
  CASE
    WHEN v.last_visit IS NULL THEN NULL
    ELSE CAST(julianday(date('now')) - julianday(v.last_visit) AS INTEGER)
  END AS days_since,
  cl.last_contact
FROM customers c
LEFT JOIN (
  SELECT customer_id, MAX(visited_on) AS last_visit
  FROM visits
  GROUP BY customer_id
) v ON v.customer_id = c.id
LEFT JOIN (
  SELECT customer_id, MAX(sent_at) AS last_contact
  FROM contact_logs
  GROUP BY customer_id
) cl ON cl.customer_id = c.id
WHERE c.archived = 0;

-- 文面ひな形（初期3件）
INSERT OR IGNORE INTO message_templates (id, title, body, sort_order) VALUES
  ('tpl-soon', 'そろそろ', '{name}さん、こんにちは。
前回の{last_design}から{days}日ほど経ちました。そろそろお直しのタイミングかと思います。
ご都合のよい日はありますか？', 1),
  ('tpl-longtime', '久しぶり', '{name}さん、こんにちは。
しばらくお会いできていませんが、その後お変わりないですか。
またご来店お待ちしています。', 2),
  ('tpl-slot', '空き枠', '{name}さん、こんにちは。
今週末に空きが出ました。もしご都合が合えばいかがですか。', 3);
