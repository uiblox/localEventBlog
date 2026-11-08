import Link from "next/link";
import { Suspense } from "react";
import { listEvents, listTags } from "@/lib/events";

async function TagFilter({ active }: { active?: string }) {
  const tags = await listTags();
  if (tags.length === 0) return null;
  const chip = "rounded-full px-3 py-1 text-sm";
  const idle = "bg-zinc-100 dark:bg-zinc-800";
  const on = "bg-foreground text-background";
  return (
    <ul className="mb-6 flex flex-wrap gap-2">
      <li>
        <Link href="/" className={`${chip} ${active ? idle : on}`}>
          all
        </Link>
      </li>
      {tags.map((t) => (
        <li key={t.name}>
          <Link
            href={`/?tag=${encodeURIComponent(t.name)}`}
            className={`${chip} ${active === t.name ? on : idle}`}
          >
            {t.name} <span className="opacity-60">{t.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function EventList({ tag }: { tag?: string }) {
  const events = await listEvents(tag);
  if (events.length === 0) {
    return tag ? (
      <p className="text-zinc-500">
        No events tagged “{tag}”. <Link href="/" className="underline">Show all</Link>.
      </p>
    ) : (
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
              {e.tags.length > 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  {e.tags.map((t) => `#${t}`).join(" ")}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function Content({ searchParams }: { searchParams: Promise<{ tag?: string | string[] }> }) {
  const { tag } = await searchParams;
  const active = typeof tag === "string" && tag ? tag : undefined;
  return (
    <>
      <TagFilter active={active} />
      <EventList tag={active} />
    </>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
