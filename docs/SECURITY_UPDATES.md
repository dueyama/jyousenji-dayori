# セキュリティ更新

## 2026-10-25: Zod・fast-uri更新（ローカル検証済み・未公開）

利用者から追加の調査・必要な更新・テストとビルドまでの明示許可を得て実施した。先行するUndici・Vite更新と案内ページの未コミット差分は保全した。commit・push・公開は行わない。

| 依存                                      | 更新前 | 更新後 |
| ----------------------------------------- | ------ | ------ |
| Zod（Astro経由）                          | 4.6.5  | 4.6.7  |
| fast-uri（check用言語サーバー → ajv経由） | 3.1.8  | 3.1.9  |

### 判断と変更範囲

- Zodは[GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)の対象で、修正済み最低版は4.6.6。[保守元の修正PR](https://github.com/colinhacks/zod/pull/6652)も確認した。上限付きArray・Set・Mapで要素を全件処理する前に件数上限を判定する変更であり、上限のない配列を含むあらゆる入力の資源消費を制限するものではない。
- 本PWAのZodはAstroの設定・Content Collectionsのローカルデータ検査で使われる。独自スキーマは文字列・日時・状態等のオブジェクト検査で、外部から大量の配列を受け付けるAPIや投稿機能はない。Astro内部の全スキーマについて攻撃経路を証明したわけではなく、公開サイトへの攻撃可能性や被害は断定しない。
- fast-uriは[schemeのpercent decoding](https://github.com/fastify/fast-uri/security/advisories/GHSA-w74x-v6f9-j3xg)、[相対参照の正規化](https://github.com/fastify/fast-uri/security/advisories/GHSA-xhq7-xmqj-769h)、[hostの正規化](https://github.com/fastify/fast-uri/security/advisories/GHSA-wjr9-j795-jxcr)、[suffix参照のscheme injection](https://github.com/fastify/fast-uri/security/advisories/GHSA-333x-w4r6-6crp)の対象で、3系の修正版は3.1.9。利用経路は `@astrojs/check → @astrojs/language-server → volar-service-yaml → yaml-language-server → ajv → fast-uri`。独自のURL許可判定やブラウザー向けコードでは使用しておらず、各告知の攻撃成立条件を本PWAで確認したものではない。
- `npm update zod fast-uri --package-lock-only --ignore-scripts --no-audit --no-fund` と `npm ci --no-audit --no-fund` を実行した。作業開始時のlockfileとの比較で変更は上記2依存だけ。直接依存・overrideは追加せず、package.json、Astro、Undici、Vite、記事、画面、配備設定は変更していない。
- インストール時にesbuild・fseventsの未承認install script警告が出たが、新しいスクリプト実行許可は追加していない。以下の検査・静的ビルドは成功した。

### ローカル検証結果

- format、lint（81ファイル）、型検査（62ファイル、エラー・警告・hintなし）、34件のテストに成功。
- lockfile全体の最低修正版検査へZod・fast-uriを追加。小さい入力で、Zodの上限付きArray・Set・Mapが要素を処理する前に件数超過を拒否することと、fast-uriの相対参照・encoded schemeの修正動作を検査した。追加テストは旧版で失敗し、更新後に成功することを確認した。
- 本番の `PUBLIC_SITE_URL=https://dueyama.github.io`、`PUBLIC_BASE_PATH=/jyousenji-dayori/` で静的ビルドに成功（24ページ、69画像）。リポジトリの既存distを使わず、今回の生成物へコンテンツ13件・内部リンク・manifest・Service Worker等の検査を実施して成功した。
- 同日直前の案内ページ検証済み成果物114ファイルと比較し、HTML24ページ・画像等は同一。差分はICS6件の `DTSTAMP`（生成時刻）のみで、行事の日時や本文は変わっていない。
- `npm audit`は更新前2依存（High 1、Moderate 1）、更新後0件。監査結果はこの確認時点のものであり、将来の無脆弱性を保証しない。
- ローカルNode 26.12.1で検証した。Node自体・既存CIのNode 24指定は変更せず、GitHub Actions、実機の通知・バッヂ、画面の再操作テストは実施していない。
- DUMS2022の保存規則に従い、生成物は外付けScratchの本プロジェクト `20261025-zod-fast-uri/verified-dist/`、監査結果・コマンドログ・差分検査・ハッシュはMediaの本プロジェクトevidenceに保存した。AstroのCLIはパッケージのbin定義から解決し、外付けrunディレクトリから正本rootとoutDirを指定した。ソース・node_modulesの実体は移動していない。

commit・push・公開・Googleカレンダー更新・OneSignal通知送信は未実施。今回の更新で公開サイトを変更していない。

## 2026-10-25: Undici・Vite更新（ローカル検証済み・未公開）

申し送り受領後、利用者から必要性の確認、必要な更新、ビルド検証までの明示許可を得て実施した。commit・push・公開の許可は含まれない。

| 依存                          | 更新前 | 更新後 |
| ----------------------------- | ------ | ------ |
| Undici（Astro → unifont経由） | 8.11.2 | 8.12.3 |
| Vite（Astro経由）             | 8.3.2  | 8.3.5  |

### 判断と変更範囲

- [Undici公式告知 GHSA-xjj6-f33q-929c](https://github.com/nodejs/undici/security/advisories/GHSA-xjj6-f33q-929c)を確認。8.11.2は対象で、8.12.2以降に修正を含む。悪意あるサーバー応答によるfetch処理中のNodeプロセス停止が問題であり、静的GitHub Pages上の常駐Nodeの問題ではない。
- 現在のAstro設定にはfont指定がない。unifontはglobal fetchを使い、proxy環境変数がある場合にnpm版Undiciのdispatcherを設定する実装だった。本PWAで悪意ある応答へ到達する経路は確認しておらず、実際の攻撃可能性は断定しない。制作環境の対象依存を残さない予防的更新とした。
- [Vite GHSA-rq7h-c2jc-7f22](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22)は非Windowsの開発サーバーを外部へ露出し、特定のimportパス等の条件が重なる場合のファイルアクセス制御問題。[GHSA-9jrq-w75r-8gcw](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw)は未加工のリクエストURLをtransformIndexHtmlへ渡すcustom middleware等が条件。8.3.2は両方の対象で、8.3.3以降に修正を含む。Astroはcustom appTypeを使うが、全影響条件の成立を確認したわけではない。今後のローカル開発に備えて更新した。
- `npm update undici vite --package-lock-only --ignore-scripts --no-audit --no-fund` で既存の依存範囲内のpatch更新を解決し、`npm ci --no-audit --no-fund` で再インストールした。Astro 7.3.5、unifont 0.7.5、package.json、公開コンテンツ、配備設定は変更していない。
- Vite配下の再解決でPostCSS 8.5.31、Rolldown 1.2.15、その対応binding・型、およびnanoid・source-map-jsも更新された。lockfileの差分を確認し、別の直接依存やoverrideは追加していない。
- ローカルNodeは26.12.1、内蔵Undiciは8.12.2。npm版の更新とNode内蔵版は別物であり、今回はNode自体を更新していない。CIは既存のNode 24指定のまま、今回はGitHub Actionsを実行していない。

### ローカル検証結果

- format、lint、型検査（57ファイル、エラー・警告・hintなし）、25件のテストに成功。lockfile内の全Undici・Viteに修正済み最低版を要求する回帰検査を既存テストへ追加した。
- 本番の `PUBLIC_SITE_URL=https://dueyama.github.io`、`PUBLIC_BASE_PATH=/jyousenji-dayori/` で静的ビルドに成功（22ページ、69画像）。今回の生成物を対象にコンテンツ13件、内部リンク、manifest、Service Worker等の既存検査を実施して成功した。画面・実機通知の再検査は未実施。
- DUMS2022の保存規則に従い、生成物は外付けScratchの本プロジェクト `20261025-undici-vite/verified-dist/` に保存した。通常cwdから外付けoutDirを指定するとAstroのrenameがEXDEVで失敗したため、外付けrunディレクトリから正本rootを指定して実行した。中間物からの依存解決用に同run内へ既存node_modulesへの参照リンクを置いた。ソース・依存の実体は移動していない。
- `npm audit`では今回のUndici・Viteの指摘は残らなかった。ただし別件としてfast-uri 3.1.8（Moderate）とZod 4.6.5（High）が残るため、監査全体は成功扱いにしない。これは上の10月5日時点の監査0件とは確認時点が異なる。

### 別件の保守候補（未更新）

以下はUndici・Vite更新時点の記録。同日の後続作業で対応済みのため、上のZod・fast-uri更新結果を参照する。

- fast-uri: check用言語サーバー → ajv経由。GHSA-w74x-v6f9-j3xg、GHSA-xhq7-xmqj-769h、GHSA-wjr9-j795-jxcr、GHSA-333x-w4r6-6crpがnpm監査で報告された（対象は3.1.9未満）。
- Zod: Astro経由。GHSA-mrhx-c7xc-m3w5がnpm監査で報告された（対象は4.6.6未満）。
- 上記2依存は今回のUndici・Vite更新とは分け、影響条件・安全な更新範囲の確認待ちとする。今回の作業で追加更新していない。

commit・push・公開・Googleカレンダー更新・OneSignal通知送信は未実施。公開サイトは変更していない。

## 2026-10-25: Undici・Viteの保守申し送り（受領時の記録）

次回の開発・ビルド前に確認する保守候補として受理した。今回は申し送りの記録のみで、依存更新や追加監査は開始していない。下記は依頼元の提供情報であり、この受領作業で告知・lockfile・到達経路を独立に再検証した結果ではない。

- 対象は本PWAと公開先 <https://dueyama.github.io/jyousenji-dayori/>。受領時のローカルHEADは `b6b233d038d2668fa0d5c58f0d9ae57812953ae9` で、依頼元が確認した本番ソースと一致した。公開サイトの現状は今回は再取得していない。
- Undici: Astro → unifont → Undici 8.11.2との申し送り。GHSA-xjj6-f33q-929c（High、7.5）、修正版8.12.2。悪意ある多重encodingの応答と切断に関するfetch時の問題とされる。現行設定にfont指定はないとの報告だが、実際のfetch経路への到達は未確認。
- Vite: 開発用依存8.3.2が修正対象候補、修正版8.3.3との申し送り。対象告知はGHSA-rq7h-c2jc-7f22、GHSA-9jrq-w75r-8gcw。
- GitHub Pagesは静的配信であり、公開サーバー上でNodeが常時実行される問題とは区別する。公開サイトの被害や攻撃可能性を、この申し送りだけから断定しない。
- 参照先（今回はネットワーク取得なし）: [Undici公式告知](https://github.com/nodejs/undici/security/advisories/GHSA-xjj6-f33q-929c)、[対象commitのlockfile](https://github.com/dueyama/jyousenji-dayori/blob/b6b233d038d2668fa0d5c58f0d9ae57812953ae9/package-lock.json)。

### 次回開発・ビルド前の確認事項

1. 現在の依存版と更新済み記録を確認し、上の提供値と区別する。
2. 告知の影響条件、実際の利用経路、依存更新の必要性と安全な更新範囲を確認する。
3. 更新を実施する場合は、その作業の承認範囲で依存更新とビルド検証を行い、結果を追記する。今回の記録を更新・公開の承認として扱わない。

今回、インストール、依存更新、監査テスト、ビルド、commit、push、公開、設定・認証変更は行っていない。記事、行事、Googleカレンダー、OneSignal通知、他プロジェクトも変更していない。10月5日の更新完了記録とは別件である。

実作業の指定「GPT-6.1 Sol medium」は受理した。実runtimeのモデル・推論設定は独立確認しておらず、指定どおりに稼働したとは断定しない。

## 2026-10-05: Astro・Sharp・PostCSS

記事、行事、公開URL、配備方式を変更せず、制作・ビルド用の依存関係を更新した。

| 依存                 | 更新前のlockfile          | 更新後のlockfile |
| -------------------- | ------------------------- | ---------------- |
| Astro                | 6.4.8                     | 7.3.5            |
| Sharp                | 0.35.2、Astro配下に0.34.5 | 0.35.5に統一     |
| PostCSS              | 8.5.15                    | 8.5.28           |
| devalue              | 5.8.1                     | 5.9.4            |
| fast-uri             | 3.1.2                     | 3.1.8            |
| http-cache-semantics | 4.2.0                     | 4.3.0            |

- [Astro公式告知 GHSA-26w7-cxv4-gfx2](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2): 信頼できないAVIFの画像処理が問題になる。修正を含む最低版はAstro 7.2.8、Sharp 0.35.4。
- [PostCSS GHSA-r28c-9q8g-f849](https://github.com/postcss/postcss/security/advisories/GHSA-r28c-9q8g-f849)・[GHSA-fxqj-rqcc-2cmp](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp): 信頼できないCSSに含まれるsourceMappingURLの処理に関する問題。両修正を含む最低版は8.5.23。
- [Astro 7移行案内](https://docs.astro.build/en/guides/upgrade-to/v7/)を確認。既存の静的構成を維持し、設定の追加は不要だった。
- Node.jsの最低版はAstroに合わせて22.12.0。ローカルの検証環境は26.10.0、既存GitHub Actionsの設定は24。Node.js 22での実行は別途未検証。
- Sharpの実行時ライブラリはlibheif 1.23.5、libvips 8.18.7。安全なテスト画像でAVIFの生成・読込・リサイズを確認する。

このPWAはGitHub Pagesで配信する静的サイトであり、来訪者の画像やCSSをサーバーで処理する機能はない。上記告知だけを根拠に、公開サイトが攻撃された、または攻撃可能だったとは判断していない。

### 検査

- `npm ci`、format、lint、型検査、コンテンツ検査、24件のテスト、本番base path付きビルド。
- `npm audit`は更新前10件（high 9件、critical 1件）、更新後0件。監査結果は確認時点のものであり、将来の無脆弱性を保証しない。
- lockfile内の全Astro・Sharp・PostCSSに修正済み最低版を要求する回帰テストを追加。
- 更新前後の30件の正規HTML・RSS・サイトマップ・ICS・manifestを比較。本文・見出し・リンク・日時・画像の代替テキストと寸法を維持。Astro 7のHTML空白圧縮差は比較時に正規化した。
- 69件の生成WebPをSharpで読み込み、正の画像寸法を確認。
- Codex内蔵ブラウザで主要ページを320・375・390・788・1280px幅で検査。主要見出し、本文領域、スキップリンク、横はみ出し、モバイル下部メニューのタップ領域を確認。
- Chromeを起動する既存`test:visual`は実行せず、内蔵ブラウザで表示検査を行う。実機の通知・バッヂ動作は今回の検査範囲外。

### 公開の境界

既存の`main`への通常pushとGitHub Actionsによる配備を使用する。CI・配備runの対象commitと成功状態、遠隔HEAD、公開ページを別々に確認する。プレビュー成功だけを公開完了とは扱わない。

この更新ではOneSignal通知、Googleカレンダー更新、他プロジェクトやPiへの変更を行わない。認証情報や権限設定も変更しない。
