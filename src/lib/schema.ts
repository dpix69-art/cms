import { z } from 'zod';

/** ----------------------------
 * Helpers
 * ---------------------------*/
const isValidLink = (v: string) => {
  if (!v || typeof v !== 'string') return false;
  // allow http(s), mailto, tel, anchor/hash
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(v);
};

/** ----------------------------
 * Images
 * ---------------------------*/
export const ImageRoleSchema = z.enum(['main', 'detail']);
export type ImageRole = z.infer<typeof ImageRoleSchema>;

export const ImageSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  role: ImageRoleSchema,
});
export type Image = z.infer<typeof ImageSchema>;

/** ----------------------------
 * Navigation
 * ---------------------------*/
export const NavItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().min(1, 'Href is required'), // hash or url is fine
});
export type NavItem = z.infer<typeof NavItemSchema>;

/** ----------------------------
 * Works
 * ---------------------------*/
export const SalePriceSchema = z.object({
  mode: z.enum(['fixed', 'on_request']).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
});
export type SalePrice = z.infer<typeof SalePriceSchema>;

export const SaleSchema = z.object({
  availability: z.enum(['available', 'reserved', 'sold', 'not_for_sale']).optional(),
  price: SalePriceSchema.optional(),
  notes: z.string().optional(),
});
export type Sale = z.infer<typeof SaleSchema>;

export const WorkSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1900).max(2100),
  technique: z.string().optional(),     // relaxed
  dimensions: z.string().optional(),    // relaxed
  images: z.array(ImageSchema).min(1, 'At least one image is required'),
  sale: SaleSchema.optional(),          // NEW
});
export type Work = z.infer<typeof WorkSchema>;

/** ----------------------------
 * Series
 * ---------------------------*/
export const SeriesSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.string().min(1, 'Year is required'), // string by contract
  intro: z.union([z.string(), z.array(z.string())]),
  artworkImages: z.array(z.string()).optional().default([]),
  works: z.array(WorkSchema),
});
export type Series = z.infer<typeof SeriesSchema>;

/** ----------------------------
 * Sounds
 * ---------------------------*/
export const SoundTrackSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  duration: z.string().optional(), // relaxed
});
export type SoundTrack = z.infer<typeof SoundTrackSchema>;

export const SoundMetaSchema = z.object({
  label: z.string().optional(),              // relaxed
  platforms: z.array(z.string()).optional().default([]),
});
export type SoundMeta = z.infer<typeof SoundMetaSchema>;

export const SoundPhotoSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  alt: z.string().optional(), // relaxed
});
export type SoundPhoto = z.infer<typeof SoundPhotoSchema>;

export const SoundSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1900).max(2100),
  platform: z.enum(['soundcloud', 'bandcamp']),
  pageUrl: z.string().url('Must be a valid URL').optional(),
  cover: z.string().min(1, 'Cover is required'),
  embed: z.string().url('Must be a valid URL'),
  tracks: z.array(SoundTrackSchema).optional(),
  meta: SoundMetaSchema.optional().default({ label: '', platforms: [] }),
  photos: z.array(SoundPhotoSchema).optional(),
  bodyBlocks: z.array(z.object({ type: z.string(), text: z.string() })).optional(),
});
export type Sound = z.infer<typeof SoundSchema>;

/** ----------------------------
 * Statement / Contacts / Impressum / Footer / Site
 * ---------------------------*/
export const ExhibitionSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  event: z.string().min(1, 'Event is required'),
});
export type Exhibition = z.infer<typeof ExhibitionSchema>;

export const SocialSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().refine(isValidLink, 'Must be a valid URL, mailto:, tel: or # link'),
});
export type Social = z.infer<typeof SocialSchema>;

export const SiteSchema = z.object({
  artistName: z.string().min(1, 'Artist name is required'),
  role: z.string().min(1, 'Role is required'),
  statement: z.string().min(1, 'Statement is required'),
});
export type Site = z.infer<typeof SiteSchema>;

export const StatementSchema = z.object({
  portrait: z.string().min(1, 'Portrait is required'),
  paragraphs: z.array(z.string().min(1, 'Paragraph cannot be empty')).default([]),
  exhibitions: z.array(ExhibitionSchema).default([]),
  pressKitPdf: z.string().optional(),
});
export type Statement = z.infer<typeof StatementSchema>;

export const ContactsSchema = z.object({
  email: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  introText: z.string().optional(),
  openToText: z.string().optional(),
  portfolioPdf: z.string().optional(),
  socials: z.array(SocialSchema).optional().default([]),
});
export type Contacts = z.infer<typeof ContactsSchema>;

export const ImpressumSchema = z.object({
  paragraphs: z.array(z.string()).default([]),
});
export type Impressum = z.infer<typeof ImpressumSchema>;

export const FooterSchema = z.object({
  legal: z.string().min(1, 'Legal text is required'),
  copyright: z.string().min(1, 'Copyright text is required'),
});
export type Footer = z.infer<typeof FooterSchema>;

/** ----------------------------
 * Root Content
 * ---------------------------*/
export const ContentSchema = z.object({
  site: SiteSchema,
  nav: z.array(NavItemSchema),
  series: z.array(SeriesSchema),
  sounds: z.array(SoundSchema),
  statement: StatementSchema,
  contacts: ContactsSchema,
  impressum: ImpressumSchema,
  footer: FooterSchema,
});
export type Content = z.infer<typeof ContentSchema>;

/** ----------------------------
 * Editor metadata + upload helper
 * ---------------------------*/
export interface EditorMetadata {
  seriesIntroTypes: Record<string, 'string' | 'array'>;
  originalContent?: Content;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  path: string;
}
