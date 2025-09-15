import slugify from 'slugify';
import { nanoid } from 'nanoid';

/**
 * Generate URL-safe slug from title
 */
export function makeSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Generate unique ID
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return nanoid(8);
}

/**
 * Check if slug is unique within array
 */
export function isSlugUnique(slug: string, items: Array<{ slug: string }>, excludeIndex?: number): boolean {
  return !items.some((item, index) => 
    item.slug === slug && index !== excludeIndex
  );
}

/**
 * Generate unique slug by appending numbers if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}