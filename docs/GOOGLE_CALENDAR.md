# Google Calendar同期ワークフロー

## 方針

行事予定の正本は、このリポジトリの `src/content/events/*.md` とします。

既存Google Sitesの「法座予定」は初回移行・照合元として参照しますが、Google Sitesを自動編集しません。Google Calendarへ同期する場合も、PWAの行事Markdownを元にします。

## 認証情報

Google Calendar APIのサービスアカウントJSONは、この公開リポジトリへ置きません。ローカル `.env` で、リポジトリ外の既存ファイルを参照します。

```env
JYOUSENJI_GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
JYOUSENJI_GOOGLE_CALENDAR_ID=
```

`.env` は `.gitignore` で除外します。JSON本体、APIキー、token、cookieはcommitしません。

既存の `TEMPLEDB_GOOGLE_SERVICE_ACCOUNT_FILE` もフォールバックとして参照できますが、このリポジトリでは `JYOUSENJI_GOOGLE_SERVICE_ACCOUNT_FILE` を優先します。

## 法座予定の時刻変換ルール

Google Sitesなどから法座予定を移行するとき、次の表記は明示ルールとして時刻に変換します。

```text
午前 -> 10:00開始、12:00終了
午後 -> 13:30開始、15:30終了
```

保存形式は日本標準時 `+09:00` を明示します。

```yaml
startAt: "2026-08-08T10:00:00+09:00"
endAt: "2026-08-08T12:00:00+09:00"
allDay: false
```

「午前」「午後」または具体的な時刻がない行事は、時刻を推測しません。まず `draft: true` の確認待ちにするか、Google Calendar同期対象から外します。

日付範囲だけが示されている行事も、日ごとの時刻が不明なら推測しません。

## 2026年度法座予定の移行元メモ

2026年度の法座予定は、利用者から提示された次の内容を現在の移行元として扱います。

| 表記                            | 行事               | 補足     | 時刻変換    |
| ------------------------------- | ------------------ | -------- | ----------- |
| 2026年5月21日（木）午後         | 降誕会法要         | 住職講話 | 13:30-15:30 |
| 2026年8月8日（土）午前          | 盆法座             | 未定     | 10:00-12:00 |
| 2026年10月17日（土）午後        | 秋法座             | 未定     | 13:30-15:30 |
| 2026年11月27日（土）午後        | 西津仏婦報恩講     | 未定     | 13:30-15:30 |
| 2027年1月15日（金）〜16日（土） | 御正忌報恩講       | 住職講話 | 確認待ち    |
| 2027年3月21日（日）午前         | 春彼岸・永代経法要 | 未定     | 10:00-12:00 |

確認事項:

- `2026-11-27` は暦上は金曜日です。移行前に、日付または曜日のどちらが正しいか確認します。
- 御正忌報恩講は日付範囲だけで午前/午後や具体時刻がないため、時刻を推測しません。
- 各行事の場所が未確認の場合、公開行事やGoogle Calendar同期の対象にする前に確認します。

## 想定する同期手順

1. Google Sitesの法座予定を確認します。
2. `src/content/events/*.md` へ行事Markdownを追加または更新します。
3. 午前/午後ルールで時刻を補完できるものだけ `draft: false` の候補にします。
4. 時刻不明、講師未定、場所未確認の行事は `draft: true` のままにします。
5. `npm run validate:content` と `npm run build` を実行します。
6. `npm run calendar:preview` でGoogle Calendarとの差分を確認します。
7. 明示確認後にだけ `npm run calendar:sync -- --apply` でGoogle Calendarへ反映します。

## 同期コマンド

誤更新を防ぐため、プレビューと実更新を分けています。

```bash
npm run calendar:preview
npm run calendar:sync -- --apply
```

`calendar:preview` はGoogle Calendarを変更せず、Markdownから作成・更新予定の差分だけを表示します。

`calendar:sync -- --apply` は、差分確認後にだけ使用します。

特定の行事だけ確認・同期する場合は `--id` を使います。

```bash
npm run calendar:preview -- --id 2026-08-08-bon-houza
npm run calendar:sync -- --apply --id 2026-08-08-bon-houza
```

同期対象は `draft: false` の行事だけです。`draft: true` はGoogle Calendarへ作成・更新しません。

GitHubへのcommit/push、Google Calendarへの実反映、OneSignal通知送信は、いずれも利用者の明示許可がある場合だけ行います。

## Google Calendar上の所有判定ルール

このリポジトリからGoogle Calendarへ作成した予定には、Google Calendar APIの `extendedProperties.shared` に次の印を付けます。

```json
{
  "source": "jyousenji-dayori",
  "managedBy": "codex",
  "contentId": "2026-08-08-bon-houza",
  "schemaVersion": "1"
}
```

更新・削除・再同期の対象にしてよいのは、この印があり、かつ `source` が `jyousenji-dayori` の予定だけです。

同じ日付・同じタイトルの予定がGoogle Calendar上にあっても、この印がないものは人間または別システムが作成した予定として扱い、上書き・削除しません。その場合は競合候補として報告し、利用者の確認を待ちます。

Google Calendarの `creator` や `organizer` も参考情報にはなりますが、手動編集、共有設定、インポートなどで意味が変わる可能性があるため、所有判定の正本にはしません。
