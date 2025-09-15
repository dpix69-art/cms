import type { Content, EditorMetadata } from './schema';

const STORAGE_KEY = 'kremenskii-editor-draft';
const METADATA_KEY = 'kremenskii-editor-metadata';

/**
 * Save draft to localStorage
 */
export function saveDraft(content: Content, metadata: EditorMetadata): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.warn('Failed to save draft to localStorage:', error);
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(): { content: Content; metadata: EditorMetadata } | null {
  try {
    const contentStr = localStorage.getItem(STORAGE_KEY);
    const metadataStr = localStorage.getItem(METADATA_KEY);
    
    if (contentStr && metadataStr) {
      const content = JSON.parse(contentStr);
      const metadata = JSON.parse(metadataStr);
      return { content, metadata };
    }
  } catch (error) {
    console.warn('Failed to load draft from localStorage:', error);
  }
  
  return null;
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(METADATA_KEY);
  } catch (error) {
    console.warn('Failed to clear draft from localStorage:', error);
  }
}

/**
 * Check if draft exists
 */
export function hasDraft(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}