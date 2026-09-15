const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds a pretty-but-stable URL segment: readable slug + real item id. */
export function toPrettyIdUrl(title: string, id: string): string {
  const slug = slugify(title);
  return slug ? `${slug}-${id}` : id;
}

/** Recovers the item id from a "<slug>-<uuid>" URL segment. */
export function extractIdFromParam(param: string): string | null {
  const match = param.match(UUID_RE);
  return match ? match[0] : null;
}
