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
3. 法座予定で「午前」とある場合は10:00から12:00、「午後」とある場合は13:30から15:30として扱います。
4. 午前/午後または具体的な時刻がない行事は、時刻を推測せず確認待ちにします。
5. 中止や延期は記事を削除せず、`status` と本文を更新します。
6. 詳細ページから `.ics` をダウンロードできます。

Google Calendar同期の方針と時刻変換ルールは `docs/GOOGLE_CALENDAR.md` を参照してください。

Google Calendarに反映する場合は、必ず先に差分を確認します。

```bash
npm run calendar:preview
npm run calendar:sync -- --apply
```

特定の行事だけ反映する場合:

```bash
npm run calendar:preview -- --id 2026-08-08-bon-houza
npm run calendar:sync -- --apply --id 2026-08-08-bon-houza
```

## 法座の本屋を更新する

1. 公開する本の情報は `src/data/bookshop.ts` で管理します。
2. 書名、著者、出版社、税込価格、短い紹介、出版社の商品ページURLを確認します。
3. 新しく入った本には `newArrival: true` を設定します。
4. 表紙画像は公式の商品案内から取得し、`src/assets/books/` に保存します。外部画像への直リンクはせず、長辺360px以下へ縮小してメタデータを除去します。
5. 表紙画像の参照元となる商品ページは、各書籍の `productUrl` として残します。
6. 公開する現在庫冊数は `bookshopStockById` で管理し、更新日も同時に変更します。
7. 入荷数、販売数、仕入価格などの内部情報は公開データへ記載しません。
8. 特別販売価格は、税込価格の10円・1円の位を切り下げた100円単位で自動表示します。
9. 更新後は、在庫合計と私有集計が一致することを確認します。
10. `/bookshop/` の表を320px幅とデスクトップ幅で確認します。

## 布教師名簿を参照・更新する

布教師名簿は個人情報を含むため、公開リポジトリには置きません。実ファイルはリポジトリ外の私有フォルダ内に、このレポ用のサブフォルダを作って置き、ローカル `.env` の `JYOUSENJI_TEACHERS_FILE` で参照します。

```bash
JYOUSENJI_TEACHERS_FILE=
```

運用ルール:

1. 実ファイルの絶対パスをREADMEや `docs/` に書きません。
2. `.env` は `.gitignore` 対象であることを確認してから実パスを書きます。
3. 私有フォルダ直下へ直接置かず、用途やレポごとのサブフォルダに分けます。
4. FAXや名簿から公開ページへ転記する場合、住所・電話番号などの個人連絡先は公開Markdownへ載せません。
5. 新しい出講記録は、既存の人物行を上書きせず、名簿の入力済みデータの最下部へ新しい行として追加します。
6. Excelを編集する前に、同じリポジトリ外フォルダへバックアップを作成します。
7. 編集後は、追跡対象ファイルに実パスや名簿名が混ざっていないことを確認します。

## 公開と通知の分離

サイト公開と通知送信は別作業です。

1. Markdownと画像を更新します。
2. 検査とビルドを通します。
3. 明示的な許可がある場合のみcommit／pushします。
4. GitHub Pages の配備成功を確認します。
5. 公開URLで本文と画像を確認します。
6. `npm run notification:preview -- <content-id>` で通知用の文面を生成します。
7. 利用者が明示した場合のみ `npm run notification:send -- <content-id> --apply` で送信します。

記事公開、commit、push、GitHub Pages配備を契機に自動で通知してはいけません。通知送信は明示指示時だけです。
