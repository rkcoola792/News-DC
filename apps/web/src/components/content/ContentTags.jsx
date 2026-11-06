export default function ContentTags({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <section className="content-tags" aria-label="Source tags">
      <h2>Source tags</h2>
      <ul>
        {tags.map((tag) => (
          <li key={tag.id}>{tag.name}</li>
        ))}
      </ul>
    </section>
  );
}
