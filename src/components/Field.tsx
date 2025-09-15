import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
}

export default function Field({ label, error, required, children, description }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {children}
      
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}