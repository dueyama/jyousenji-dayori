# OneSignal設定

## 方針

- OneSignalはWeb Pushの購読管理と配信だけに使います。
- OneSignal Web SDK v16を読み込みます。
- `PUBLIC_ONESIGNAL_APP_ID` が未設定なら通知UIだけ無効化します。
- REST APIによる自動通知、送信用キー、GitHub Secrets は使いません。
- External ID、氏名、メールアドレス、電話番号、住所、位置情報、個人を識別するタグは送りません。

## Service Worker

`public/OneSignalSDKWorker.js` は配備後に次のように取得できる必要があります。

```text
https://ACCOUNT.github.io/REPOSITORY/OneSignalSDKWorker.js
```

ユーザー／Organizationサイトの場合は次の形式です。

```text
https://ACCOUNT.github.io/OneSignalSDKWorker.js
```

GitHub Pages の project site では base path があるため、初期化時に `serviceWorkerPath` と `serviceWorkerParam.scope` を `import.meta.env.BASE_URL` から設定します。

## 利用者への許可要求

ページ読み込み直後には通知許可を求めません。利用者が通知ページで説明を読み、「通知を受け取る」を押したときだけブラウザーの許可画面を出します。

iPhone／iPadでは、Safariでホーム画面に追加し、そのアイコンから開いてから通知を許可してもらいます。

## 手動通知

公開済み記事の通知文面は次で確認します。

```bash
npm run notification:preview -- <content-id>
```

このコマンドはネットワーク送信を行いません。OneSignal管理画面へタイトル、本文、URLをコピーし、人間が対象と内容を確認して送信します。
