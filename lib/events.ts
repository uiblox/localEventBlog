import { connection } from "next/server";
import db from "./db";

export type BlogEvent = {
  id: number;
  title: string;
  event_date: string;
  body: string;
  cover_thumb: string | null;
};

export type Photo = { id: number; filename: string; thumb: string };

// better-sqlite3 is synchronous, so connection() keeps queries out of prerendering.
export async function listEvents(): Promise<BlogEvent[]> {
  await connection();
  return db
    .prepare(
      `SELECT e.id, e.title, e.event_date, e.body,
              (SELECT thumb FROM photos WHERE event_id = e.id ORDER BY id LIMIT 1) AS cover_thumb
       FROM events e ORDER BY e.event_date DESC, e.id DESC`,
    )
    .all() as BlogEvent[];
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
  return { ...event, photos };
}
