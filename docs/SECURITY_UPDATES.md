# セキュリティ更新

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
