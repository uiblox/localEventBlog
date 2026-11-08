import { connection } from "next/server";
import db from "./db";

export type BlogEvent = {
  id: number;
  title: string;
  event_date: string;
  body: string;
  cover_thumb: string | null;
  tags: string[];
};

export type Photo = { id: number; filename: string; thumb: string };

// better-sqlite3 is synchronous, so connection() keeps queries out of prerendering.
export async function listEvents(tag?: string): Promise<BlogEvent[]> {
  await connection();
  const rows = db
    .prepare(
      `SELECT e.id, e.title, e.event_date, e.body,
              (SELECT thumb FROM photos WHERE event_id = e.id ORDER BY id LIMIT 1) AS cover_thumb,
              (SELECT group_concat(t.name, ',') FROM event_tags et
                 JOIN tags t ON t.id = et.tag_id WHERE et.event_id = e.id) AS tag_list
       FROM events e
       WHERE @tag IS NULL OR EXISTS (
         SELECT 1 FROM event_tags et JOIN tags t ON t.id = et.tag_id
         WHERE et.event_id = e.id AND t.name = @tag)
       ORDER BY e.event_date DESC, e.id DESC`,
    )
    .all({ tag: tag ?? null }) as (Omit<BlogEvent, "tags"> & { tag_list: string | null })[];
  return rows.map(({ tag_list, ...e }) => ({
    ...e,
    tags: tag_list ? tag_list.split(",").sort() : [],
  }));
}

export async function listTags(): Promise<{ name: string; count: number }[]> {
  await connection();
  return db
    .prepare(
      `SELECT t.name, COUNT(et.event_id) AS count
       FROM tags t JOIN event_tags et ON et.tag_id = t.id
       GROUP BY t.id ORDER BY t.name`,
    )
    .all() as { name: string; count: number }[];
}

export async function getEvent(id: number) {
  await connection();
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as
    | { id: number; title: string; event_date: string; body: string }
    | undefined;
  if (!event) return null;
  const photos = db
    .prepare("SELECT id, filename, thumb FROM photos WHERE event_id = ? ORDER BY id")
    .all(id) as Photo[];
  const tags = (
    db
      .prepare(
        `SELECT t.name FROM tags t JOIN event_tags et ON et.tag_id = t.id
         WHERE et.event_id = ? ORDER BY t.name`,
      )
      .all(id) as { name: string }[]
  ).map((t) => t.name);
  return { ...event, photos, tags };
}
