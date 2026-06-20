const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
  timeZone: "Asia/Tokyo",
});

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function sortByNewest<T extends { data: { publishedAt: string } }>(
  items: T[],
): T[] {
  return items.toSorted(
    (a, b) =>
      new Date(b.data.publishedAt).getTime() -
      new Date(a.data.publishedAt).getTime(),
  );
}

export function sortEventsByStart<T extends { data: { startAt: string } }>(
  items: T[],
): T[] {
  return items.toSorted(
    (a, b) =>
      new Date(a.data.startAt).getTime() - new Date(b.data.startAt).getTime(),
  );
}

export function isFutureOrToday(value: string, now = new Date()): boolean {
  const date = new Date(value);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return date.getTime() >= startOfToday.getTime();
}
