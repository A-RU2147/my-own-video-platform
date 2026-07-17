# My Video Library — プロジェクト概要

個人用のYouTube動画キュレーションサイト。URLを貼るだけで動画情報を自動取得し、タグで整理できる。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) |
| データベース | Turso (LibSQL / cloud SQLite) |
| ORM | Drizzle ORM |
| 認証 | Better Auth (メール/パスワード) |
| スタイル | Tailwind CSS |
| データ取得 | SWR |
| デプロイ | Vercel |

## 主な機能

- YouTube URLを貼るだけでタイトル・サムネイルを自動取得（oEmbed API使用、APIキー不要）
- タグで動画を分類・絞り込み
- カードグリッドレイアウト
- 動画詳細ページにYouTube埋め込みプレーヤー
- Better Auth によるメール/パスワード認証（個人利用のみ）

## 対象ユーザー

自分だけ（個人ツール）。アカウント登録は初回のみCLI/curl経由で行う。
