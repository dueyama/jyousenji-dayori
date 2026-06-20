import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const contentId = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "英小文字、数字、ハイフンのみを使ってください",
  );

const jstDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/,
    "ISO 8601形式で日本標準時 +09:00 を明示してください",
  );

const nullableImageAlt = z.string().trim().min(1).nullable();

const notices = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notices" }),
  schema: ({ image }) =>
    z.object({
      id: contentId,
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1).max(120),
      publishedAt: jstDateTime,
      updatedAt: jstDateTime.nullable(),
      category: z.string().trim().min(1),
      heroImage: image().nullable().optional(),
      heroAlt: nullableImageAlt,
      draft: z.boolean(),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/events" }),
  schema: ({ image }) =>
    z
      .object({
        id: contentId,
        title: z.string().trim().min(1),
        summary: z.string().trim().min(1).max(120),
        startAt: jstDateTime,
        endAt: jstDateTime,
        allDay: z.boolean(),
        location: z.string().trim().min(1),
        status: z.enum(["scheduled", "cancelled", "postponed"]),
        heroImage: image().nullable().optional(),
        heroAlt: nullableImageAlt,
        draft: z.boolean(),
      })
      .refine(
        (data) =>
          new Date(data.endAt).getTime() >= new Date(data.startAt).getTime(),
        {
          message: "endAt は startAt 以後にしてください",
          path: ["endAt"],
        },
      ),
});

export const collections = { notices, events };
