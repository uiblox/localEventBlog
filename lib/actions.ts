"use server";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import db, { UPLOAD_DIR } from "./db";

async function savePhoto(file: File) {
  const id = randomUUID();
  const input = Buffer.from(await file.arrayBuffer());
  const filename = `${id}.jpg`;
  const thumb = `${id}-thumb.jpg`;
  await sharp(input)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(path.join(UPLOAD_DIR, filename));
  await sharp(input)
    .rotate()
    .resize({ width: 480, height: 480, fit: "cover" })
    .jpeg({ quality: 80 })
    .toFile(path.join(UPLOAD_DIR, thumb));
  return { filename, thumb };
}

async function addPhotos(eventId: number, files: FormDataEntryValue[]) {
  const insert = db.prepare("INSERT INTO photos (event_id, filename, thumb) VALUES (?, ?, ?)");
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    try {
      const saved = await savePhoto(file);
      insert.run(eventId, saved.filename, saved.thumb);
    } catch {
      // not a readable image; skip it
    }
  }
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("event_date") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("A title and a valid date are required.");
  }
  const { lastInsertRowid } = db
    .prepare("INSERT INTO events (title, event_date, body) VALUES (?, ?, ?)")
    .run(title, date, body);
  const id = Number(lastInsertRowid);
  await addPhotos(id, formData.getAll("photos"));
  revalidatePath("/");
  redirect(`/events/${id}`);
}

export async function addPhotosToEvent(formData: FormData) {
  const id = Number(formData.get("event_id"));
  if (!Number.isInteger(id)) throw new Error("Invalid event.");
  await addPhotos(id, formData.getAll("photos"));
  revalidatePath(`/events/${id}`);
  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  const id = Number(formData.get("event_id"));
  if (!Number.isInteger(id)) throw new Error("Invalid event.");
  const photos = db
    .prepare("SELECT filename, thumb FROM photos WHERE event_id = ?")
    .all(id) as { filename: string; thumb: string }[];
  db.prepare("DELETE FROM events WHERE id = ?").run(id);
  await Promise.all(
    photos.flatMap((p) => [
      fs.rm(path.join(UPLOAD_DIR, p.filename), { force: true }),
      fs.rm(path.join(UPLOAD_DIR, p.thumb), { force: true }),
    ]),
  );
  revalidatePath("/");
  redirect("/");
}
