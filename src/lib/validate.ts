import type { Content } from './schema';

export interface ValidationError {
  path: string;
  message: string;
  type: 'error' | 'warning';
}

/**
 * Validate uniqueness of slugs and other business rules
 */
export function validateContent(content: Content): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check series slug uniqueness
  const seriesSlugs = new Set<string>();
  content.series.forEach((series, index) => {
    if (!series.slug) {
      errors.push({
        path: `series[${index}].slug`,
        message: 'Series slug is required',
        type: 'error',
      });
    } else if (seriesSlugs.has(series.slug)) {
      errors.push({
        path: `series[${index}].slug`,
        message: `Duplicate series slug: ${series.slug}`,
        type: 'error',
      });
    } else {
      seriesSlugs.add(series.slug);
    }

    // Check work slug uniqueness within series
    const workSlugs = new Set<string>();
    series.works.forEach((work, workIndex) => {
      if (!work.slug) {
        errors.push({
          path: `series[${index}].works[${workIndex}].slug`,
          message: 'Work slug is required',
          type: 'error',
        });
      } else if (workSlugs.has(work.slug)) {
        errors.push({
          path: `series[${index}].works[${workIndex}].slug`,
          message: `Duplicate work slug in series ${series.slug}: ${work.slug}`,
          type: 'error',
        });
      } else {
        workSlugs.add(work.slug);
      }

      // Validate work images
      work.images.forEach((image, imageIndex) => {
        if (!image.url) {
          errors.push({
            path: `series[${index}].works[${workIndex}].images[${imageIndex}].url`,
            message: 'Image URL is required',
            type: 'error',
          });
        }
        if (!image.role || !['main', 'detail'].includes(image.role)) {
          errors.push({
            path: `series[${index}].works[${workIndex}].images[${imageIndex}].role`,
            message: 'Image role must be "main" or "detail"',
            type: 'error',
          });
        }
      });

      // Check for at least one main image per work
      const hasMainImage = work.images.some((img) => img.role === 'main');
      if (work.images.length > 0 && !hasMainImage) {
        errors.push({
          path: `series[${index}].works[${workIndex}].images`,
          message: 'Each work should have at least one main image',
          type: 'warning',
        });
      }
    });
  });

  // Check sounds slug uniqueness
  const soundSlugs = new Set<string>();
  content.sounds.forEach((sound, index) => {
    if (!sound.slug) {
      errors.push({
        path: `sounds[${index}].slug`,
        message: 'Sound slug is required',
        type: 'error',
      });
    } else if (soundSlugs.has(sound.slug)) {
      errors.push({
        path: `sounds[${index}].slug`,
        message: `Duplicate sound slug: ${sound.slug}`,
        type: 'error',
      });
    } else {
      soundSlugs.add(sound.slug);
    }

    // Validate URLs
    if (sound.embed) {
      try {
        new URL(sound.embed);
      } catch {
        errors.push({
          path: `sounds[${index}].embed`,
          message: 'Embed must be a valid URL',
          type: 'error',
        });
      }
    }

    if (sound.pageUrl) {
      try {
        new URL(sound.pageUrl);
      } catch {
        errors.push({
          path: `sounds[${index}].pageUrl`,
          message: 'Page URL must be a valid URL',
          type: 'error',
        });
      }
    }
  });

  // Validate nav links
  content.nav.forEach((navItem, index) => {
    if (navItem.href && !navItem.href.startsWith('#') && !navItem.href.startsWith('mailto:')) {
      try {
        new URL(navItem.href);
      } catch {
        errors.push({
          path: `nav[${index}].href`,
          message: 'Nav href must be a valid URL, # link, or mailto: link',
          type: 'warning',
        });
      }
    }
  });

  // Validate contacts email
  if (content.contacts.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(content.contacts.email)) {
      errors.push({
        path: 'contacts.email',
        message: 'Must be a valid email address',
        type: 'error',
      });
    }
  }

  // Validate social links
  content.contacts.socials.forEach((social, index) => {
    if (social.href) {
      try {
        new URL(social.href);
      } catch {
        errors.push({
          path: `contacts.socials[${index}].href`,
          message: 'Social href must be a valid URL',
          type: 'error',
        });
      }
    }
  });

  return errors;
}

/**
 * Check if content has any validation errors (not warnings)
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.some((error) => error.type === 'error');
}