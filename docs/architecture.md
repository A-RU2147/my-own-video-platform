# アーキテクチャ

## ファイル構成

```
my-own-video-platform/
├── app/
│   ├── layout.tsx                      # グローバルレイアウト
│   ├── page.tsx                        # ホームページ（HomeClient をレンダリング）
│   ├── login/
│   │   └── page.tsx                    # ログインページ
│   ├── videos/
│   │   └── [id]/
│   │       └── page.tsx                # 動画詳細（YouTube埋め込み）
│   └── api/
│       ├── auth/[...all]/route.ts      # Better Auth ハンドラー
│       ├── videos/route.ts             # GET（一覧）/ POST（追加）
│       ├── videos/[id]/route.ts        # GET（詳細）/ DELETE（削除）
│       └── tags/route.ts               # GET（一覧）/ POST（追加）
├── components/
│   ├── HomeClient.tsx                  # クライアント側メインUI
│   ├── VideoCard.tsx                   # サムネイルカード
│   ├── VideoGrid.tsx                   # グリッドレイアウト
│   ├── AddVideoForm.tsx                # URL入力 + タグ選択フォーム
│   ├── TagFilter.tsx                   # タグ絞り込みボタン
│   └── YouTubeEmbed.tsx               # iframeプレーヤー
├── db/
│   ├── schema.ts                       # アプリ用テーブル定義
│   ├── auth-schema.ts                  # Better Auth テーブル（自動生成）
│   └── index.ts                        # Drizzle + Turso クライアント
├── lib/
│   ├── auth.ts                         # Better Auth サーバー設定
│   ├── auth-client.ts                  # Better Auth クライアント（React）
│   └── youtube.ts                      # oEmbed 取得ユーティリティ
├── drizzle/                            # マイグレーションSQL（自動生成）
├── docs/                               # このフォルダ
├── middleware.ts                       # 認証ミドルウェア（未ログインで /login へ）
├── drizzle.config.ts
├── next.config.ts
└── .env.local                          # 環境変数（要作成）
```

## データベーススキーマ

### アプリ用テーブル (`db/schema.ts`)

| テーブル | カラム | 説明 |
|---|---|---|
| `videos` | id, youtube_id, title, thumbnail_url, created_at | 登録した動画 |
| `tags` | id, name | タグ一覧 |
| `video_tags` | video_id, tag_id | 動画とタグの中間テーブル |

### Better Auth テーブル (`db/auth-schema.ts`)

`user` / `session` / `account` / `verification` — Better Auth CLI で自動生成。

## API エンドポイント

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/videos` | 不要 | 動画一覧（`?tag=名前` でフィルター） |
| POST | `/api/videos` | 必要 | 動画追加（URLとタグIDを受け取る） |
| GET | `/api/videos/[id]` | 不要 | 動画詳細 |
| DELETE | `/api/videos/[id]` | 必要 | 動画削除 |
| GET | `/api/tags` | 不要 | タグ一覧 |
| POST | `/api/tags` | 必要 | タグ追加 |
| * | `/api/auth/*` | — | Better Auth が自動処理 |

## 認証フロー

```
アクセス
  └─ middleware.ts でセッション確認
       ├─ 未ログイン → /login へリダイレクト
       └─ ログイン済み → そのまま通過

/login ページ
  └─ authClient.signIn.email() → Cookie にセッション保存 → / へリダイレクト
```
