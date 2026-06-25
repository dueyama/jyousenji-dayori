# OneSignal設定

## 方針

- OneSignalはWeb Pushの購読管理と配信だけに使います。
- OneSignal Web SDK v16を読み込みます。
- `PUBLIC_ONESIGNAL_APP_ID` が未設定なら通知UIだけ無効化します。
- 通知送信はサイト公開と分離し、Codexが明示指示を受けた場合だけローカルコマンドで行います。
- 送信用キーはローカル `.env` にだけ置き、GitHub Secrets には置きません。
- External ID、氏名、メールアドレス、電話番号、住所、位置情報、個人を識別するタグは送りません。

## Service Worker

`public/OneSignalSDKWorker.js` と `public/OneSignalSDKUpdaterWorker.js` は配備後に次のように取得できる必要があります。

```text
https://ACCOUNT.github.io/REPOSITORY/OneSignalSDKWorker.js
https://ACCOUNT.github.io/REPOSITORY/OneSignalSDKUpdaterWorker.js
```

ユーザー／Organizationサイトの場合は次の形式です。

```text
https://ACCOUNT.github.io/OneSignalSDKWorker.js
https://ACCOUNT.github.io/OneSignalSDKUpdaterWorker.js
```

GitHub Pages の project site では base path があるため、初期化時に `serviceWorkerPath` と `serviceWorkerParam.scope` を `import.meta.env.BASE_URL` から設定します。

OneSignal管理画面のWeb Configurationでは、GitHub Pagesのproject site向けに次を設定します。

```text
Site URL: https://dueyama.github.io
Path to service worker files: /jyousenji-dayori/
Main service worker filename: OneSignalSDKWorker.js
Updater service worker filename: OneSignalSDKUpdaterWorker.js
Service worker registration scope: /jyousenji-dayori/
```

Welcome Notification と Persistence は初期版では無効にします。通知送信は記事公開とは別に、明示指示時だけ行います。

## 利用者への許可要求

ページ読み込み直後には通知許可を求めません。利用者が通知ページで説明を読み、「通知を受け取る」を押したときだけブラウザーの許可画面を出します。

iPhone／iPadでは、Safariでホーム画面に追加し、そのアイコンから開いてから通知を許可してもらいます。

## 通知プレビュー

公開済み記事の通知文面は次で確認します。

```bash
npm run notification:preview -- <content-id>
```

このコマンドはネットワーク送信を行いません。

## Codexによる送信

ローカル `.env` に次を設定します。

```text
PUBLIC_SITE_URL=https://dueyama.github.io
PUBLIC_BASE_PATH=/jyousenji-dayori/
JYOUSENJI_ONESIGNAL_APP_ID=777c076c-c65b-4695-8058-28e2476c85e9
JYOUSENJI_ONESIGNAL_REST_API_KEY=
JYOUSENJI_ONESIGNAL_INCLUDED_SEGMENTS="Total Subscriptions"
```

送信前に必ずプレビューします。

```bash
npm run notification:preview -- <content-id>
```

送信する場合だけ `--apply` を付けます。

```bash
npm run notification:send -- <content-id> --apply
```

同じcontent-idの再送は誤送信防止のため失敗します。再送が必要な場合だけ `--force` を付けます。

```bash
npm run notification:send -- <content-id> --apply --force
```

送信記録は公開リポジトリ外の `private/notification-log.json` に保存します。
