import Link from "next/link";
import { Suspense } from "react";
import { listEvents, listTags } from "@/lib/events";

async function TagFilter({ active, q }: { active?: string; q?: string }) {
  const tags = await listTags();
  if (tags.length === 0) return null;
  const chip = "rounded-full px-3 py-1 text-sm";
  const idle = "bg-zinc-100 dark:bg-zinc-800";
  const on = "bg-foreground text-background";
  const href = (tag?: string) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };
  return (
    <ul className="mb-6 flex flex-wrap gap-2">
      <li>
        <Link href={href()} className={`${chip} ${active ? idle : on}`}>
          all
        </Link>
      </li>
      {tags.map((t) => (
        <li key={t.name}>
          <Link
            href={href(t.name)}
            className={`${chip} ${active === t.name ? on : idle}`}
          >
            {t.name} <span className="opacity-60">{t.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function EventList({ tag, q }: { tag?: string; q?: string }) {
  const events = await listEvents({ tag, q });
  if (events.length === 0) {
    return tag || q ? (
      <p className="text-zinc-500">
        No events found
        {q ? <> matching “{q}”</> : null}
        {tag ? <> tagged “{tag}”</> : null}. <Link href="/" className="underline">Show all</Link>.
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

function SearchBox({ q, tag }: { q?: string; tag?: string }) {
  return (
    <form action="/" className="mb-6 flex gap-2">
      {tag && <input type="hidden" name="tag" value={tag} />}
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search titles, notes and tags…"
        className="min-w-0 flex-1 rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
      />
      <button className="rounded-md bg-foreground px-4 py-2 text-background">Search</button>
      {q && (
        <Link
          href={tag ? `/?tag=${encodeURIComponent(tag)}` : "/"}
          className="self-center text-sm underline"
        >
          Clear
        </Link>
      )}
    </form>
  );
}

async function Content({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[]; q?: string | string[] }>;
}) {
  const { tag, q } = await searchParams;
  const activeTag = typeof tag === "string" && tag ? tag : undefined;
  const query = typeof q === "string" && q.trim() ? q.trim() : undefined;
  return (
    <>
      <SearchBox q={query} tag={activeTag} />
      <TagFilter active={activeTag} q={query} />
      <EventList tag={activeTag} q={query} />
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
