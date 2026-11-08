import { Suspense } from "react";
import { connection } from "next/server";
import { createEvent } from "@/lib/actions";

const input =
  "w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25";

async function DateField() {
  await connection();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return <input name="event_date" type="date" required defaultValue={today} className={input} />;
}

export default function NewEventPage() {
  return (
    <form action={createEvent} className="space-y-5">
      <h1 className="text-2xl font-semibold">New event</h1>
      <label className="block space-y-1">
        <span className="text-sm">Title</span>
        <input name="title" required className={input} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Date</span>
        <Suspense fallback={<input name="event_date" type="date" required className={input} />}>
          <DateField />
        </Suspense>
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Notes (Markdown supported)</span>
        <textarea name="body" rows={10} className={input} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Tags (comma separated)</span>
        <input name="tags" placeholder="family, trip, birthday" className={input} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">Photos</span>
        <input name="photos" type="file" accept="image/*" multiple className={input} />
      </label>
      <button className="rounded-md bg-foreground px-4 py-2 text-background">Save event</button>
    </form>
  );
}
