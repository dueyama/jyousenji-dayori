# 浄泉寺公式お知らせPWA

浄泉寺からのお知らせ、写真、行事予定、プッシュ通知の登録導線をスマートフォン向けに届ける静的PWAです。既存のGoogle Sitesは公式案内ページとして残し、このリポジトリでは更新頻度の高い情報をMarkdownと画像で管理します。

## 技術構成

- Astro 静的出力
- Astro Content Collections
- Markdown によるお知らせ・行事管理
- OneSignal Web Push SDK v16
- GitHub Actions から GitHub Pages へ配備

OneSignal App ID が未設定でも、通知機能だけを無効化してサイト本体はビルド・閲覧できます。

## 開発

```bash
npm ci
npm run dev
```

主な検査:

```bash
npm run format:check
npm run lint
npm run check
npm test
npm run validate:content
npm run build
```

## コンテンツ追加

- お知らせ: `src/content/notices/`
- 行事: `src/content/events/`
- 公開画像: `src/assets/notices/` または `src/assets/events/`

サンプル記事はすべて `draft: true` です。公開する記事は日時、場所、写真の掲載許可、代替テキストを確認してから `draft: false` にしてください。

## 手動通知プレビュー

通知は送信しません。公開済み記事の通知文面だけを生成します。

```bash
npm run notification:preview -- <content-id>
```

OneSignal管理画面で人間が内容と対象を確認して送信します。

詳細は `docs/SETUP.md`、`docs/OPERATIONS.md`、`docs/ONESIGNAL.md` を参照してください。
