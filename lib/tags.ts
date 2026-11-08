import db from "./db";

// "Road Trip, family,  road trip" -> ["road trip", "family"]
export function parseTags(input: string): string[] {
  const names = input
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 30))
    .filter(Boolean);
  return [...new Set(names)].slice(0, 20);
}

export function setEventTags(eventId: number, names: string[]) {
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM event_tags WHERE event_id = ?").run(eventId);
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
    const link = db.prepare(
      "INSERT INTO event_tags (event_id, tag_id) SELECT ?, id FROM tags WHERE name = ?",
    );
    for (const name of names) {
      insertTag.run(name);
      link.run(eventId, name);
    }
    // drop tags no event uses any more
    db.prepare("DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM event_tags)").run();
  });
  replace();
}
