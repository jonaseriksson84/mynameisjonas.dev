import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection('blog');
  return posts.filter((post) => !post.data.draft);
}
