import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { SeriesPost } from '../content/schema';

export type SeriesEntry = CollectionEntry<'blog'> & { data: SeriesPost };

export type Series = {
  name: string;
  title: string;
  description?: string;
  cover?: string;
  parts: SeriesEntry[];
  overviewUrl: string;
};

export function getSeriesOverviewUrl(name: string): string {
  return `/blog/${name}`;
}

function buildSeries(name: string, parts: SeriesEntry[]): Series {
  const sorted = [...parts].sort((a, b) => a.data.part - b.data.part);
  const first = sorted[0];
  return {
    name,
    title: first.data.seriesTitle ?? name,
    description: first.data.seriesDescription,
    cover: first.data.cover,
    parts: sorted,
    overviewUrl: getSeriesOverviewUrl(name),
  };
}

async function getPublishedSeriesParts(): Promise<SeriesEntry[]> {
  const all = await getCollection('blog');
  return all.filter((p): p is SeriesEntry =>
    p.data.type === 'seriesPart' && !p.data.draft
  );
}

export async function getAllSeries(): Promise<Series[]> {
  const parts = await getPublishedSeriesParts();
  const groups = new Map<string, SeriesEntry[]>();
  for (const part of parts) {
    const list = groups.get(part.data.series) ?? [];
    list.push(part);
    groups.set(part.data.series, list);
  }
  const series = [...groups.entries()].map(([name, parts]) => buildSeries(name, parts));
  return series.sort((a, b) =>
    b.parts[0].data.date.valueOf() - a.parts[0].data.date.valueOf()
  );
}

export async function getSeries(name: string): Promise<Series | null> {
  const parts = (await getPublishedSeriesParts()).filter((p) => p.data.series === name);
  if (parts.length === 0) return null;
  return buildSeries(name, parts);
}

export function getSeriesNavigation(series: Series, currentSlug: string): {
  prev: SeriesEntry | null;
  next: SeriesEntry | null;
} {
  const idx = series.parts.findIndex((p) => p.id === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? series.parts[idx - 1] : null,
    next: idx < series.parts.length - 1 ? series.parts[idx + 1] : null,
  };
}
