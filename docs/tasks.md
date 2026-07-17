# タスク進捗

## 完了済み ✅

### フェーズ1: プロジェクト基盤
- [x] Next.js 15 プロジェクト初期化（TypeScript / Tailwind / App Router）
- [x] Drizzle ORM + Turso (@libsql/client) インストール
- [x] SWR インストール

### フェーズ2: データベース
- [x] `db/schema.ts` — videos / tags / video_tags テーブル定義
- [x] `db/index.ts` — Drizzle + Turso クライアント
- [x] `drizzle.config.ts` — マイグレーション設定
- [x] マイグレーションファイル生成（`drizzle/0000_tricky_epoch.sql`）

### フェーズ3: バックエンド
- [x] `lib/youtube.ts` — YouTube ID 抽出 + oEmbed 取得
- [x] `app/api/videos/route.ts` — GET（一覧）/ POST（追加）
- [x] `app/api/videos/[id]/route.ts` — GET（詳細）/ DELETE
- [x] `app/api/tags/route.ts` — GET（一覧）/ POST（追加）

### フェーズ4: UI
- [x] `components/VideoCard.tsx`
- [x] `components/AddVideoForm.tsx`
- [x] `components/TagFilter.tsx`
- [x] `components/YouTubeEmbed.tsx`
- [x] `components/HomeClient.tsx`
- [x] `app/page.tsx` — ホームページ
- [x] `app/videos/[id]/page.tsx` — 動画詳細ページ
- [x] `next.config.ts` — YouTube サムネイルドメイン許可

### フェーズ6: ユニットテスト
- [x] Vitest + vite-tsconfig-paths インストール
- [x] `vitest.config.ts` 設定
- [x] `__tests__/lib/youtube.test.ts` — 13ケース
- [x] `__tests__/middleware.test.ts` — 8ケース
- [x] `__tests__/api/videos.test.ts` — 12ケース
- [x] `__tests__/api/videos-id.test.ts` — 5ケース
- [x] `__tests__/api/tags.test.ts` — 8ケース
- [x] 全46テストパス確認

### フェーズ5: 認証（Better Auth）
- [x] `better-auth` インストール
- [x] `lib/auth.ts` — Better Auth サーバー設定
- [x] `lib/auth-client.ts` — React クライアント
- [x] `db/auth-schema.ts` — 認証テーブル（CLI自動生成）
- [x] `app/api/auth/[...all]/route.ts` — 認証エンドポイント
- [x] `middleware.ts` — 未ログイン時リダイレクト
- [x] `app/login/page.tsx` — ログインページ
- [x] API の POST/DELETE に認証チェック追加
- [x] ヘッダーにログアウトボタン追加
- [x] マイグレーションファイル生成（`drizzle/0001_elite_tana_nile.sql`）

---

## 残タスク

### 環境構築（ユーザー作業）
- [ ] Turso CLI インストール＆ログイン
- [ ] Turso DB 作成 + 認証情報取得
- [ ] `.env.local` 作成・設定
- [ ] `npx drizzle-kit migrate` 実行
- [ ] 初回アカウント作成（curl）
- [ ] 動作確認

### 今後の改善アイデア（未着手）
- [ ] 動画へのメモ/ノート機能
- [ ] 視聴済みフラグ
- [ ] お気に入り/評価機能
- [ ] タグ削除・リネーム
- [ ] 動画の並び替え（タイトル順、追加順）
- [ ] 検索機能
- [ ] Vercel デプロイ
