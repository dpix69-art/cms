import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import AppShell from '../components/AppShell';
import SiteForm from '../features/site/SiteForm';
import NavEditor from '../features/nav/NavEditor';
import SeriesList from '../features/series/SeriesList';
import SeriesEditor from '../features/series/SeriesEditor';
import SoundsList from '../features/sounds/SoundsList';
import SoundEditor from '../features/sounds/SoundEditor';
import StatementEditor from '../features/statement/StatementEditor';
import ContactsEditor from '../features/contacts/ContactsEditor';
import ImpressumEditor from '../features/impressum/ImpressumEditor';
import FooterEditor from '../features/footer/FooterEditor';
import type { Content, EditorMetadata, UploadedFile } from '../lib/schema';
import { ContentSchema } from '../lib/schema';
import { normalizeContent, denormalizeContent } from '../lib/normalize';
import { validateContent, hasValidationErrors } from '../lib/validate';
import { exportContentJSON, exportContentZIP } from '../lib/export';
import { saveDraft, loadDraft, clearDraft, hasDraft } from '../lib/storage';

const defaultContent: Content = {
  site: {
    artistName: '',
    role: '',
    statement: '',
  },
  nav: [],
  series: [],
  sounds: [],
  statement: {
    portrait: '',
    paragraphs: [],
    exhibitions: [],
    pressKitPdf: '',
  },
  contacts: {
    email: '',
    city: '',
    country: '',
    introText: '',
    openToText: '',
    portfolioPdf: '',
    socials: [],
  },
  impressum: {
    paragraphs: [],
  },
  footer: {
    legal: '',
    copyright: '',
  },
};

const defaultMetadata: EditorMetadata = {
  seriesIntroTypes: {},
};

export default function EditorPage() {
  const [content, setContent] = useState<Content>(defaultContent);
  const [metadata, setMetadata] = useState<EditorMetadata>(defaultMetadata);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPath, setSelectedPath] = useState('site');
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number | null>(null);
  const [selectedSoundIndex, setSelectedSoundIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<number>(0);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveDraft(content, metadata);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content, metadata, hasUnsavedChanges]);

  // Load draft on mount
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        setContent(draft.content);
        setMetadata(draft.metadata);
        setHasUnsavedChanges(true);
      }
    }
  }, []);

  // Validate content when it changes
  useEffect(() => {
    const errors = validateContent(content);
    const errorCount = errors.filter(e => e.type === 'error').length;
    setValidationErrors(errorCount);
  }, [content]);

  const handleContentChange = useCallback((newContent: Content) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSiteChange = useCallback((siteData: any) => {
    setContent(prev => ({ ...prev, site: siteData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleNavChange = useCallback((navData: any) => {
    setContent(prev => ({ ...prev, nav: navData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSeriesChange = useCallback((seriesData: any) => {
    setContent(prev => ({ ...prev, series: seriesData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSeriesEdit = useCallback((seriesIndex: number, seriesData: any) => {
    setContent(prev => ({
      ...prev,
      series: prev.series.map((s, i) => i === seriesIndex ? seriesData : s)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSoundsChange = useCallback((soundsData: any) => {
    setContent(prev => ({ ...prev, sounds: soundsData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSoundEdit = useCallback((soundIndex: number, soundData: any) => {
    setContent(prev => ({
      ...prev,
      sounds: prev.sounds.map((s, i) => i === soundIndex ? soundData : s)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleStatementChange = useCallback((statementData: any) => {
    setContent(prev => ({ ...prev, statement: statementData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleContactsChange = useCallback((contactsData: any) => {
    setContent(prev => ({ ...prev, contacts: contactsData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleImpressumChange = useCallback((impressumData: any) => {
    setContent(prev => ({ ...prev, impressum: impressumData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleFooterChange = useCallback((footerData: any) => {
    setContent(prev => ({ ...prev, footer: footerData }));
    setHasUnsavedChanges(true);
  }, []);

  const handlePathChange = useCallback((path: string) => {
    setSelectedPath(path);
    setSelectedSeriesIndex(null);
    setSelectedSoundIndex(null);
  }, []);
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const rawContent = JSON.parse(event.target?.result as string);
            const { content: normalizedContent, metadata: importMetadata } = normalizeContent(rawContent);
            
            // Validate imported content
            const validation = ContentSchema.safeParse(normalizedContent);
            if (!validation.success) {
              throw new Error('Invalid content structure');
            }
            
            setContent(normalizedContent);
            setMetadata(importMetadata);
            setHasUnsavedChanges(false);
            clearDraft();
            toast.success('Content imported successfully');
          } catch (error) {
            toast.error('Failed to import content: Invalid JSON structure');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleValidate = useCallback(() => {
    const errors = validateContent(content);
    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = errors.filter(e => e.type === 'warning').length;
    
    if (errorCount === 0 && warningCount === 0) {
      toast.success('Content validation passed');
    } else {
      const message = `${errorCount} errors, ${warningCount} warnings`;
      toast.error(`Validation failed: ${message}`);
    }
  }, [content]);

  const handleExportJSON = useCallback(() => {
    const errors = validateContent(content);
    if (hasValidationErrors(errors)) {
      toast.error('Fix validation errors before exporting');
      return;
    }
    
    exportContentJSON(content, metadata);
    setHasUnsavedChanges(false);
    clearDraft();
    toast.success('JSON exported successfully');
  }, [content, metadata]);

  const handleExportZIP = useCallback(async () => {
    const errors = validateContent(content);
    if (hasValidationErrors(errors)) {
      toast.error('Fix validation errors before exporting');
      return;
    }
    
    try {
      const missingAssets = await exportContentZIP(content, metadata, uploadedFiles);
      setHasUnsavedChanges(false);
      clearDraft();
      
      if (missingAssets.length > 0) {
        toast.success(`ZIP exported with ${missingAssets.length} missing assets`);
      } else {
        toast.success('ZIP exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export ZIP');
      console.error('Export error:', error);
    }
  }, [content, metadata, uploadedFiles]);

  const renderContent = () => {
    // Series editing flow
    if (selectedSeriesIndex !== null) {
      return (
        <SeriesEditor
          series={content.series[selectedSeriesIndex]}
          seriesIndex={selectedSeriesIndex}
          onChange={(series) => handleSeriesEdit(selectedSeriesIndex, series)}
          onBack={() => setSelectedSeriesIndex(null)}
          allSeries={content.series}
        />
      );
    }

    // Sound editing flow
    if (selectedSoundIndex !== null) {
      return (
        <SoundEditor
          sound={content.sounds[selectedSoundIndex]}
          soundIndex={selectedSoundIndex}
          onChange={(sound) => handleSoundEdit(selectedSoundIndex, sound)}
          onBack={() => setSelectedSoundIndex(null)}
          allSounds={content.sounds}
        />
      );
    }

    switch (selectedPath) {
      case 'site':
        return <SiteForm data={content.site} onChange={handleSiteChange} />;
      
      case 'nav':
        return <NavEditor data={content.nav} onChange={handleNavChange} />;
      
      case 'series':
        return (
          <SeriesList
            data={content.series}
            onChange={handleSeriesChange}
            onEditSeries={setSelectedSeriesIndex}
            selectedSeriesIndex={selectedSeriesIndex}
          />
        );
      
      case 'sounds':
        return (
          <SoundsList
            data={content.sounds}
            onChange={handleSoundsChange}
            onEditSound={setSelectedSoundIndex}
            selectedSoundIndex={selectedSoundIndex}
          />
        );
      
      case 'statement':
        return <StatementEditor data={content.statement} onChange={handleStatementChange} />;
      
      case 'contacts':
        return <ContactsEditor data={content.contacts} onChange={handleContactsChange} />;
      
      case 'impressum':
        return <ImpressumEditor data={content.impressum} onChange={handleImpressumChange} />;
      
      case 'footer':
        return <FooterEditor data={content.footer} onChange={handleFooterChange} />;
      
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section Not Found</h3>
            <p className="text-gray-600">The selected section could not be found.</p>
            <p className="text-sm text-gray-500 mt-4">Selected: {selectedPath}</p>
          </div>
        );
    }
  };

  return (
    <AppShell
      selectedPath={selectedPath}
      onPathChange={handlePathChange}
      hasUnsavedChanges={hasUnsavedChanges}
      validationErrors={validationErrors}
      onImport={handleImport}
      onExportJSON={handleExportJSON}
      onExportZIP={handleExportZIP}
      onValidate={handleValidate}
      seriesCount={content.series.length}
      soundsCount={content.sounds.length}
    >
      {renderContent()}
    </AppShell>
  );
}