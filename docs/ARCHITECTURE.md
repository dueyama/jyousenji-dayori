# アーキテクチャ

## 全体像

```text
Markdown・画像
  ↓
Astro 静的ビルド
  ↓
GitHub Actions
  ↓
GitHub Pages
  ↓
OneSignal Web Push（購読管理・明示指示時のみ通知配信）
```

## コンテンツ

`src/content.config.ts` でお知らせと行事のContent Collectionsを定義します。Markdown frontmatter の日時は日本標準時 `+09:00` を必須にしています。

公開一覧、RSS、サイトマップ、詳細ページは `draft: false` の記事だけを対象にします。

## URLとbase path

`astro.config.mjs` は GitHub Actions 上の `GITHUB_REPOSITORY` から GitHub Pages の `site` と `base` を推定します。リンク生成は `src/lib/urls.ts` の `withBasePath()` を通し、ユーザー／Organizationサイトとプロジェクトサイトの両方で壊れないようにします。

## PWA

初期版では独自のオフラインキャッシュ用Service Workerを追加しません。Service WorkerファイルはOneSignal用の `public/OneSignalSDKWorker.js` と `public/OneSignalSDKUpdaterWorker.js` だけです。

`public/manifest.webmanifest` は相対 `start_url` と `scope` を使い、GitHub Pages のbase path配下でも同じファイルで動作します。

## 通知

OneSignal App ID が設定されている場合だけSDKを読み込みます。通知の許可要求は利用者のボタン操作後に限定します。通知送信は実装していません。
通知送信は公開サイトやGitHub Actionsからは行わず、Codexが明示指示を受けた場合だけローカルの `notification:send` コマンドからOneSignal REST APIへ送信します。
