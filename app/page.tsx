import Link from "next/link";
import { Suspense } from "react";
import { listEvents } from "@/lib/events";

async function EventList() {
  const events = await listEvents();
  if (events.length === 0) {
    return (
      <p className="text-zinc-500">
        No events yet. <Link href="/events/new" className="underline">Add your first one</Link>.
      </p>
    );
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {events.map((e) => (
        <li key={e.id}>
          <Link
            href={`/events/${e.id}`}
            className="block overflow-hidden rounded-lg border border-black/10 hover:shadow-md dark:border-white/15"
          >
            {e.cover_thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/uploads/${e.cover_thumb}`}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900" />
            )}
            <div className="p-4">
              <p className="text-xs text-zinc-500">{e.event_date}</p>
              <h2 className="font-semibold">{e.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {e.body.replace(/[#*_`>\-]/g, "")}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
      <EventList />
    </Suspense>
  );
}
