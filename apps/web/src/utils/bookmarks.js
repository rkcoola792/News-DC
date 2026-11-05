export function loadBookmarks(storage) {
  try {
    const value = JSON.parse(storage.getItem('newsdc-saved'));
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => typeof id === 'string' && id.length > 0))]
      : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(storage, ids) {
  try {
    storage.setItem('newsdc-saved', JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
