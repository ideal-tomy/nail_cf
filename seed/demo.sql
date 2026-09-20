-- Demo seed for Phase 1–2
-- Source: backup/nail/*.csv (personas only)
-- Phase 2: 田中=将来予約あり / 鈴木=直近14日以内に連絡済み → ホームから除外

DELETE FROM visit_photos;
DELETE FROM visits;
DELETE FROM contact_logs;
DELETE FROM bookings;
DELETE FROM customers;

INSERT INTO customers (
  id, name, name_kana, phone, line_name, birthday, preference, note,
  contact_interval_days, archived, created_at, updated_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', '山田 花子', NULL, 'LINE: はなこ', NULL, NULL, 'パステル・フラワー系が好き', '春は桜ネイルを提案しやすい', 28, 0, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('22222222-2222-2222-2222-222222222222', '佐藤 美咲', NULL, '090-xxxx', NULL, NULL, 'シンプル・オフィス向け', '長さは短め固定', 28, 0, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('33333333-3333-3333-3333-333333333333', '田中 ゆい', NULL, 'LINE: yui', NULL, NULL, 'キラキラ・パーツ多め', NULL, 28, 0, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('44444444-4444-4444-4444-444444444444', '鈴木 あかり', NULL, '公式LINE', NULL, NULL, 'ベージュ・ヌーディ', '連絡済みパターンの確認用', 28, 0, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('55555555-5555-5555-5555-555555555555', '伊藤 さくら', NULL, 'LINE: sakura', NULL, NULL, '春カラー・フラワー', '新規ペルソナ', 28, 0, '2026-06-20T12:43:15.863Z', '2026-06-20T12:43:15.863Z');

INSERT INTO visits (
  id, customer_id, booking_id, visited_on, menu, design, note, price, created_at, updated_at
) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NULL, '2026-05-31', NULL, 'くすみピンクのワンカラー', 'カラー: OPI Barefoot', 7500, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', NULL, '2026-06-04', NULL, 'ナチュラルフレンチ', '短め・オフィス仕上げ', 6800, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', NULL, '2026-06-13', NULL, 'ミラーネイル＋パーツ', 'シルバー＋ストーン', 9800, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', NULL, '2026-06-02', NULL, 'ベージュグラデ', 'ヌーディトーン', 8200, '2026-06-20T12:35:13.796Z', '2026-06-20T12:35:13.796Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', NULL, '2026-05-29', NULL, '桜アート＋パール', '春限定デザイン', 9000, '2026-06-20T12:43:15.863Z', '2026-06-20T12:43:15.863Z');

INSERT INTO bookings (
  id, customer_id, starts_at, ends_at, menu, note, status, created_at, updated_at
) VALUES
  -- 2026-09-19 JST: 今日の予定デモ（10:00 / 14:00）
  ('home-book-001', '11111111-1111-1111-1111-111111111111', '2026-09-19T01:00:00.000Z', '2026-09-19T02:00:00.000Z', 'ジェルネイル', NULL, 'reserved', '2026-09-19T00:00:00.000Z', '2026-09-19T00:00:00.000Z'),
  ('home-book-002', '22222222-2222-2222-2222-222222222222', '2026-09-19T05:00:00.000Z', '2026-09-19T06:00:00.000Z', 'フレンチ', NULL, 'reserved', '2026-09-19T00:00:00.000Z', '2026-09-19T00:00:00.000Z'),
  -- 翌日
  ('home-book-003', '55555555-5555-5555-5555-555555555555', '2026-09-20T02:00:00.000Z', '2026-09-20T03:00:00.000Z', '春ネイル', NULL, 'reserved', '2026-09-19T00:00:00.000Z', '2026-09-19T00:00:00.000Z'),
  -- 将来予約（連絡推奨から除外）
  ('b81c49a0-5529-4414-bf80-d36781bba805', '33333333-3333-3333-3333-333333333333', '2026-09-25T01:00:00.000Z', '2026-09-25T02:00:00.000Z', NULL, NULL, 'reserved', '2026-09-09T22:15:16.965Z', '2026-09-09T22:15:16.965Z'),
  -- キャンセル済み（日表示用）
  ('a702ffb7-8eae-4fdc-88e3-be67f43fcfd0', '44444444-4444-4444-4444-444444444444', '2026-09-19T07:00:00.000Z', '2026-09-19T08:00:00.000Z', NULL, '日程都合', 'canceled', '2026-06-20T14:06:01.591Z', '2026-06-20T16:48:06.586Z');

INSERT INTO contact_logs (id, customer_id, sent_at, channel, template_key, body) VALUES
  ('df7a3ca7-249a-435d-ae91-6a751aacd290', '44444444-4444-4444-4444-444444444444', '2026-09-10T00:00:00.000Z', 'line_share', 'tpl-soon', 'あかりさん、こんにちは。前回のベージュグラデから…');

INSERT INTO visit_photos (id, visit_id, path, thumb_path, sort_order, created_at) VALUES
  ('7c34648f-b838-4a06-bc7d-615613904922', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'images/nail01.jpg', 'images/nail01.jpg', 0, '2026-06-20T12:43:15.863Z'),
  ('310cacf7-ba7f-4785-ba3e-be96522bc831', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'images/nail02.jpg', 'images/nail02.jpg', 0, '2026-06-20T12:43:15.863Z'),
  ('3080df53-ce4c-42ef-9f8a-0317a608888f', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'images/nail03.jpg', 'images/nail03.jpg', 0, '2026-06-20T12:43:15.863Z'),
  ('b5cfc436-3780-4a7e-a08b-d70439b05703', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'images/nail04.jpg', 'images/nail04.jpg', 0, '2026-06-20T12:43:15.863Z'),
  ('29989a7c-7e65-4bbd-803d-639dac5d403b', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'images/nail05.jpg', 'images/nail05.jpg', 0, '2026-06-20T12:43:15.863Z');
