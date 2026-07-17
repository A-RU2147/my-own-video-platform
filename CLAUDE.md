@AGENTS.md

# プロジェクトルール

## 作業前に必ず行うこと

実装・テストを始める前に、以下のドキュメントを必ず読んで内容を把握してから着手する。

| ドキュメント | 確認する目的 |
|---|---|
| `docs/overview.md` | プロジェクトの目的・技術スタックの確認 |
| `docs/architecture.md` | ファイル構成・APIエンドポイント・DBスキーマの確認 |
| `docs/tasks.md` | 何が完了済みで何が残っているかの確認 |
| `docs/test-spec.md` | テスト対象・ケース・期待値の確認（テスト実装時は必須） |

## 実装完了時に必ず行うこと

タスクが完了したら、**実装完了後すぐに** `docs/tasks.md` を更新する。

- 完了したタスクの `[ ]` を `[x]` に変更する
- 実装の結果として新たに判明した残タスクや改善点があれば「残タスク」「今後の改善アイデア」に追記する
- まとめて後で更新するのは禁止。1タスク完了ごとに更新する

## Next.js 開発ルール

### proxy.ts / middleware.ts を変更した場合

- 変更後は必ず dev server を再起動する
- 再起動前にポート 3000 に古いプロセスが残っていないか確認する
  ```
  lsof -i :3000
  kill <PID>
  npm run dev
  ```

### 修正後の動作確認（必須）

proxy.ts・認証・ルーティング・API を変更したら、以下を curl で確認する：

```bash
curl -sI http://localhost:3000/        # 未ログイン → 307 /login が正常
curl -sI http://localhost:3000/login   # 200 が正常
curl -sI http://localhost:3000/admin
curl -sI http://localhost:3000/my
curl -sI http://localhost:3000/api/courses
```

問題が発生したら **curl でHTTPステータスを確認してからコードを修正する**（推測で修正しない）。

### proxy.ts の実装ルール（Next.js 16）

- proxy 内では DB アクセス禁止（`auth.api.getSession()` など）
- セッション確認はクッキーの存在チェックのみ行う（オプティミスティックチェック）
- 完全なセッション検証は各ページ・API ルートハンドラーで行う

```ts
// ✅ 正しい実装
const sessionCookie = request.cookies.get("better-auth.session_token");
if (!sessionCookie?.value) redirect("/login");

// ❌ 禁止（DBアクセスが発生する）
const session = await auth.api.getSession({ headers: request.headers });
```

## テストに関するルール

### 絶対に禁止すること

- **テストを通すためにテスト仕様・テストコードを変更してはならない**
  - `docs/test-spec.md` に記載されたテストケース・期待値・対象スコープは変更禁止
  - テストファイル（`__tests__/**`）のアサーションや期待値を緩めることも禁止
  - `vi.mock` の対象を減らしてテストを通しやすくすることも禁止

- テストが失敗したら、**実装側（`app/`, `lib/`, `middleware.ts` など）を修正して対応する**

### テスト仕様を変更してよい唯一の条件

ユーザーが明示的に「仕様を変更する」と指示した場合のみ。
その場合は `docs/test-spec.md` と `CLAUDE.md` を同時に更新し、変更理由をコメントで残す。
