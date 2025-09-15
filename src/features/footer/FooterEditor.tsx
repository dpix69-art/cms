import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Field from '../../components/Field';
import type { Footer } from '../../lib/schema';

const FooterFormSchema = z.object({
  legal: z.string().optional(),
  copyright: z.string().optional(),
});

interface FooterEditorProps {
  data: Footer;
  onChange: (data: Footer) => void;
}

export default function FooterEditor({ data, onChange }: FooterEditorProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(FooterFormSchema),
    defaultValues: data,
  });

  const watchedData = watch();

  React.useEffect(() => {
    onChange(watchedData);
  }, [watchedData, onChange]);

  const onSubmit = (formData: Footer) => {
    onChange(formData);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Footer</h2>
        <p className="mt-2 text-gray-600">Configure footer text and copyright information.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Field label="Legal Text" error={errors.legal?.message}>
          <textarea
            {...register('legal')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Legal disclaimer or terms"
          />
        </Field>

        <Field label="Copyright" error={errors.copyright?.message}>
          <input
            type="text"
            {...register('copyright')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="© 2024 Your Name. All rights reserved."
          />
        </Field>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save Footer
        </button>
      </form>
    </div>
  );
}