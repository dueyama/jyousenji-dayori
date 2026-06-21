import type { CollectionEntry } from "astro:content";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toUtcStamp(value: string): string {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function toDateValue(value: string): string {
  return value.slice(0, 10).replace(/-/g, "");
}

function toExclusiveDateValue(value: string): string {
  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map((part) => Number.parseInt(part, 10));
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export function eventToIcs(
  entry: CollectionEntry<"events">,
  siteUrl: string,
): string {
  const { data } = entry;
  const allDay = data.allDay;
  const startLine = allDay
    ? `DTSTART;VALUE=DATE:${toDateValue(data.startAt)}`
    : `DTSTART:${toUtcStamp(data.startAt)}`;
  const endLine = allDay
    ? `DTEND;VALUE=DATE:${toExclusiveDateValue(data.endAt)}`
    : `DTEND:${toUtcStamp(data.endAt)}`;
  const status = data.status === "cancelled" ? "CANCELLED" : "CONFIRMED";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jyousenji//Dayori PWA//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${data.id}@jyousenji-dayori`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    startLine,
    endLine,
    `SUMMARY:${escapeIcsText(data.title)}`,
    `DESCRIPTION:${escapeIcsText(data.summary)}`,
    `LOCATION:${escapeIcsText(data.location)}`,
    `STATUS:${status}`,
    `URL:${siteUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
