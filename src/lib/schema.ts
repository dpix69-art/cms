import { z } from 'zod';

// Image role validation
const ImageRoleSchema = z.enum(['main', 'detail']);

// Basic image schema
const ImageSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  role: ImageRoleSchema,
});

// Navigation item schema
const NavItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().min(1, 'Href is required'),
});

// Work schema - year is number
const WorkSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1900).max(2100),
  technique: z.string().min(1, 'Technique is required'),
  dimensions: z.string().min(1, 'Dimensions are required'),
  images: z.array(ImageSchema).min(1, 'At least one image is required'),
});

// Series schema - year is string, intro can be string or string[]
const SeriesSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.string().min(1, 'Year is required'),
  intro: z.union([z.string(), z.array(z.string())]),
  artworkImages: z.array(z.string()),
  works: z.array(WorkSchema),
});

// Sound track schema
const SoundTrackSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  duration: z.string().min(1, 'Duration is required'),
});

// Sound meta schema
const SoundMetaSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  platforms: z.array(z.string()),
});

// Sound photo schema
const SoundPhotoSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  alt: z.string().min(1, 'Alt text is required'),
});

// Body block schema
const BodyBlockSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  text: z.string().min(1, 'Text is required'),
});

// Sound schema - year is number, platform validation
const SoundSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1900).max(2100),
  platform: z.enum(['soundcloud', 'bandcamp']),
  pageUrl: z.string().url('Must be a valid URL').optional(),
  cover: z.string().min(1, 'Cover is required'),
  embed: z.string().url('Must be a valid URL'),
  tracks: z.array(SoundTrackSchema).optional(),
  meta: SoundMetaSchema,
  photos: z.array(SoundPhotoSchema).optional(),
  bodyBlocks: z.array(BodyBlockSchema).optional(),
});

// Exhibition schema
const ExhibitionSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  event: z.string().min(1, 'Event is required'),
});

// Social link schema
const SocialSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().url('Must be a valid URL'),
});

// Site schema
const SiteSchema = z.object({
  artistName: z.string().min(1, 'Artist name is required'),
  role: z.string().min(1, 'Role is required'),
  statement: z.string().min(1, 'Statement is required'),
});

// Statement schema
const StatementSchema = z.object({
  portrait: z.string().min(1, 'Portrait is required'),
  paragraphs: z.array(z.string().min(1, 'Paragraph cannot be empty')),
  exhibitions: z.array(ExhibitionSchema),
  pressKitPdf: z.string().min(1, 'Press kit PDF is required'),
});

// Contacts schema
const ContactsSchema = z.object({
  email: z.string().email('Must be a valid email'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  introText: z.string().min(1, 'Intro text is required'),
  openToText: z.string().min(1, 'Open to text is required'),
  portfolioPdf: z.string().min(1, 'Portfolio PDF is required'),
  socials: z.array(SocialSchema),
});

// Impressum schema
const ImpressumSchema = z.object({
  paragraphs: z.array(z.string().min(1, 'Paragraph cannot be empty')),
});

// Footer schema
const FooterSchema = z.object({
  legal: z.string().min(1, 'Legal text is required'),
  copyright: z.string().min(1, 'Copyright text is required'),
});

// Main content schema
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

// TypeScript types
export type ImageRole = z.infer<typeof ImageRoleSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type SoundTrack = z.infer<typeof SoundTrackSchema>;
export type SoundMeta = z.infer<typeof SoundMetaSchema>;
export type SoundPhoto = z.infer<typeof SoundPhotoSchema>;
export type BodyBlock = z.infer<typeof BodyBlockSchema>;
export type Sound = z.infer<typeof SoundSchema>;
export type Exhibition = z.infer<typeof ExhibitionSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type Statement = z.infer<typeof StatementSchema>;
export type Contacts = z.infer<typeof ContactsSchema>;
export type Impressum = z.infer<typeof ImpressumSchema>;
export type Footer = z.infer<typeof FooterSchema>;
export type Content = z.infer<typeof ContentSchema>;

// Editor metadata for preserving original types
export interface EditorMetadata {
  seriesIntroTypes: Record<string, 'string' | 'array'>; // track original intro type
  originalContent?: Content; // reference to imported content
}

// Uploaded file data
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  path: string; // target path in JSON
}