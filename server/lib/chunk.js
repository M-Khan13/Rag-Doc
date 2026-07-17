const DEFAULTS = { size: 800, overlap: 100 };

export function chunkPage(text, page, opts = {}) {
  const { size, overlap } = { ...DEFAULTS, ...opts };
  if (overlap >= size) throw new Error('overlap must be smaller than size');

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const content = text.slice(start, end).trim();

    if (content.length > 0) {
      chunks.push({ content, page, charStart: start, charEnd: end });
    }

    if (end === text.length) break;
    start = end - overlap;
  }

  return chunks;
}

export function chunkPages(pages, opts = {}) {
  return pages
    .flatMap((p, i) => chunkPage(p.text, p.num ?? i + 1, opts))
    .map((chunk, i) => ({ ...chunk, chunkIndex: i }));
}
