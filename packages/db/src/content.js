// Application reads/writes use Prisma Client; snake_case maps the existing database.
export function createContent(db, item) {
  return db.content_items.create({
    data: {
      content_type: item.contentType,
      title: item.title,
      url: item.url,
      description: item.description ?? null,
      publisher_id: item.publisherId ?? null,
      source_id: item.sourceId ?? null,
      author: item.author ?? null,
      published_at: item.publishedAt == null ? null : new Date(item.publishedAt),
      thumbnail_url: item.thumbnailUrl ?? null,
      duration_seconds: item.durationSeconds ?? null,
      metadata: item.metadata ?? {},
      canonical_url: item.canonicalUrl ?? null,
    },
  });
}
export function getContentById(db, id) {
  return db.content_items.findUnique({ where: { id } });
}
