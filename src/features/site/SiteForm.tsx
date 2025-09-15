import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Field from '../../components/Field';
import type { Site } from '../../lib/schema';

const SiteFormSchema = z.object({
  artistName: z.string().min(1, 'Artist name is required'),
  role: z.string().min(1, 'Role is required'),
  statement: z.string().min(1, 'Statement is required'),
});

interface SiteFormProps {
  data: Site;
  onChange: (data: Site) => void;
}

export default function SiteForm({ data, onChange }: SiteFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Site>({
    resolver: zodResolver(SiteFormSchema),
    values: data,
  });

  const onSubmit = (formData: Site) => {
    onChange(formData);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Site Information</h2>
        <p className="mt-2 text-gray-600">Basic information about the artist and site.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Field label="Artist Name" required error={errors.artistName?.message}>
          <input
            type="text"
            {...register('artistName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter artist name"
          />
        </Field>

        <Field label="Role" required error={errors.role?.message}>
          <input
            type="text"
            {...register('role')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., artist, designer, musician"
          />
        </Field>

        <Field label="Artist Statement" required error={errors.statement?.message}>
          <textarea
            {...register('statement')}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter artist statement"
          />
        </Field>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}