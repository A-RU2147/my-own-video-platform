# セットアップ手順

## 前提条件

- Node.js 18以上
- Turso CLI
- Vercel アカウント（本番デプロイ時）

---

## ローカル開発

### 1. Turso CLI インストール＆ログイン

```bash
brew install tursodatabase/tap/turso
turso auth login
```

### 2. データベース作成＆認証情報の取得

```bash
# DB作成
turso db create my-video-library

# 接続URLを確認
turso db show my-video-library

# 認証トークンを発行
turso db tokens create my-video-library
```

### 3. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```env
TURSO_DATABASE_URL=libsql://my-video-library-xxxxx.turso.io
TURSO_AUTH_TOKEN=<取得したトークン>
BETTER_AUTH_SECRET=<openssl rand -base64 32 で生成>
BETTER_AUTH_URL=http://localhost:3000
```

### 4. マイグレーション実行

```bash
npx drizzle-kit migrate
```

### 5. 初回アカウント作成

サーバー起動後に一度だけ実行：

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword","name":"Your Name"}'
```

### 6. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` にアクセス → `/login` にリダイレクト → ログイン。

---

## Vercel デプロイ

1. GitHub にプッシュして Vercel でインポート
2. Vercel Dashboard → Settings → Environment Variables に以下を設定：

| 変数名 | 値 |
|---|---|
| `TURSO_DATABASE_URL` | TursoのDB URL |
| `TURSO_AUTH_TOKEN` | Tursoのトークン |
| `BETTER_AUTH_SECRET` | ローカルと同じ値 |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` |

3. デプロイ後、本番URLで同様に `sign-up/email` を叩いてアカウント作成。

---

## DBスキーマを変更したいとき

```bash
# 変更後にマイグレーションファイルを生成
npx drizzle-kit generate

# Tursoに適用
npx drizzle-kit migrate
```
