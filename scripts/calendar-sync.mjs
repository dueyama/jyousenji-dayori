import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import https from "node:https";
import { pathToFileURL } from "node:url";
import { readAllEntries } from "./content-utils.mjs";

const calendarSource = "jyousenji-dayori";
const managedBy = "codex";
const schemaVersion = "1";
const timeZone = "Asia/Tokyo";

export async function runCalendarSync(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const env = await loadEnv();
  const config = readCalendarConfig(env);
  const entries = (await readAllEntries())
    .filter((entry) => entry.collection === "events")
    .filter((entry) => entry.data.draft === false)
    .filter(
      (entry) => !options.contentId || entry.data.id === options.contentId,
    )
    .sort((a, b) => a.data.startAt.localeCompare(b.data.startAt));

  if (entries.length === 0) {
    throw new Error("同期対象の公開行事がありません");
  }

  const desiredEvents = entries.map((entry) => ({
    contentId: entry.data.id,
    event: buildGoogleCalendarEvent(entry),
    entry,
  }));

  const token = await getServiceAccountAccessToken(config.serviceAccount);
  const client = new GoogleCalendarClient({
    accessToken: token,
    calendarId: config.calendarId,
  });
  const existingEvents = await client.listEvents(
    buildCalendarListWindow(desiredEvents),
  );
  const plan = buildSyncPlan(desiredEvents, existingEvents, {
    reportExtraManaged: !options.contentId,
  });

  printSyncPlan(plan, { apply: options.apply });

  if (plan.duplicateManaged.length > 0 || plan.conflicts.length > 0) {
    throw new Error(
      "競合または重複管理予定があるため、Google Calendarは変更していません",
    );
  }

  if (!options.apply) {
    console.log(
      "\nGoogle Calendarは変更していません。反映する場合は npm run calendar:sync -- --apply を実行します。",
    );
    return plan;
  }

  for (const item of plan.toCreate) {
    await client.createEvent(item.desired.event);
    console.log(`作成: ${item.desired.event.summary} (${item.contentId})`);
  }
  for (const item of plan.toUpdate) {
    await client.updateEvent(item.existing.id, item.desired.event);
    console.log(`更新: ${item.desired.event.summary} (${item.contentId})`);
  }

  console.log(
    `\n完了: 作成 ${plan.toCreate.length}件、更新 ${plan.toUpdate.length}件、変更なし ${plan.upToDate.length}件`,
  );
  return plan;
}

export function parseArgs(argv) {
  const options = {
    apply: false,
    contentId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") {
      options.apply = true;
      continue;
    }
    if (arg === "--id") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--id には content id を指定してください");
      }
      options.contentId = value;
      index += 1;
      continue;
    }
    throw new Error(`未対応の引数です: ${arg}`);
  }

  return options;
}

export function buildGoogleCalendarEvent(entry) {
  const title = withStatusPrefix(entry.data.title, entry.data.status);
  const description = buildDescription(entry);
  const event = {
    summary: title,
    description,
    location: entry.data.location,
    status: "confirmed",
    extendedProperties: {
      shared: {
        source: calendarSource,
        managedBy,
        contentId: entry.data.id,
        schemaVersion,
      },
    },
  };

  if (entry.data.allDay) {
    event.start = { date: datePart(entry.data.startAt) };
    event.end = { date: exclusiveEndDate(entry.data.endAt) };
  } else {
    event.start = { dateTime: entry.data.startAt, timeZone };
    event.end = { dateTime: entry.data.endAt, timeZone };
  }

  return event;
}

export function buildSyncPlan(
  desiredEvents,
  existingEvents,
  { reportExtraManaged = true } = {},
) {
  const managed = existingEvents.filter(isManagedCalendarEvent);
  const unmanaged = existingEvents.filter(
    (event) => !isManagedCalendarEvent(event),
  );
  const desiredIds = new Set(desiredEvents.map((item) => item.contentId));
  const managedByContentId = new Map();
  const duplicateManaged = [];

  for (const event of managed) {
    const contentId = event.extendedProperties?.shared?.contentId;
    if (!contentId) {
      continue;
    }
    if (managedByContentId.has(contentId)) {
      duplicateManaged.push({
        contentId,
        events: [managedByContentId.get(contentId), event],
      });
      continue;
    }
    managedByContentId.set(contentId, event);
  }

  const toCreate = [];
  const toUpdate = [];
  const upToDate = [];
  const conflicts = [];

  for (const desired of desiredEvents) {
    const existing = managedByContentId.get(desired.contentId);
    if (existing) {
      const diffs = diffCalendarEvent(desired.event, existing);
      if (diffs.length > 0) {
        toUpdate.push({
          contentId: desired.contentId,
          desired,
          existing,
          diffs,
        });
      } else {
        upToDate.push({ contentId: desired.contentId, desired, existing });
      }
      continue;
    }

    const conflictCandidates = unmanaged.filter((event) =>
      isLikelySameEvent(desired.event, event),
    );
    if (conflictCandidates.length > 0) {
      conflicts.push({
        contentId: desired.contentId,
        desired,
        events: conflictCandidates,
      });
      continue;
    }

    toCreate.push({ contentId: desired.contentId, desired });
  }

  const extraManaged = reportExtraManaged
    ? managed.filter((event) => {
        const contentId = event.extendedProperties?.shared?.contentId;
        return contentId && !desiredIds.has(contentId);
      })
    : [];

  return {
    toCreate,
    toUpdate,
    upToDate,
    conflicts,
    duplicateManaged,
    extraManaged,
  };
}

export function diffCalendarEvent(desired, existing) {
  const fields = [
    ["summary", desired.summary, existing.summary ?? ""],
    ["description", desired.description, existing.description ?? ""],
    ["location", desired.location, existing.location ?? ""],
    ["start", calendarTimeKey(desired.start), calendarTimeKey(existing.start)],
    ["end", calendarTimeKey(desired.end), calendarTimeKey(existing.end)],
  ];

  return fields
    .filter(([, desiredValue, existingValue]) => desiredValue !== existingValue)
    .map(([field, desiredValue, existingValue]) => ({
      field,
      desired: desiredValue,
      existing: existingValue,
    }));
}

function printSyncPlan(plan, options) {
  console.log(
    options.apply ? "Google Calendar同期実行" : "Google Calendar同期プレビュー",
  );
  console.log("");
  printItems(
    "作成予定",
    plan.toCreate,
    (item) => item.desired.event.summary,
    true,
  );
  printItems(
    "更新予定",
    plan.toUpdate,
    (item) => {
      const fields = item.diffs.map((diff) => diff.field).join(", ");
      return `${item.desired.event.summary} (${item.contentId}) - ${fields}`;
    },
    true,
  );
  printItems(
    "変更なし",
    plan.upToDate,
    (item) => item.desired.event.summary,
    false,
  );
  printItems(
    "競合候補",
    plan.conflicts,
    (item) => {
      return `${item.desired.event.summary} (${item.contentId}) - 管理印のない同名同日予定があります`;
    },
    true,
  );
  printItems(
    "重複管理予定",
    plan.duplicateManaged,
    (item) => {
      return `${item.contentId} - 管理印つき予定が複数あります`;
    },
    true,
  );
  printItems(
    "Markdownにない管理対象予定",
    plan.extraManaged,
    (event) => {
      const contentId = event.extendedProperties?.shared?.contentId ?? "";
      return `${event.summary ?? "(無題)"} (${contentId})`;
    },
    false,
  );
}

function printItems(title, items, formatter, showEmpty) {
  if (items.length === 0) {
    if (showEmpty) {
      console.log(`${title}: 0件`);
    }
    return;
  }
  console.log(`${title}: ${items.length}件`);
  for (const item of items) {
    console.log(`- ${formatter(item)}`);
  }
}

function withStatusPrefix(title, status) {
  if (status === "cancelled") {
    return `【中止】${title}`;
  }
  if (status === "postponed") {
    return `【延期】${title}`;
  }
  return title;
}

function buildDescription(entry) {
  const body = markdownToPlainText(entry.body);
  const statusLine = statusDescription(entry.data.status);
  return [statusLine, body].filter(Boolean).join("\n\n");
}

function statusDescription(status) {
  if (status === "cancelled") {
    return "状態: 中止";
  }
  if (status === "postponed") {
    return "状態: 延期";
  }
  return "";
}

function markdownToPlainText(markdown) {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function datePart(value) {
  return value.slice(0, 10);
}

function exclusiveEndDate(value) {
  const end = new Date(value);
  if (Number.isNaN(end.getTime())) {
    throw new Error(`日時を解釈できません: ${value}`);
  }
  end.setUTCDate(end.getUTCDate() + 1);
  return end.toISOString().slice(0, 10);
}

function calendarTimeKey(value) {
  if (!value) {
    return "";
  }
  if (value.date) {
    return `date:${value.date}`;
  }
  return `dateTime:${value.dateTime ?? ""}`;
}

function isManagedCalendarEvent(event) {
  const shared = event.extendedProperties?.shared ?? {};
  return shared.source === calendarSource && shared.managedBy === managedBy;
}

function isLikelySameEvent(desired, existing) {
  return (
    desired.summary === (existing.summary ?? "") &&
    calendarStartDate(desired) === calendarStartDate(existing)
  );
}

function calendarStartDate(event) {
  const start = event.start ?? {};
  return (start.date ?? start.dateTime ?? "").slice(0, 10);
}

function buildCalendarListWindow(desiredEvents) {
  const timestamps = desiredEvents.flatMap((item) => {
    const start =
      item.event.start.dateTime ?? `${item.event.start.date}T00:00:00+09:00`;
    const end =
      item.event.end.dateTime ?? `${item.event.end.date}T00:00:00+09:00`;
    return [new Date(start).getTime(), new Date(end).getTime()];
  });
  const min = new Date(Math.min(...timestamps));
  const max = new Date(Math.max(...timestamps));
  min.setUTCFullYear(min.getUTCFullYear() - 1);
  max.setUTCFullYear(max.getUTCFullYear() + 1);
  return {
    timeMin: min.toISOString(),
    timeMax: max.toISOString(),
  };
}

async function loadEnv() {
  let fileEnv = {};
  try {
    fileEnv = parseDotEnv(await readFile(".env", "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return { ...fileEnv, ...process.env };
}

function parseDotEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function readCalendarConfig(env) {
  const keyFile =
    env.JYOUSENJI_GOOGLE_SERVICE_ACCOUNT_FILE ??
    env.TEMPLEDB_GOOGLE_SERVICE_ACCOUNT_FILE;
  const calendarId = env.JYOUSENJI_GOOGLE_CALENDAR_ID;
  if (!keyFile) {
    throw new Error(
      "JYOUSENJI_GOOGLE_SERVICE_ACCOUNT_FILE を .env に設定してください",
    );
  }
  if (!calendarId) {
    throw new Error("JYOUSENJI_GOOGLE_CALENDAR_ID を .env に設定してください");
  }
  return {
    serviceAccountFile: keyFile,
    calendarId,
    serviceAccount: JSON.parse(readFileSync(keyFile, "utf8")),
  };
}

async function getServiceAccountAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64Url(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  )}.${base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  )}`;
  const signature = crypto.sign(
    "RSA-SHA256",
    Buffer.from(unsigned),
    serviceAccount.private_key,
  );
  const assertion = `${unsigned}.${base64Url(signature)}`;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  }).toString();
  const response = await requestJson(
    "POST",
    "https://oauth2.googleapis.com/token",
    {
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": String(Buffer.byteLength(body)),
      },
      label: "Google OAuth token",
    },
  );
  return response.access_token;
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

class GoogleCalendarClient {
  constructor({ accessToken, calendarId }) {
    this.accessToken = accessToken;
    this.calendarId = calendarId;
  }

  async listEvents(window) {
    const params = new URLSearchParams({
      timeMin: window.timeMin,
      timeMax: window.timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      showDeleted: "false",
    });
    const response = await this.request(
      "GET",
      `/events?${params.toString()}`,
      undefined,
      "Google Calendar list events",
    );
    return response.items ?? [];
  }

  async createEvent(event) {
    return this.request(
      "POST",
      "/events",
      event,
      "Google Calendar create event",
    );
  }

  async updateEvent(eventId, event) {
    return this.request(
      "PATCH",
      `/events/${encodeURIComponent(eventId)}`,
      event,
      "Google Calendar update event",
    );
  }

  async request(method, path, body, label) {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      this.calendarId,
    )}${path}`;
    return requestJson(method, url, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      label,
    });
  }
}

function requestJson(method, url, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = { ...(options.headers ?? {}) };
    if (options.body && !headers["Content-Length"]) {
      headers["Content-Length"] = String(Buffer.byteLength(options.body));
    }
    const request = https.request(url, { method, headers }, (response) => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(
            new Error(
              `${options.label ?? "HTTP request"} failed (${response.statusCode}): ${data.slice(0, 500)}`,
            ),
          );
          return;
        }
        resolve(data ? JSON.parse(data) : {});
      });
    });
    request.on("error", (error) => reject(error));
    if (options.body) {
      request.write(options.body);
    }
    request.end();
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCalendarSync().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
