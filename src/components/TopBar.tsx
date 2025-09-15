import React from 'react';
import { Upload, Download, FileText, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface TopBarProps {
  hasUnsavedChanges: boolean;
  validationErrors: number;
  onImport: () => void;
  onExportJSON: () => void;
  onExportZIP: () => void;
  onValidate: () => void;
}

export default function TopBar({
  hasUnsavedChanges,
  validationErrors,
  onImport,
  onExportJSON,
  onExportZIP,
  onValidate,
}: TopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Content Editor</h1>
          
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
          
          {validationErrors > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">{validationErrors} validation errors</span>
            </div>
          )}
          
          {!hasUnsavedChanges && validationErrors === 0 && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">All good</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onImport}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <Upload size={16} />
            <span>Import JSON</span>
          </button>
          
          <button
            onClick={onValidate}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <CheckCircle size={16} />
            <span>Validate</span>
          </button>
          
          <button
            onClick={onExportJSON}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <FileText size={16} />
            <span>Export JSON</span>
          </button>
          
          <button
            onClick={onExportZIP}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Package size={16} />
            <span>Export ZIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}