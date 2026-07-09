const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Tokyo",
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  timeZone: "Asia/Tokyo",
});

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatEventSchedule(data: {
  startAt: string;
  endAt: string;
  allDay: boolean;
}): string {
  if (!data.allDay) {
    return formatDateTime(data.startAt);
  }

  const startDate = formatDate(data.startAt);
  const endDate = formatDate(data.endAt);
  if (data.startAt.slice(0, 10) === data.endAt.slice(0, 10)) {
    return `${startDate}（終日）`;
  }
  return `${startDate}〜${endDate}（終日）`;
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
