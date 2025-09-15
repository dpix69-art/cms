import type { Content, EditorMetadata, Series } from './schema';

/**
 * Normalize imported content while preserving original type information
 */
export function normalizeContent(rawContent: any): { content: Content; metadata: EditorMetadata } {
  const metadata: EditorMetadata = {
    seriesIntroTypes: {},
    originalContent: undefined,
  };

  // Track original intro types for series
  if (rawContent.series && Array.isArray(rawContent.series)) {
    rawContent.series.forEach((series: any) => {
      if (series.slug && series.intro) {
        metadata.seriesIntroTypes[series.slug] = Array.isArray(series.intro) ? 'array' : 'string';
      }
    });
  }

  // Ensure all required fields have defaults
  const normalized = {
    site: {
      artistName: rawContent.site?.artistName || '',
      role: rawContent.site?.role || '',
      statement: rawContent.site?.statement || '',
    },
    nav: rawContent.nav || [],
    series: rawContent.series || [],
    sounds: rawContent.sounds || [],
    statement: {
      portrait: rawContent.statement?.portrait || '',
      paragraphs: rawContent.statement?.paragraphs || [],
      exhibitions: rawContent.statement?.exhibitions || [],
      pressKitPdf: rawContent.statement?.pressKitPdf || '',
    },
    contacts: {
      email: rawContent.contacts?.email || '',
      city: rawContent.contacts?.city || '',
      country: rawContent.contacts?.country || '',
      introText: rawContent.contacts?.introText || '',
      openToText: rawContent.contacts?.openToText || '',
      portfolioPdf: rawContent.contacts?.portfolioPdf || '',
      socials: rawContent.contacts?.socials || [],
    },
    impressum: {
      paragraphs: rawContent.impressum?.paragraphs || [],
    },
    footer: {
      legal: rawContent.footer?.legal || '',
      copyright: rawContent.footer?.copyright || '',
    },
  };

  metadata.originalContent = normalized as Content;

  return { content: normalized as Content, metadata };
}

/**
 * Restore original types when exporting content
 */
export function denormalizeContent(content: Content, metadata: EditorMetadata): Content {
  const exported = structuredClone(content);

  // Restore original intro types for series
  exported.series = exported.series.map((series) => {
    const originalType = metadata.seriesIntroTypes[series.slug];
    if (originalType === 'array' && typeof series.intro === 'string') {
      // Convert string back to array if it was originally an array
      return { ...series, intro: [series.intro] };
    } else if (originalType === 'string' && Array.isArray(series.intro)) {
      // Convert array back to string if it was originally a string
      return { ...series, intro: series.intro.join('\n') };
    }
    return series;
  });

  return exported;
}

/**
 * Trim whitespace safely without altering special characters
 */
export function safeTrim(str: string): string {
  return str.replace(/^\s+|\s+$/g, '');
}

/**
 * Create a default empty series
 */
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

/**
 * Create a default empty work
 */
export function createEmptyWork() {
  return {
    slug: '',
    title: '',
    year: new Date().getFullYear(),
    technique: '',
    dimensions: '',
    images: [],
  };
}

/**
 * Create a default empty sound
 */
export function createEmptySound() {
  return {
    slug: '',
    title: '',
    year: new Date().getFullYear(),
    platform: 'soundcloud' as const,
    pageUrl: '',
    cover: '',
    embed: '',
    tracks: [],
    meta: { label: '', platforms: [] },
    photos: [],
    bodyBlocks: [],
  };
}