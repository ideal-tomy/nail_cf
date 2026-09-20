# nail_cf — ネイルサロン顧客管理（Cloudflare 版）

正本: [docs/cf-rebuild/nail-実装PLAN.md](../docs/cf-rebuild/nail-実装PLAN.md)

Supabase / Vercel 版（[`nail_app/`](../nail_app/)）を Cloudflare 上で作り直した v1 です。

## 構成

```text
nail_cf/
  apps/web/        Vite + React（管理画面 SPA）
  workers/api/     Hono（/api/* + 静的アセット配信）
  migrations/      D1 SQL
  seed/            デモデータ SQL
  wrangler.toml
```

## 前提

- Node.js 20+
- Cloudflare アカウント（本番デプロイ時）
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)（`npm install` で同梱）

---

## ローカル開発

```bash
cd nail_cf
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

ブラウザ: http://localhost:8787

### デモ用ログイン

| 項目 | 初期値 |
| --- | --- |
| メール | `demo@example.com` |
| パスワード | `changeme` |

変更する場合は `.env.example` を `.dev.vars` にコピーして編集します（Git にコミットしない）。

```bash
copy .env.example .dev.vars
```

本番では `wrangler secret put DEMO_PASSWORD` 等で設定してください。`wrangler.toml` の `[vars]` は非秘密のデモ用初期値です。

### フロントのみホットリロード

別ターミナルで `npm run dev:web`（API は `wrangler dev` が 8787 で動いている必要あり）

---

## v1 受け入れチェックリスト（A10）

実機（iPhone）またはローカルで以下を確認:

- [ ] ログイン後、未ログインでは中身を見られない
- [ ] 顧客を登録し、来店と完成写真を保存できる
- [ ] 顧客詳細で過去デザインと画像を見渡せる
- [ ] 連絡周期を満たす人がホームに経過日数順・写真付きで並ぶ
- [ ] 文面を編集し LINE 共有（またはコピー）できる
- [ ] 「連絡済み」でホームの推奨から外れる
- [ ] 今日の予約がホームに出る
- [ ] 予約タブで週帯・日リスト・追加編集ができる
- [ ] ホーム画面に追加して standalone で開ける（PWA）
- [ ] 旧 Supabase に依存しない

---

## Cloudflare 本番セットアップ（初回のみ）

### 1. ログイン

```bash
npx wrangler login
```

### 2. D1 データベース

```bash
npx wrangler d1 create nail-db
```

出力された `database_id` を [`wrangler.toml`](wrangler.toml) の `[[d1_databases]]` → `database_id` に貼り付ける。

### 3. R2 バケット

```bash
npx wrangler r2 bucket create nail-photos
```

### 4. マイグレーション + デモ seed（本番 D1）

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

### 5. 秘密情報（本番）

**エージェントに実行させない。** `secret put` は標準入力待ちのため、チャットが止まって見える。自分の PowerShell で行う。

値を引数に付けると失敗する（`Unknown argument`）。

```powershell
# NG: npx wrangler secret put SESSION_SECRET ここに値
# OK: プロンプトに値を貼る（入力は画面に出ない）
npx wrangler secret put SESSION_SECRET
npx wrangler secret put DEMO_PASSWORD
# DEMO_EMAIL も変える場合
npx wrangler secret put DEMO_EMAIL
```

Worker がまだ無い場合、`secret put` が「新しい Worker を作るか」と聞いて止まる。先に `npm run deploy` するか、Dashboard → Workers → Variables から入れる。

### 6. デプロイ

```bash
npm run deploy
```

Workers の URL（例: `https://nail-cf.<account>.workers.dev`）でアプリ全体（API + SPA）が動きます。

独自ドメインは Cloudflare Dashboard → Workers → nail-cf → Settings → Domains から追加。

---

## 実装フェーズ

| Phase | 内容 | 状態 |
| --- | --- | --- |
| 0 | 器 | 完了 |
| 1 | 顧客・来店・写真 | 完了 |
| 2 | ホーム連絡推奨・文面 | 完了 |
| 3 | 予約・PWA | 完了 |
| 4 | 空状態・トースト・デモログイン・README | 完了 |

---

## Cursor エージェントが止まったとき

実装依頼中に Cursor エージェントが動かなく見える場合は、ワークスペース共通の **[docs/cursor-agent-運用.md](../docs/cursor-agent-運用.md)**（再発防止チェックリスト・症状別対処）を参照。

---

## よくあるつまずき

| 症状 | 対処 |
| --- | --- |
| ログインできない | `.dev.vars` の DEMO_EMAIL / DEMO_PASSWORD を確認 |
| API が 401 | ログインし直す。Cookie がブロックされていないか確認 |
| `database: 未接続` | `npm run db:migrate:local` を実行してから `wrangler dev` を再起動 |
| 本番 deploy で D1 エラー | `database_id` が placeholder のまま → `wrangler d1 create` の id を反映 |
| ホームに今日の予定が出ない | seed の日付は 2026-09-19 想定。`npm run db:seed:local` で再投入 |
| Vite だけ起動して API が 404 | `npm run dev`（build + wrangler）を使う |

---

## 旧環境との関係

- データ参考: [`backup/nail/`](../backup/nail/)
- UI 参考: [`nail_app/`](../nail_app/)
- **旧 Supabase / Vercel の停止**は、新 v1 受け入れ完了後（[00-正本.md](../docs/cf-rebuild/00-正本.md)）。kuruma とタイミングを揃えても、nail 単体で止めてもよい

---

## 次のステップ（kuruma）

nail v1 受け入れ後、[kuruma 実装 PLAN](../docs/cf-rebuild/kuruma-実装PLAN.md) に従い `kuruma_cf/` へ進みます。

Agent test
