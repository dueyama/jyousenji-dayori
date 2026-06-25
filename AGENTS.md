# AGENTS.md — 浄泉寺公式お知らせPWA

このファイルの指示はリポジトリ全体に適用する。下位ディレクトリに別の `AGENTS.md` がある場合は、その範囲では下位ファイルを優先する。

## 1. プロジェクトの目的

既存のGoogle Sitesは公式案内ページとして残し、本リポジトリでは、更新頻度の高い情報をスマートフォン向けに届ける「浄泉寺公式お知らせPWA」を開発・保守する。

利用者へ提供する主な内容は次のとおり。

- お知らせと写真
- 行事予定
- プッシュ通知の登録導線
- 既存Google Sitesへの導線
- 公式LINEへの導線
- iPhone／Androidのホーム画面追加手順

このPWAはApp StoreやGoogle Playを使わず、QRコードまたはURLから利用してもらう。

## 2. 採用する構成

初期版は次の構成に固定する。

```text
Codex
  └─ Markdown・画像・コードを編集
          ↓
GitHub repository
          ↓ GitHub Actions
GitHub Pages
  ├─ お知らせPWA
  ├─ 写真
  ├─ 行事予定
  └─ OneSignal Web SDK
          ↓
OneSignal
  └─ Web Pushの購読管理・通知配信
```

### 絶対条件

- 公開先は **GitHub Pages** とする。
- プッシュ通知は **OneSignal Web Push** を利用する。
- 通知送信は、サイト公開と分離し、利用者から明示指示がある場合のみCodexがローカルコマンドから送信できる。
- サイトの公開と通知送信を必ず分離する。
- 独自ドメインを前提にしない。
- 既存のGoogle Sitesは削除・自動編集しない。
- コンテンツ更新は、管理画面ではなくCodexがMarkdownと画像を編集する方式とする。

### 導入しないもの

利用者が明示的に方針変更を指示しない限り、次を導入してはならない。

- Vercel、Netlify、Cloudflare Pagesなど、GitHub Pages以外の公開基盤
- AWS、Firebase、Supabase、Upstash、Neonなどの外部バックエンド／ストレージ
- WordPress、CMS、データベース
- サーバーレスFunctions、PHP、常駐サーバー
- サイト公開や記事追加を契機にした無確認の自動通知
- 通知送信用GitHub Actions
- App Store／Google Play向けネイティブアプリ
- ユーザー登録、ログイン、コメント、課金、広告
- 問い合わせフォーム
- アクセス解析、広告トラッカー、不要なCookie

## 3. 技術方針

初期構築では次を採用する。

- Astroの静的出力
- TypeScript strict mode
- Astro Content Collections
- Markdownによる記事・行事管理
- npmと `package-lock.json`
- GitHub Actionsによる検査とGitHub Pages配備
- OneSignalの現行Web SDK
- Vanilla CSSと必要最小限のJavaScript／TypeScript
- システム標準の日本語フォント

React、Vue、Svelte、UIフレームワーク、ヘッドレスCMSは、明確な必要性がない限り追加しない。標準Web API、Astro標準機能、既存依存関係で実現できるなら、新しい依存関係を増やさない。

## 4. 最初に構築するもの

リポジトリが空、または未完成なら、次の順で最小動作版を作る。

1. Astroの静的サイトをリポジトリ直下に作成する。
2. GitHub Pagesのユーザー／Organizationサイトとプロジェクトサイトの両方に対応できるURL設定を作る。
3. お知らせ・行事のContent Collectionsとスキーマを作る。
4. ホーム、お知らせ一覧・詳細、行事一覧・詳細、通知案内、利用案内、プライバシーの各ページを作る。
5. Web App Manifest、アプリアイコン、ホーム画面追加案内を作る。
6. OneSignalをApp ID未設定でも安全に無効化できる形で組み込む。
7. GitHub Actionsで検査後にGitHub Pagesへ配備する。
8. 通知用のタイトル・本文・URLを生成するローカルコマンドと、明示指示時だけ送信するローカルコマンドを作る。
9. `README.md`、`docs/SETUP.md`、`docs/OPERATIONS.md`、`docs/ONESIGNAL.md` を作る。
10. サンプル記事は `draft: true` のものだけを置き、本番公開へ混入させない。

## 5. 推奨ディレクトリ構成

```text
.
├── AGENTS.md
├── README.md
├── astro.config.mjs
├── package.json
├── package-lock.json
├── src/
│   ├── assets/
│   │   ├── notices/
│   │   └── events/
│   ├── components/
│   ├── content/
│   │   ├── notices/
│   │   └── events/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── config/
│   │   └── site.ts
│   └── content.config.ts
├── public/
│   ├── icons/
│   ├── manifest.webmanifest
│   └── OneSignalSDKWorker.js
├── scripts/
│   ├── validate-content.mjs
│   └── notification-preview.mjs
├── docs/
│   ├── SETUP.md
│   ├── OPERATIONS.md
│   ├── ONESIGNAL.md
│   └── ARCHITECTURE.md
└── .github/workflows/
    ├── ci.yml
    └── deploy-pages.yml
```

構成を変更する場合は、必要性を説明し、関連文書も同時に更新する。

## 6. サイト固有設定

寺院固有の値は `src/config/site.ts` など一か所に集約する。

最低限、次を管理する。

- サイト名
- 短いサイト名
- 公開URL
- GitHub Pagesのbase path
- 既存Google SitesのURL
- 公式LINEのURL
- 寺院所在地
- 地図URL
- 電話番号を掲載する場合の値
- OneSignal App IDの参照方法
- テーマ色

不明な寺院情報、URL、住所、電話番号、行事日時を推測してはならない。未設定の項目は該当UIを非表示にするか、開発時だけ明確な警告を出す。本番画面に `TODO` やダミー情報を表示しない。

### URLの安定性

QRコード配布後にGitHubアカウント名、Organization名、リポジトリ名、公開パスを変更するとURLが変わる。初回公開前に最終URLを確認し、公開後は安易に変更しない。

可能なら、次の順でURLを選ぶ。

1. 浄泉寺専用のユーザー／Organizationサイト: `https://ACCOUNT.github.io/`
2. 既存アカウントのプロジェクトサイト: `https://ACCOUNT.github.io/REPOSITORY/`

どちらでも動くよう、URLを `/` で直書きせず、Astroの `site`、`base`、`import.meta.env.BASE_URL`、共通URL helperを利用する。

## 7. お知らせコンテンツ

お知らせは `src/content/notices/` にMarkdownとして保存する。ファイル名とslugは英小文字、数字、ハイフンのみを使い、公開後は変更しない。

例:

```yaml
---
id: "2026-08-01-obon-service"
title: "盂蘭盆会のお知らせ"
summary: "盂蘭盆会を執り行います。"
publishedAt: "2026-08-01T09:00:00+09:00"
updatedAt: null
category: "法要"
heroImage: "../../assets/notices/2026-08-01-obon-service.jpg"
heroAlt: "浄泉寺本堂の内陣"
draft: true
---
```

### お知らせの規則

- 日時はISO 8601で保存し、日本標準時 `+09:00` を明示する。
- `summary` は通知本文の候補にも使える、短く事実中心の文章にする。
- 写真がある場合は、事実に基づく代替テキストを必須とする。
- 人物名、撮影場所、状況を推測して代替テキストへ書かない。
- 必須情報が不足する記事は `draft: true` のままにする。
- 公開後の訂正では記事を削除せず、必要に応じて `updatedAt` と訂正内容を表示する。
- 誤字修正や画像差し替えを理由に通知を再送しない。

## 8. 行事コンテンツ

行事は `src/content/events/` にMarkdownとして保存する。

例:

```yaml
---
id: "2026-08-13-obon-service"
title: "盂蘭盆会"
summary: "本堂で盂蘭盆会を執り行います。"
startAt: "2026-08-13T14:00:00+09:00"
endAt: "2026-08-13T15:00:00+09:00"
allDay: false
location: "浄泉寺本堂"
status: "scheduled"
heroImage: null
heroAlt: null
draft: true
---
```

### 行事の規則

- `status` は少なくとも `scheduled`、`cancelled`、`postponed` を扱う。
- 中止・延期時は元の行事を削除せず、状態と本文を更新する。
- 一覧では今後の行事を近い順に表示し、過去の行事は別区分にする。
- 行事詳細から `.ics` をダウンロードできるようにする。
- 月間カレンダー表示は初期版の必須条件ではない。まず一覧の読みやすさを優先する。

## 9. 画像の扱い

- 公開画像はリポジトリ内で管理し、外部画像URLへ直リンクしない。
- GPS位置情報などのEXIFメタデータを除去する。
- 過大な原本をそのまま公開せず、長辺1600〜2000px程度を目安に最適化する。
- Astroの画像最適化を使い、幅・高さを指定してレイアウトずれを防ぐ。
- 画像だけで日時、場所、申込方法などの重要情報を伝えない。本文にも記載する。
- 写真に人物が明確に写る場合、掲載許可があると利用者から示されていない限り、公開前の確認事項として報告する。

## 10. 必須画面と導線

初期版には少なくとも次を含める。

- ホーム
  - 最新のお知らせ
  - 直近の行事
  - 「通知を受け取る」導線
  - Google Sites公式ページへの導線
  - 公式LINEへの導線
- お知らせ一覧・詳細
- 行事一覧・詳細
- 通知設定・導入案内
- iPhone向けホーム画面追加手順
- Android向けホーム画面追加手順
- このサイトについて
- プライバシー説明
- 404ページ
- RSSまたはAtomフィード

Web Share APIが使える端末では共有ボタンを表示し、非対応端末ではURLコピーへフォールバックする。

## 11. UI・アクセシビリティ

主な利用者に高齢者が含まれることを前提にする。

- 日本語UIとする。
- 本文の文字を小さくしすぎない。
- タップ領域は原則44px四方以上とする。
- 白または生成りを基調に、深緑、紺、臙脂など落ち着いたアクセントを使う。
- 十分なコントラストを確保し、色だけで状態を伝えない。
- `lang="ja"`、セマンティックHTML、正しい見出し階層を使う。
- キーボード操作と明瞭なフォーカス表示に対応する。
- `prefers-reduced-motion` を尊重する。
- 外部Webフォントを読み込まず、システム標準の日本語フォントを使う。
- 派手なアニメーション、自動再生、カルーセル、モーダル乱用を避ける。
- 320px幅でも横スクロールを発生させない。
- 通信や通知設定に失敗した場合は、専門用語を避けた日本語メッセージを表示する。

## 12. PWA方針

`manifest.webmanifest` には少なくとも次を含める。

- `name`
- `short_name`
- `id`
- `start_url`
- `scope`
- `display: "standalone"`
- `theme_color`
- `background_color`
- 通常用およびmaskable用の複数サイズのPNGアイコン

### 初期版のService Worker

- 初期版では **OneSignal用Service Workerのみ**を使う。
- 独自のオフラインキャッシュ用Service Workerは追加しない。
- キャッシュ処理を追加するとOneSignalとの競合や更新不良が起こり得るため、別途明示承認を得てから設計する。
- Service Workerが失敗しても、通常のWebサイトとして記事を閲覧できるようにする。

## 13. OneSignal実装規約

OneSignalはWeb Pushの購読管理と配信だけに使う。

### 設定

- OneSignalの現行公式Web SDKを使い、古いブログ記事のlegacy APIをコピーしない。
- `public/OneSignalSDKWorker.js` を、配備後にブラウザーから直接取得できるようにする。
- GitHub Pagesのbase pathを考慮して、Service Workerのパスとscopeを正しく設定する。
- OneSignal App IDは公開値として扱えるが、環境切替のため `PUBLIC_ONESIGNAL_APP_ID` または一元設定から参照する。
- OneSignal App IDが未設定なら、通知機能だけを無効化し、サイト本体のビルド・閲覧は成功させる。
- OneSignal REST API Keyはローカル `.env` にだけ保存し、公開リポジトリへcommitしない。
- GitHub Secretsへ通知送信用キーを追加しない。

### 利用者への許可要求

- ページ読込直後にブラウザーの通知許可ダイアログを出さない。
- 利用者が説明を読み、「通知を受け取る」を押した後にだけ許可を要求する。
- 通知を拒否した利用者へ執拗に再表示しない。
- 通知が未対応の端末・ブラウザーでは、対応していない旨を分かりやすく表示する。
- iPhone／iPadでは、ホーム画面へ追加し、そのアイコンから起動した後に通知許可を求める導線を作る。
- 通常のブラウザータブで開いているiPhoneには、先にホーム画面追加手順を表示し、無効な通知要求をしない。
- Androidでは、通知許可とホーム画面追加を分かりやすく案内する。
- 購読済み、未購読、拒否済み、未対応を区別して表示する。

### 収集しない情報

- External IDを設定しない。
- 氏名、メールアドレス、電話番号、住所、位置情報をOneSignalへ送らない。
- 個人を識別するタグを付けない。
- 不要なセグメントや自動化を作らない。
- OneSignal以外の通知・分析SDKを追加しない。

## 14. 通知送信は明示指示時のみローカルコマンドで行う

通知はサイト公開とは別作業として扱う。記事追加、行事更新、commit、push、GitHub Pages配備を契機に、勝手に通知を送ってはならない。

利用者が「通知も送って」「プッシュ通知まで」など明示した場合に限り、Codexはローカル `.env` のOneSignal REST API Keyを使って通知を送信できる。GitHub Actions、公開サイト、ブラウザー上のJavaScriptから通知を送信してはならない。

### サイト公開と通知送信の手順

1. Codexがお知らせまたは行事を追加する。
2. Codexが検査とビルドを実行する。
3. 明示的な許可がある場合のみ、GitHubへcommit／pushする。
4. GitHub Pagesの配備成功を確認する。
5. 公開URLで記事本文と写真を確認する。
6. `npm run notification:preview -- <content-id>` で次を生成する。
   - OneSignal通知タイトル
   - 短い通知本文
   - 公開済み記事の完全URL
7. 利用者が通知送信を明示した場合のみ、`npm run notification:send -- <content-id> --apply` で送信する。

### `notification:preview` の規則

- ネットワークへ送信してはならない。
- OneSignal APIを呼んではならない。
- `draft: true` の記事では失敗する。
- 公開URL、タイトル、本文を標準出力するだけにする。
- 通知本文は短く事実中心にする。
- URLは記事詳細ページへ直接遷移させる。
- 公開URLが `localhost` にならないよう、必要な環境変数を確認する。

### `notification:send` の規則

- `--apply` がない場合は送信せず、送信予定の内容だけを表示する。
- `draft: true` の記事では失敗する。
- OneSignal REST API Keyは `JYOUSENJI_ONESIGNAL_REST_API_KEY` としてローカル `.env` から読む。
- OneSignal App IDは `JYOUSENJI_ONESIGNAL_APP_ID` または `PUBLIC_ONESIGNAL_APP_ID` から読む。
- 送信先は既定で `Subscribed Users` セグメントとし、必要な場合だけ `--segment` で明示する。
- 送信済みcontent-idは `private/notification-log.json` に記録し、同じcontent-idを再送する場合は `--force` を必須にする。
- 氏名、メールアドレス、電話番号、住所、位置情報、個人識別タグをOneSignalへ送らない。

Codexは、記事を公開しただけで「通知も送信した」と報告してはならない。`notification:send --apply` が成功した場合だけ、通知送信済みと報告する。

## 15. GitHub Pages配備

- GitHub Actionsを公開元として使う。
- `main` ブランチへの反映後、検査に成功した静的成果物だけを配備する。
- 公式のGitHub Pages ActionsまたはAstro公式Actionを優先する。
- workflowの権限は最小限にする。
- pull requestから本番配備しない。
- `pull_request_target` を使わない。
- ビルド成果物へ秘密情報を含めない。
- GitHub Pagesのbase path配下で、リンク、画像、manifest、Service Workerが壊れないことを検査する。

## 16. 開発コマンド

`package.json` には少なくとも次を用意する。

```text
npm run dev
npm run format
npm run format:check
npm run lint
npm run check
npm test
npm run validate:content
npm run build
npm run preview
npm run notification:preview -- <content-id>
npm run notification:send -- <content-id> --apply
```

作業後は、変更内容に応じて最低限次を実行する。

```text
npm ci
npm run format:check
npm run lint
npm run check
npm test
npm run validate:content
npm run build
```

実行できなかった検査を、実行済みと報告してはならない。

## 17. テスト要件

自動検査で少なくとも次を確認する。

- frontmatterスキーマ
- 重複IDと重複slug
- 日時の形式
- 行事終了時刻が開始時刻以後であること
- 画像指定時の代替テキスト
- `draft: true` の記事が本番一覧、RSS、サイトマップへ出ないこと
- GitHub Pagesのbase path配下でリンクと画像が壊れないこと
- manifestとOneSignal Service Workerの公開パス
- App ID未設定でもサイトが正常にビルドできること
- `notification:preview` がdraft記事を拒否し、ネットワーク送信しないこと
- `notification:send` が `--apply` なしでは送信せず、OneSignal payloadを安全に生成すること
- 主要ページのアクセシビリティsmoke test
- 320px、375px、390px程度の表示幅

Web Pushの最終確認は実機のAndroidとiPhone／iPadで行う。自動テストだけで「通知確認済み」と報告しない。

## 18. セキュリティとプライバシー

- API key、token、cookie、個人情報をcommitしない。
- このリポジトリとGitHub Pagesは公開される可能性があるものとして扱う。
- 公開してはいけない写真、名簿、住所録、内部文書を追加しない。
- Markdown内のraw HTMLと任意scriptを原則禁止する。
- 外部リンクには適切な `rel` を付ける。
- 不要なthird-party scriptを導入しない。
- 写真のEXIF位置情報を除去する。
- プライバシーページで、通知配信にOneSignalを利用することを明記する。
- OneSignalが未設定、停止中、障害中でも、お知らせと行事は閲覧可能にする。

## 19. Codexの作業手順

各タスクで次を行う。

1. `AGENTS.md`、関連ファイル、既存テストを読む。
2. 変更範囲を小さく保つ。
3. 不明な寺院情報を創作しない。
4. 実装と同時にテスト・文書を更新する。
5. 必要な検査とビルドを実行する。
6. 差分を自己レビューする。
7. 最後に日本語で次を報告する。
   - 変更内容
   - 追加・更新した記事
   - 実行した検査と結果
   - GitHubへのcommit／pushの有無
   - GitHub Pages配備の確認状況
   - OneSignal通知送信の有無
   - 人間が行う次の操作

### 公開操作の扱い

- 利用者から明示的な許可がない限り、commit、push、deploy設定変更を勝手に行わない。
- 「公開した」と報告するのは、実際にGitHub Pagesの公開URLを確認した場合だけとする。
- `notification:send --apply` が成功していないのに「通知した」と報告してはならない。

## 20. 日常の投稿依頼への対応

例えば利用者から次のような依頼が来る。

> この写真を使って、8月13日14時から本堂で行う盂蘭盆会のお知らせを掲載してください。

Codexは次を行う。

1. 写真を最適化し、EXIFを除去する。
2. お知らせまたは行事Markdownを作る。
3. 日時、場所、表記を確認する。
4. 代替テキストを作る。画像から断定できない内容は書かない。
5. 必要なら最初は `draft: true` にする。
6. テストとビルドを実行する。
7. 公開許可がある場合のみ反映する。
8. 公開後、通知用のタイトル、本文、URLを提示する。
9. 利用者が明示した場合のみ `notification:send --apply` で通知を送る。

## 21. 完了条件

作業は次を満たして完了とする。

- 要求された記事または機能が実装されている。
- 型検査、lint、content validation、test、buildが成功している。
- GitHub Pagesのbase pathで壊れない。
- スマートフォンで読みやすい。
- 秘密情報や個人情報が差分にない。
- 文書が実装と一致している。
- OneSignal未設定でも通常サイトとして動く。
- 通知送信の有無が明確であり、送信する場合は利用者の明示指示と `notification:send --apply` の成功がある。
- 実機確認や管理画面設定など、実行できなかった事項は未確認として明記されている。
