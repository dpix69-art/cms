import type { Series, Work } from './schema';

/**
 * Path templates for different asset types
 */
export interface PathTemplates {
  seriesMain: string;
  seriesDetail: string;
  soundCover: string;
  soundPhoto: string;
  statement: string;
  contacts: string;
}

export const defaultPathTemplates: PathTemplates = {
  seriesMain: 'images/{seriesSlug}/{workSlug}.{ext}',
  seriesDetail: 'images/{seriesSlug}/{workSlug}-d-{n}.{ext}',
  soundCover: 'images/covers/{soundSlug}.{ext}',
  soundPhoto: 'images/sounds/{soundSlug}-{n}.{ext}',
  statement: 'images/{filename}.{ext}',
  contacts: 'files/{filename}.{ext}',
};

/**
 * Generate file path from template
 */
export function generatePath(
  template: string,
  variables: Record<string, string | number>
): string {
  let path = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    path = path.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });
  
  return path;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
}

/**
 * Generate suggested paths for work images
 */
export function generateWorkImagePaths(
  series: Series,
  work: Work,
  imageCount: { main: number; detail: number },
  templates: PathTemplates
): { main: string; details: string[] } {
  const ext = 'jpg'; // Default extension
  
  const mainPath = generatePath(templates.seriesMain, {
    seriesSlug: series.slug,
    workSlug: work.slug,
    ext,
  });

  const detailPaths: string[] = [];
  for (let i = 1; i <= imageCount.detail; i++) {
    const detailPath = generatePath(templates.seriesDetail, {
      seriesSlug: series.slug,
      workSlug: work.slug,
      n: i,
      ext: 'png', // Details typically PNG
    });
    detailPaths.push(detailPath);
  }

  return { main: mainPath, details: detailPaths };
}