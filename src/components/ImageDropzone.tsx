import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import type { UploadedFile } from '../lib/schema';
import { generateId, getFileExtension } from '../lib/slug';

interface ImageDropzoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  pathTemplate?: string;
  templateVariables?: Record<string, string | number>;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export default function ImageDropzone({
  files,
  onFilesChange,
  pathTemplate = 'images/{filename}.{ext}',
  templateVariables = {},
  maxFiles,
  accept = 'image/*',
  className = '',
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const generatePath = useCallback((filename: string, variables: Record<string, string | number>) => {
    const ext = getFileExtension(filename);
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    let path = pathTemplate;
    const allVariables = { ...variables, filename: nameWithoutExt, ext };
    
    Object.entries(allVariables).forEach(([key, value]) => {
      path = path.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
    
    return path;
  }, [pathTemplate]);

  const handleFiles = useCallback((newFiles: FileList) => {
    const fileArray = Array.from(newFiles);
    const uploadedFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = generateId();
        const path = generatePath(file.name, templateVariables);
        const preview = URL.createObjectURL(file);
        
        uploadedFiles.push({
          id,
          file,
          preview,
          path,
        });
      }
    });

    const currentFiles = maxFiles ? files.slice(0, Math.max(0, maxFiles - uploadedFiles.length)) : files;
    const newFileList = [...currentFiles, ...uploadedFiles];
    
    if (maxFiles) {
      onFilesChange(newFileList.slice(0, maxFiles));
    } else {
      onFilesChange(newFileList);
    }
  }, [files, onFilesChange, generatePath, templateVariables, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const updatePath = useCallback((id: string, newPath: string) => {
    const updatedFiles = files.map(f => 
      f.id === id ? { ...f, path: newPath } : f
    );
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const canAddMore = !maxFiles || files.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            multiple={!maxFiles || maxFiles > 1}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop images here, or{' '}
            <label htmlFor="file-input" className="text-blue-600 hover:text-blue-700 cursor-pointer">
              browse
            </label>
          </p>
          {maxFiles && (
            <p className="text-xs text-gray-500">
              {files.length} of {maxFiles} files
            </p>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <input
                  type="text"
                  value={file.path}
                  onChange={(e) => updatePath(file.id, e.target.value)}
                  className="mt-1 text-xs w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Target path"
                />
              </div>
              
              <button
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}