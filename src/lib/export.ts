import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Content, EditorMetadata, UploadedFile } from './schema';
import { denormalizeContent } from './normalize';

/**
 * Export content as JSON file
 */
export function exportContentJSON(content: Content, metadata: EditorMetadata) {
  const exportedContent = denormalizeContent(content, metadata);
  
  // Ensure proper key ordering
  const orderedContent = {
    site: exportedContent.site,
    nav: exportedContent.nav,
    series: exportedContent.series,
    sounds: exportedContent.sounds,
    statement: exportedContent.statement,
    contacts: exportedContent.contacts,
    impressum: exportedContent.impressum,
    footer: exportedContent.footer,
  };

  const jsonString = JSON.stringify(orderedContent, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, 'content.json');
}

/**
 * Export content and uploaded images as ZIP
 */
export async function exportContentZIP(
  content: Content, 
  metadata: EditorMetadata, 
  uploadedFiles: UploadedFile[]
) {
  const zip = new JSZip();
  const exportedContent = denormalizeContent(content, metadata);
  
  // Ensure proper key ordering
  const orderedContent = {
    site: exportedContent.site,
    nav: exportedContent.nav,
    series: exportedContent.series,
    sounds: exportedContent.sounds,
    statement: exportedContent.statement,
    contacts: exportedContent.contacts,
    impressum: exportedContent.impressum,
    footer: exportedContent.footer,
  };

  // Add content.json to ZIP root
  const jsonString = JSON.stringify(orderedContent, null, 2);
  zip.file('content.json', jsonString);

  // Add uploaded images to ZIP in correct folder structure
  const missingAssets: string[] = [];
  const addedPaths = new Set<string>();

  uploadedFiles.forEach((uploadedFile) => {
    if (!addedPaths.has(uploadedFile.path)) {
      zip.file(uploadedFile.path, uploadedFile.file);
      addedPaths.add(uploadedFile.path);
    }
  });

  // Check for missing assets referenced in JSON but not uploaded
  const allImagePaths = extractAllImagePaths(exportedContent);
  allImagePaths.forEach((path) => {
    if (!addedPaths.has(path)) {
      missingAssets.push(path);
    }
  });

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'kremenskii-content.zip');

  // Return missing assets report
  return missingAssets;
}

/**
 * Extract all image paths from content
 */
function extractAllImagePaths(content: Content): string[] {
  const paths: string[] = [];

  // Site portrait
  if (content.statement.portrait) {
    paths.push(content.statement.portrait);
  }

  // Series artwork images
  content.series.forEach((series) => {
    paths.push(...series.artworkImages);
    
    // Work images
    series.works.forEach((work) => {
      work.images.forEach((image) => {
        paths.push(image.url);
      });
    });
  });

  // Sound covers and photos
  content.sounds.forEach((sound) => {
    if (sound.cover) {
      paths.push(sound.cover);
    }
    if (sound.photos) {
      sound.photos.forEach((photo) => {
        paths.push(photo.url);
      });
    }
  });

  // Contacts portfolio PDF
  if (content.contacts.portfolioPdf) {
    paths.push(content.contacts.portfolioPdf);
  }

  // Statement press kit PDF
  if (content.statement.pressKitPdf) {
    paths.push(content.statement.pressKitPdf);
  }

  return paths;
}