import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { eventToIcs } from "../../lib/ics";
import { absoluteSiteUrl } from "../../lib/urls";

export async function getStaticPaths() {
  const events = await getCollection("events", ({ data }) => !data.draft);
  return events.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props, site }) => {
  const entry = props.entry;
  const url = absoluteSiteUrl(site, `/events/${entry.id}/`);

  return new Response(eventToIcs(entry, url), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${entry.id}.ics"`,
    },
  });
};
