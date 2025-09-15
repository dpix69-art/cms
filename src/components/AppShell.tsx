import React from 'react';
import TopBar from './TopBar';
import SidebarTree from './SidebarTree';

interface AppShellProps {
  children: React.ReactNode;
  selectedPath: string;
  onPathChange: (path: string) => void;
  hasUnsavedChanges: boolean;
  validationErrors: number;
  seriesCount?: number;
  soundsCount?: number;
  onImport: () => void;
  onExportJSON: () => void;
  onExportZIP: () => void;
  onValidate: () => void;
}

export default function AppShell({
  children,
  selectedPath,
  onPathChange,
  hasUnsavedChanges,
  validationErrors,
  seriesCount,
  soundsCount,
  onImport,
  onExportJSON,
  onExportZIP,
  onValidate,
}: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar
        hasUnsavedChanges={hasUnsavedChanges}
        validationErrors={validationErrors}
        onImport={onImport}
        onExportJSON={onExportJSON}
        onExportZIP={onExportZIP}
        onValidate={onValidate}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <SidebarTree
            selectedPath={selectedPath}
            onPathChange={onPathChange}
            seriesCount={seriesCount}
            soundsCount={soundsCount}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}