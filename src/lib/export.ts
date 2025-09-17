import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Content, EditorMetadata, UploadedFile } from './schema';
import { denormalizeContent } from './normalize';

function pruneSales(content: Content): Content {
  const clone: Content = JSON.parse(JSON.stringify(content));
  clone.series = clone.series.map((s) => ({
    ...s,
    works: s.works.map((w) => {
      if (!w.sale) return w;
      const availability = w.sale.availability || 'available';
      // если недоступно — вычищаем price
      if (availability !== 'available') {
        const { notes } = w.sale;
        return { ...w, sale: notes ? { availability, notes } : { availability } };
      }
      // если доступно, но mode=on_request — оставляем без amount
      if (w.sale.price?.mode === 'on_request') {
        return { ...w, sale: { ...w.sale, price: { mode: 'on_request' } } };
      }
      return w;
    }),
  }));
  return clone;
}

/** Export content as JSON file */
export function exportContentJSON(content: Content, metadata: EditorMetadata) {
  const exportedContent = pruneSales(denormalizeContent(content, metadata));

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

/** Export content and uploaded images as ZIP */
export async function exportContentZIP(
  content: Content,
  metadata: EditorMetadata,
  uploadedFiles: UploadedFile[]
) {
  const zip = new JSZip();
  const exportedContent = pruneSales(denormalizeContent(content, metadata));

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

  // Add uploaded images to ZIP
  const addedPaths = new Set<string>();
  uploadedFiles.forEach((f) => {
    if (!addedPaths.has(f.path)) {
      zip.file(f.path, f.file);
      addedPaths.add(f.path);
    }
  });

  // Missing assets report (optional)
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'kremenskii-content.zip');
}
