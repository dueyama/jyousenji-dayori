import { mkdir, readFile, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildNotificationMessage,
  buildOneSignalPayload,
  loadEnv,
  parseSegments,
} from "./notification-message.mjs";

const defaultSegments = ["Total Subscriptions"];
const sentLogPath = path.join("private", "notification-log.json");

export async function runNotificationSend(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const env = await loadEnv();
  const message = await buildNotificationMessage(options.contentId, env);
  const config = readOneSignalConfig(env, options);
  const payload = buildOneSignalPayload(message, config);

  printSendPlan(message, payload, options);

  if (!options.apply) {
    console.log(
      "\n通知は送信していません。送信する場合は --apply を付けて再実行します。",
    );
    return { message, payload, sent: false };
  }

  if (message.url.startsWith("http://localhost")) {
    throw new Error(
      "通知URLが localhost です。PUBLIC_SITE_URL と PUBLIC_BASE_PATH を .env に設定してください",
    );
  }

  const sentLog = await readSentLog();
  const previous = sentLog.find((item) => item.contentId === message.id);
  if (previous && !options.force) {
    throw new Error(
      `このcontent-idは送信記録があります: ${message.id}。再送する場合は --force を付けてください`,
    );
  }

  const response = await sendOneSignalNotification(config.restApiKey, payload);
  await appendSentLog({
    contentId: message.id,
    collection: message.collection,
    title: message.title,
    url: message.url,
    oneSignalId: response.id ?? null,
    sentAt: new Date().toISOString(),
  });

  console.log("");
  console.log(`通知送信要求を受け付けました: ${response.id ?? "(idなし)"}`);
  return { message, payload, response, sent: true };
}

export function parseArgs(argv) {
  const options = {
    apply: false,
    contentId: "",
    force: false,
    includedSegments: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") {
      options.apply = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--segment") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--segment にはセグメント名を指定してください");
      }
      options.includedSegments.push(value);
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`未対応の引数です: ${arg}`);
    }
    if (options.contentId) {
      throw new Error(`content-id は1つだけ指定してください: ${arg}`);
    }
    options.contentId = arg;
  }

  if (!options.contentId) {
    throw new Error("content-id を指定してください");
  }

  return options;
}

function readOneSignalConfig(env, options) {
  const appId =
    env.JYOUSENJI_ONESIGNAL_APP_ID ?? env.PUBLIC_ONESIGNAL_APP_ID ?? "";
  const restApiKey =
    env.JYOUSENJI_ONESIGNAL_REST_API_KEY ?? env.ONESIGNAL_REST_API_KEY ?? "";
  const includedSegments =
    options.includedSegments.length > 0
      ? options.includedSegments
      : parseSegments(env.JYOUSENJI_ONESIGNAL_INCLUDED_SEGMENTS);

  if (!appId) {
    throw new Error(
      "JYOUSENJI_ONESIGNAL_APP_ID または PUBLIC_ONESIGNAL_APP_ID を .env に設定してください",
    );
  }
  if (!restApiKey) {
    throw new Error(
      "JYOUSENJI_ONESIGNAL_REST_API_KEY を .env に設定してください",
    );
  }

  return {
    appId,
    restApiKey,
    includedSegments:
      includedSegments.length > 0 ? includedSegments : defaultSegments,
  };
}

function printSendPlan(message, payload, options) {
  console.log(
    options.apply ? "OneSignal通知送信" : "OneSignal通知送信プレビュー",
  );
  console.log("");
  console.log(`タイトル: ${message.title}`);
  console.log(`本文: ${message.body}`);
  console.log(`URL: ${message.url}`);
  console.log(`対象セグメント: ${payload.included_segments.join(", ")}`);
  console.log(`content-id: ${message.id}`);
}

async function readSentLog() {
  try {
    return JSON.parse(await readFile(sentLogPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function appendSentLog(entry) {
  const entries = await readSentLog();
  entries.push(entry);
  await mkdir(path.dirname(sentLogPath), { recursive: true });
  await writeFile(sentLogPath, `${JSON.stringify(entries, null, 2)}\n`);
}

export function sendOneSignalNotification(restApiKey, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = https.request(
      "https://api.onesignal.com/notifications",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${restApiKey}`,
          "Content-Type": "application/json",
          "Content-Length": String(Buffer.byteLength(body)),
        },
      },
      (response) => {
        let data = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          const parsed = data ? JSON.parse(data) : {};
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                `OneSignal通知送信に失敗しました (${response.statusCode}): ${data.slice(0, 500)}`,
              ),
            );
            return;
          }
          if (parsed.errors || !parsed.id) {
            reject(
              new Error(
                `OneSignal通知送信に失敗しました: ${JSON.stringify(parsed).slice(0, 500)}`,
              ),
            );
            return;
          }
          resolve(parsed);
        });
      },
    );
    request.on("error", (error) => reject(error));
    request.write(body);
    request.end();
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runNotificationSend().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
