/**
 * Convert a name to a URL-safe slug (e.g. "Manchester United" -> "manchester-united")
 * Team slugs are generated client-side since the API only provides id + name.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
