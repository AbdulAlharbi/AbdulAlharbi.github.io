/**
 * Typed access to the data layer. Templates go through these two functions
 * rather than calling astro:content directly, so ordering and the singleton
 * lookup live in one place.
 */
import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';

/** Every collection except the site singleton carries an `order` field. */
type OrderedCollection = Exclude<CollectionKey, 'site'>;

/** A collection's entries in display order. */
export async function getOrdered<C extends OrderedCollection>(name: C): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(name);
  return entries.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}

/** The site-wide config. There is exactly one entry, so a miss is a build error. */
export async function getSite(): Promise<CollectionEntry<'site'>['data']> {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('src/data/site.yaml is missing or failed validation');
  return entry.data;
}
