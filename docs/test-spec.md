# ユニットテスト仕様書

## テスト方針

### 対象スコープ
外部依存（DB・ネットワーク・認証）をモックして、**各関数・ハンドラーのロジック**のみを検証する。

### 対象外
- UIコンポーネント（VideoCard, AddVideoForm など）
- E2Eフロー（ログイン〜動画追加の一連の流れ）
- Drizzle ORM / Turso の接続自体

### テストフレームワーク
**Vitest** を使用（ESMとTypeScriptの相性が良く、Next.js環境と親和性が高い）

---

## テスト対象ファイルと優先度

| ファイル | 優先度 | 理由 |
|---|---|---|
| `lib/youtube.ts` | 🔴 高 | 純粋関数。外部URL形式の網羅が必須 |
| `middleware.ts` | 🔴 高 | 認証の入口。バグがあると全ページに影響 |
| `app/api/videos/route.ts` | 🔴 高 | メインCRUD。認証・バリデーション分岐が多い |
| `app/api/videos/[id]/route.ts` | 🟡 中 | 404・認証チェックのみ確認 |
| `app/api/tags/route.ts` | 🟡 中 | videosと構造が似ており確認ポイントが少ない |

---

## 1. `lib/youtube.ts`

### `extractYouTubeId(url)`

外部依存なし。入力パターンの網羅が主な目的。

| # | テストケース | 入力 | 期待値 |
|---|---|---|---|
| 1 | 通常URL | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | `"dQw4w9WgXcQ"` |
| 2 | 通常URL（クエリパラメータ付き） | `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s` | `"dQw4w9WgXcQ"` |
| 3 | 短縮URL（youtu.be） | `https://youtu.be/dQw4w9WgXcQ` | `"dQw4w9WgXcQ"` |
| 4 | 短縮URL（クエリパラメータ付き） | `https://youtu.be/dQw4w9WgXcQ?t=30` | `"dQw4w9WgXcQ"` |
| 5 | 埋め込みURL（embed） | `https://www.youtube.com/embed/dQw4w9WgXcQ` | `"dQw4w9WgXcQ"` |
| 6 | ショートURL | `https://www.youtube.com/shorts/dQw4w9WgXcQ` | `"dQw4w9WgXcQ"` |
| 7 | 無効なURL | `https://example.com/video` | `null` |
| 8 | YouTube URLだがIDなし | `https://www.youtube.com/watch` | `null` |
| 9 | 空文字 | `""` | `null` |
| 10 | IDが11文字未満 | `https://youtu.be/abc` | `null` |

---

### `fetchYouTubeInfo(youtubeId)`

`fetch` をモックして検証する。

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | 正常取得 | `fetch` が `{ title: "テスト動画" }` を返す | `{ title: "テスト動画", thumbnailUrl: "https://i.ytimg.com/vi/abc123/hqdefault.jpg" }` |
| 2 | oEmbed が 404 を返す | `fetch` が `ok: false` を返す | `Error` をスロー |
| 3 | サムネイルURLの組み立て | 任意の youtubeId を渡す | `thumbnailUrl` が `https://i.ytimg.com/vi/{youtubeId}/hqdefault.jpg` になっている |

---

## 2. `middleware.ts`

`auth.api.getSession` をモックし、リダイレクト有無を検証する。

| # | テストケース | セッション | パス | 期待値 |
|---|---|---|---|---|
| 1 | ログイン済みでホームアクセス | あり | `/` | `NextResponse.next()` |
| 2 | 未ログインでホームアクセス | なし | `/` | `/login` へリダイレクト |
| 3 | `/login` は認証スキップ | なし | `/login` | `NextResponse.next()` |
| 4 | `/api/auth/*` は認証スキップ | なし | `/api/auth/sign-in/email` | `NextResponse.next()` |
| 5 | `/_next/*` は認証スキップ | なし | `/_next/static/chunk.js` | `NextResponse.next()` |
| 6 | `/favicon.ico` は認証スキップ | なし | `/favicon.ico` | `NextResponse.next()` |
| 7 | 未ログインで動画詳細アクセス | なし | `/videos/1` | `/login` へリダイレクト |
| 8 | 未ログインでAPI直打ち | なし | `/api/videos` | `/login` へリダイレクト |

---

## 3. `app/api/videos/route.ts`

`db` と `auth.api.getSession` と `fetchYouTubeInfo` をモックする。

### `GET /api/videos`

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | 動画一覧取得（タグなし） | db が2件返す | ステータス200、配列2件 |
| 2 | 存在するタグで絞り込み | db がタグと紐づく動画1件を返す | ステータス200、配列1件 |
| 3 | 存在しないタグで絞り込み | db がタグを返さない | ステータス200、空配列 `[]` |
| 4 | タグはあるが紐づき動画なし | db がタグを返すが video_tags が空 | ステータス200、空配列 `[]` |
| 5 | 各動画に tags 配列が付いている | db が動画+タグを返す | レスポンスに `tags: [...]` が含まれる |

### `POST /api/videos`

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | 未認証でリクエスト | `getSession` が null を返す | ステータス401、`{ error: "Unauthorized" }` |
| 2 | 無効なURL | 認証あり、不正なURLを渡す | ステータス400、`{ error: "Invalid YouTube URL" }` |
| 3 | oEmbed 取得失敗 | 認証あり、`fetchYouTubeInfo` がエラー | ステータス400、`{ error: "Failed to fetch video info" }` |
| 4 | 正常登録 | 認証あり、DB insert が動画を返す | ステータス201、登録した動画オブジェクト |
| 5 | 重複登録 | 認証あり、DB insert が `undefined`（onConflictDoNothing） | ステータス409、`{ error: "Video already exists" }` |
| 6 | tagIds 付きで登録 | 認証あり、tagIds に値あり | `db.insert(videoTags)` が呼ばれる |
| 7 | tagIds なしで登録 | 認証あり、tagIds 省略 | `db.insert(videoTags)` が呼ばれない |

---

## 4. `app/api/videos/[id]/route.ts`

### `GET /api/videos/[id]`

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | 存在する動画を取得 | db が動画を返す | ステータス200、`{ ...video, tags: [...] }` |
| 2 | 存在しない動画を取得 | db が `undefined` を返す | ステータス404、`{ error: "Not found" }` |
| 3 | タグなし動画の取得 | タグの紐づきなし | レスポンスに `tags: []` が含まれる |

### `DELETE /api/videos/[id]`

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | 未認証で削除リクエスト | `getSession` が null を返す | ステータス401 |
| 2 | 認証済みで削除 | 認証あり、db.delete が成功 | ステータス204、ボディなし |

---

## 5. `app/api/tags/route.ts`

### `GET /api/tags`

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | タグ一覧取得 | db が3件返す | ステータス200、配列3件 |
| 2 | タグなし | db が空配列を返す | ステータス200、空配列 |

### `POST /api/tags`

| # | テストケース | モック設定 | 期待値 |
|---|---|---|---|
| 1 | 未認証でリクエスト | `getSession` が null を返す | ステータス401 |
| 2 | 空文字のタグ名 | 認証あり、`name: ""` を渡す | ステータス400、`{ error: "Name is required" }` |
| 3 | スペースのみのタグ名 | 認証あり、`name: "  "` を渡す | ステータス400 |
| 4 | 正常登録 | 認証あり、db insert がタグを返す | ステータス201、タグオブジェクト |
| 5 | 重複タグ名 | 認証あり、db insert が `undefined` | ステータス409、`{ error: "Tag already exists" }` |
| 6 | 前後スペースのトリム | 認証あり、`name: " tech "` を渡す | DB には `"tech"` で保存される |

---

## モック設計

### `vi.mock` の対象

```
@/db          → db.query.*, db.insert(), db.delete() をすべてモック
@/lib/auth    → auth.api.getSession をモック
@/lib/youtube → fetchYouTubeInfo をモック（extractYouTubeId は実装をそのまま使う）
```

### 共通ヘルパー

```ts
// テスト用の認証済みリクエストを作るヘルパー
function makeRequest(url: string, options?: RequestInit): NextRequest

// セッションありのモック
vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } })

// セッションなしのモック
vi.mocked(auth.api.getSession).mockResolvedValue(null)
```

---

## テストファイル配置

```
__tests__/
├── lib/
│   └── youtube.test.ts
├── middleware.test.ts
└── api/
    ├── videos.test.ts
    ├── videos-id.test.ts
    └── tags.test.ts
```
