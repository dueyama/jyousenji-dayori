# 運用手順

## お知らせを追加する

1. `src/content/notices/` にMarkdownを追加します。
2. 写真を使う場合はEXIFを除去し、長辺1600〜2000px程度を目安に最適化して `src/assets/notices/` に置きます。
3. 写真を指定する場合は、事実に基づく `heroAlt` を必ず記入します。
4. 情報が不足している間は `draft: true` のままにします。
5. 検査とビルドを実行します。

```bash
npm run format:check
npm run lint
npm run check
npm test
npm run validate:content
npm run build
```

## 行事を追加する

1. `src/content/events/` にMarkdownを追加します。
2. `startAt` と `endAt` は `YYYY-MM-DDTHH:mm:ss+09:00` で記入します。
3. 中止や延期は記事を削除せず、`status` と本文を更新します。
4. 詳細ページから `.ics` をダウンロードできます。

## 公開と通知の分離

サイト公開と通知送信は別作業です。

1. Markdownと画像を更新します。
2. 検査とビルドを通します。
3. 明示的な許可がある場合のみcommit／pushします。
4. GitHub Pages の配備成功を確認します。
5. 公開URLで本文と画像を確認します。
6. `npm run notification:preview -- <content-id>` で手動通知用の文面を生成します。
7. OneSignal管理画面で人間が確認して送信します。

コード、GitHub Actions、ローカルコマンドから通知を送信してはいけません。
