import { buildNotificationMessage, loadEnv } from "./notification-message.mjs";

const contentId = process.argv[2];

if (!contentId) {
  console.error("使い方: npm run notification:preview -- <content-id>");
  process.exit(1);
}

try {
  const env = await loadEnv();
  const message = await buildNotificationMessage(contentId, env);

  console.log(
    [
      "OneSignal通知プレビュー",
      "",
      `タイトル: ${message.title}`,
      `本文: ${message.body}`,
      `URL: ${message.url}`,
      "",
      "通知は送信していません。送信する場合は npm run notification:send -- <content-id> --apply を実行します。",
    ].join("\n"),
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
