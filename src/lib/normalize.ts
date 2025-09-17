import type { Content, EditorMetadata, Series, Work, Sale } from './schema';

/**
 * Normalize imported content while preserving original type information
 */
export function normalizeContent(rawContent: any): { content: Content; metadata: EditorMetadata } {
  const metadata: EditorMetadata = {
    seriesIntroTypes: {},
    originalContent: undefined,
  };

  // Track original intro types per series
  if (Array.isArray(rawContent?.series)) {
    for (const series of rawContent.series) {
      if (series?.slug) {
        const t = Array.isArray(series?.intro) ? 'array' : 'string';
        metadata.seriesIntroTypes[series.slug] = t as 'string' | 'array';
      }
    }
  }

  // Build normalized content with safe fallbacks
  const normalized: Content = {
    site: {
      artistName: String(rawContent?.site?.artistName ?? ''),
      role: String(rawContent?.site?.role ?? ''),
      statement: String(rawContent?.site?.statement ?? ''),
    },
    nav: Array.isArray(rawContent?.nav) ? rawContent!.nav.map((n: any) => ({
      label: String(n?.label ?? ''),
      href: String(n?.href ?? ''),
    })) : [],
    series: Array.isArray(rawContent?.series) ? rawContent!.series.map(normalizeSeries) : [],
    sounds: Array.isArray(rawContent?.sounds) ? rawContent!.sounds.map(normalizeSound) : [],
    statement: {
      portrait: String(rawContent?.statement?.portrait ?? ''),
      paragraphs: Array.isArray(rawContent?.statement?.paragraphs) ? rawContent!.statement!.paragraphs.map((p: any) => String(p ?? '')).filter(Boolean) : [],
      exhibitions: Array.isArray(rawContent?.statement?.exhibitions) ? rawContent!.statement!.exhibitions.map((e: any) => ({
        year: String(e?.year ?? ''),
        event: String(e?.event ?? ''),
      })) : [],
      pressKitPdf: rawContent?.statement?.pressKitPdf ? String(rawContent.statement.pressKitPdf) : undefined,
    },
    contacts: {
      email: rawContent?.contacts?.email ? String(rawContent.contacts.email) : undefined,
      city: rawContent?.contacts?.city ? String(rawContent.contacts.city) : undefined,
      country: rawContent?.contacts?.country ? String(rawContent.contacts.country) : undefined,
      introText: rawContent?.contacts?.introText ? String(rawContent.contacts.introText) : undefined,
      openToText: rawContent?.contacts?.openToText ? String(rawContent.contacts.openToText) : undefined,
      portfolioPdf: rawContent?.contacts?.portfolioPdf ? String(rawContent.contacts.portfolioPdf) : undefined,
      socials: Array.isArray(rawContent?.contacts?.socials) ? rawContent!.contacts!.socials.map((s: any) => ({
        label: String(s?.label ?? ''),
        href: String(s?.href ?? ''),
      })) : [],
    },
    impressum: {
      paragraphs: Array.isArray(rawContent?.impressum?.paragraphs) ? rawContent!.impressum!.paragraphs.map((p: any) => String(p ?? '')).filter(Boolean) : [],
    },
    footer: {
      legal: String(rawContent?.footer?.legal ?? ''),
      copyright: String(rawContent?.footer?.copyright ?? ''),
    },
  };

  metadata.originalContent = normalized;
  return { content: normalized, metadata };
}

function normalizeSeries(s: any): Series {
  return {
    slug: String(s?.slug ?? ''),
    title: String(s?.title ?? ''),
    year: String(s?.year ?? ''),
    intro: Array.isArray(s?.intro) ? s.intro.map((p: any) => String(p ?? '')) : String(s?.intro ?? ''),
    artworkImages: Array.isArray(s?.artworkImages) ? s.artworkImages.map((x: any) => String(x ?? '')).filter(Boolean) : [],
    works: Array.isArray(s?.works) ? s.works.map(normalizeWork) : [],
  };
}

function normalizeWork(w: any): Work {
  const sale: Sale | undefined = normalizeSale(w?.sale);
  return {
    slug: String(w?.slug ?? ''),
    title: String(w?.title ?? ''),
    year: Number(w?.year ?? 0),
    technique: typeof w?.technique === 'string' ? w.technique : undefined,
    dimensions: typeof w?.dimensions === 'string' ? w.dimensions : undefined,
    images: Array.isArray(w?.images) ? w.images.map((img: any) => ({
      url: String((typeof img === 'string' ? img : (img?.url ?? ''))).trim(),
      role: (typeof img === 'object' && (img?.role === 'main' || img?.role === 'detail')) ? img.role : 'detail',
    })) : [],
    sale,
  };
}

function normalizeSale(input: any): Sale | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const availability = (['available','reserved','sold','not_for_sale'] as const).includes(input.availability)
    ? input.availability
    : 'available';
  if (input.price && typeof input.price === 'object') {
    const mode = input.price.mode === 'fixed' ? 'fixed' : 'on_request';
    const amount = mode === 'fixed' ? Number(input.price.amount ?? 0) : undefined;
    const currency = input.price.currency ? String(input.price.currency) : 'EUR';
    return {
      availability,
      price: mode === 'fixed' ? { mode, amount, currency } : { mode },
      notes: typeof input.notes === 'string' ? input.notes : undefined,
    };
  }
  return {
    availability,
    notes: typeof input.notes === 'string' ? input.notes : undefined,
  };
}

function normalizeSound(s: any) {
  return {
    slug: String(s?.slug ?? ''),
    title: String(s?.title ?? ''),
    year: Number(s?.year ?? 0),
    platform: (s?.platform === 'bandcamp' || s?.platform === 'soundcloud') ? s.platform : 'soundcloud',
    pageUrl: typeof s?.pageUrl === 'string' && s.pageUrl ? String(s.pageUrl) : undefined,
    cover: String(s?.cover ?? ''),
    embed: String(s?.embed ?? ''),
    tracks: Array.isArray(s?.tracks) ? s.tracks.map((t: any) => (typeof t === 'string' ? { title: t } : { title: String(t?.title ?? ''), duration: t?.duration ? String(t.duration) : undefined })).filter((t: any) => t.title) : undefined,
    meta: s?.meta && typeof s.meta === 'object' ? {
      label: s.meta.label ? String(s.meta.label) : undefined,
      platforms: Array.isArray(s.meta.platforms) ? s.meta.platforms.map((p: any) => String(p ?? '')).filter(Boolean) : [],
    } : { label: undefined, platforms: [] },
    photos: Array.isArray(s?.photos) ? s.photos.map((p: any) => (typeof p === 'string' ? { url: p } : { url: String(p?.url ?? ''), alt: p?.alt ? String(p.alt) : undefined })).filter((p: any) => p.url) : undefined,
    bodyBlocks: Array.isArray(s?.bodyBlocks) ? s.bodyBlocks.map((b: any) => ({ type: String(b?.type ?? 'p'), text: String(b?.text ?? '') })).filter((b: any) => b.text) : undefined,
  };
}

/**
 * Restore original types on export (series.intro string vs array)
 */
export function denormalizeContent(content: Content, metadata: EditorMetadata): Content {
  const exported: Content = JSON.parse(JSON.stringify(content));

  exported.series = exported.series.map((series) => {
    const original = metadata.seriesIntroTypes[series.slug];
    if (original === 'array' && typeof series.intro === 'string') {
      return { ...series, intro: [series.intro] };
    }
    if (original === 'string' && Array.isArray(series.intro)) {
      return { ...series, intro: series.intro.join('\n') };
    }
    return series;
  });

  return exported;
}

/** Factories */
export function createEmptySeries(): Series {
  return {
    slug: '',
    title: '',
    year: new Date().getFullYear().toString(),
    intro: '',
    artworkImages: [],
    works: [],
  };
}

export function createEmptyWork(): Work {
  return {
    slug: '',
    title: '',
    year: new Date().getFullYear(),
    technique: '',
    dimensions: '',
    images: [],
    sale: { availability: 'available', price: { mode: 'on_request' } },
  };
}

export function createEmptySound() {
  return {
    slug: '',
    title: '',
    year: new Date().getFullYear(),
    platform: 'soundcloud' as const,
    pageUrl: undefined,
    cover: '',
    embed: '',
    tracks: [],
    meta: { label: undefined, platforms: [] },
    photos: [],
    bodyBlocks: [],
  };
}
