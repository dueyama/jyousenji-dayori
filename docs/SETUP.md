# セットアップ

## 前提

- Node.js 22以上
- npm
- GitHub Pages の公開元は GitHub Actions

## 初回セットアップ

```bash
npm ci
npm run generate:icons
npm run build
```

## GitHub Pages URL

GitHub Pages では次のどちらにも対応します。

- ユーザー／Organizationサイト: `https://ACCOUNT.github.io/`
- プロジェクトサイト: `https://ACCOUNT.github.io/REPOSITORY/`

GitHub Actions 上では `GITHUB_REPOSITORY` から `site` と `base` を推定します。最終URLを固定したい場合は、Repository Variables に次を設定します。

```text
PUBLIC_SITE_URL=https://ACCOUNT.github.io/REPOSITORY/
PUBLIC_BASE_PATH=/REPOSITORY/
```

ユーザー／Organizationサイトの場合、`PUBLIC_BASE_PATH=/` とします。

このリポジトリ `dueyama/jyousenji-dayori` のGitHub Pages公開URLは次です。

```text
https://dueyama.github.io/jyousenji-dayori/
```

Actions上では自動推定できますが、明示する場合はRepository Variablesに次を設定します。

```text
PUBLIC_SITE_URL=https://dueyama.github.io
PUBLIC_BASE_PATH=/jyousenji-dayori/
PUBLIC_ONESIGNAL_APP_ID=777c076c-c65b-4695-8058-28e2476c85e9
```

## 寺院固有設定

未設定の値は画面に表示しません。公式LINEは既定の案内URLを使い、差し替える場合だけ `PUBLIC_LINE_URL` を設定します。必要に応じて Repository Variables またはローカル `.env` に設定します。

```text
PUBLIC_GOOGLE_SITES_URL=
PUBLIC_LINE_URL=
PUBLIC_TEMPLE_ADDRESS=
PUBLIC_MAP_URL=
PUBLIC_TEMPLE_PHONE=
PUBLIC_ONESIGNAL_APP_ID=
JYOUSENJI_ONESIGNAL_APP_ID=
JYOUSENJI_ONESIGNAL_REST_API_KEY=
JYOUSENJI_ONESIGNAL_INCLUDED_SEGMENTS=Total Subscriptions
```

`PUBLIC_ONESIGNAL_APP_ID` が空でもサイト本体は動作します。
