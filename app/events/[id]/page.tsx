import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Markdown from "react-markdown";
import { addPhotosToEvent, deleteEvent, updateTags } from "@/lib/actions";
import { getEvent } from "@/lib/events";

async function EventView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  const event = Number.isInteger(eventId) ? await getEvent(eventId) : null;
  if (!event) notFound();

  return (
    <article className="space-y-6">
      <header>
        <p className="text-sm text-zinc-500">{event.event_date}</p>
        <h1 className="text-3xl font-semibold">{event.title}</h1>
        {event.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {event.tags.map((t) => (
              <li key={t}>
                <Link
                  href={`/?tag=${encodeURIComponent(t)}`}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="space-y-3 leading-relaxed [&_a]:underline [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
        <Markdown>{event.body}</Markdown>
      </div>

      {event.photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {event.photos.map((p) => (
            <li key={p.id}>
              <a href={`/uploads/${p.filename}`} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/uploads/${p.thumb}`}
                  alt=""
                  className="aspect-square w-full rounded-md object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      )}

      <form action={addPhotosToEvent} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="event_id" value={event.id} />
        <input name="photos" type="file" accept="image/*" multiple required className="text-sm" />
        <button className="rounded-md border border-black/20 px-3 py-1.5 text-sm dark:border-white/25">
          Add photos
        </button>
      </form>

      <form action={updateTags} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="event_id" value={event.id} />
        <input
          name="tags"
          defaultValue={event.tags.join(", ")}
          placeholder="family, trip, birthday"
          className="min-w-48 flex-1 rounded-md border border-black/20 bg-transparent px-3 py-1.5 text-sm dark:border-white/25"
        />
        <button className="rounded-md border border-black/20 px-3 py-1.5 text-sm dark:border-white/25">
          Save tags
        </button>
      </form>

      <form action={deleteEvent}>
        <input type="hidden" name="event_id" value={event.id} />
        <button className="text-sm text-red-600 underline">Delete event</button>
      </form>
    </article>
  );
}

export default function EventPage({ params }: PageProps<"/events/[id]">) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
      <EventView params={params} />
    </Suspense>
  );
}
