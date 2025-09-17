import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Hash } from 'lucide-react';
import Field from '../../components/Field';
import WorkImageList from './WorkImageList';
import type { Series, Work, UploadedFile } from '../../lib/schema';
import { makeSlug } from '../../lib/slug';

// --- New: sale schema (inline, чтобы не трогать остальной код)
const SalePriceSchema = z.object({
  mode: z.enum(['fixed', 'on_request']).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(1).optional(), // по умолчанию EUR выставим в UI
});

const SaleSchema = z.object({
  availability: z.enum(['available', 'reserved', 'sold', 'not_for_sale']).optional(),
  price: SalePriceSchema.optional(),
  notes: z.string().optional(),
});

const WorkFormSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1900).max(2100),
  technique: z.string().optional(),
  dimensions: z.string().optional(),
  // New:
  sale: SaleSchema.optional(),
});

type FormValues = z.infer<typeof WorkFormSchema>;

interface WorkEditorProps {
  work: Work;
  workIndex: number;
  series: Series;
  onChange: (work: Work) => void;
  onBack: () => void;
  allWorks: Work[];
}

export default function WorkEditor({ 
  work, 
  workIndex, 
  series, 
  onChange, 
  onBack, 
  allWorks 
}: WorkEditorProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const defaultValues: FormValues = {
    ...(work as any),
    sale: (work as any)?.sale ?? { availability: 'available', price: { mode: 'on_request', currency: 'EUR' } },
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(WorkFormSchema),
    defaultValues,
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const priceMode = watch('sale.price.mode');
  const availability = watch('sale.availability');

  const handleMakeSlug = () => {
    if (watchedTitle && !slugManuallyEdited) {
      const newSlug = makeSlug(watchedTitle);
      setValue('slug', newSlug);
    }
  };

  const isSlugUnique = (slug: string) => {
    return !allWorks.some((w, index) => 
      w.slug === slug && index !== workIndex
    );
  };

  const onSubmit = (data: FormValues) => {
    // Валидация фиксированной цены: если fixed — должен быть amount
    if (data.sale?.price?.mode === 'fixed' && !(data.sale?.price?.amount && data.sale?.price?.amount > 0)) {
      alert('For fixed price, please provide a positive Amount.');
      return;
    }

    const updatedWork = {
      ...(work as any),
      ...data,
      // гарантируем что currency есть при fixed
      sale: data.sale
        ? {
            ...data.sale,
            price:
              data.sale.price?.mode === 'fixed'
                ? { mode: 'fixed', amount: data.sale.price.amount!, currency: data.sale.price.currency || 'EUR' }
                : data.sale.price?.mode === 'on_request'
                ? { mode: 'on_request' }
                : undefined,
          }
        : undefined,
      images: (work as any).images,
    };

    onChange(updatedWork as any as Work);
  };

  const handleImagesChange = (images: Work['images']) => {
    const updated = { ...(work as any), images };
    onChange(updated as any as Work);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Back to Series</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900">Edit Work</h2>
        <p className="mt-2 text-gray-600">Configure work details and manage images.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Основные поля */}
        <div className="grid grid-cols-2 gap-6">
          <Field label="Title" required error={errors.title?.message}>
            <input
              type="text"
              {...register('title')}
              onChange={(e) => {
                register('title').onChange(e);
                if (!slugManuallyEdited) {
                  handleMakeSlug();
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Work title"
            />
          </Field>

          <Field label="Slug" required error={errors.slug?.message}>
            <div className="flex">
              <input
                type="text"
                {...register('slug')}
                onChange={(e) => {
                  register('slug').onChange(e);
                  setSlugManuallyEdited(true);
                }}
                className={`mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  watchedSlug && !isSlugUnique(watchedSlug) ? 'border-red-300 bg-red-50' : ''
                }`}
                placeholder="work-slug"
              />
              <button
                type="button"
                onClick={handleMakeSlug}
                className="mt-1 px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                title="Generate slug from title"
              >
                <Hash size={16} />
              </button>
            </div>
            {watchedSlug && !isSlugUnique(watchedSlug) && (
              <p className="mt-1 text-sm text-red-600">Slug must be unique within this series</p>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Field label="Year" required error={errors.year?.message}>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="2024"
              min={1900}
              max={2100}
            />
          </Field>

          <Field label="Technique" error={errors.technique?.message}>
            <input
              type="text"
              {...register('technique')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Medium and materials"
            />
          </Field>

          <Field label="Dimensions" error={errors.dimensions?.message}>
            <input
              type="text"
              {...register('dimensions')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="H × W × D cm"
            />
          </Field>
        </div>

        {/* --- NEW: Sale / Price --- */}
        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <h3 className="text-base font-semibold">Sale</h3>

          <Field label="Availability">
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              {...register('sale.availability')}
              defaultValue={availability || 'available'}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="not_for_sale">Not for sale</option>
            </select>
          </Field>

          <Field
            label="Price"
            description="Choose Fixed to enter an exact amount; On request will show a request label on the site."
          >
            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  value="fixed"
                  {...register('sale.price.mode')}
                  defaultChecked={priceMode === 'fixed'}
                />
                <span>Fixed</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  value="on_request"
                  {...register('sale.price.mode')}
                  defaultChecked={!priceMode || priceMode === 'on_request'}
                />
                <span>On request</span>
              </label>
            </div>

            {priceMode === 'fixed' && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="1"
                    min={0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    {...register('sale.price.amount', { valueAsNumber: true })}
                    placeholder="e.g., 1800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Currency</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    {...register('sale.price.currency')}
                    defaultValue="EUR"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            )}
          </Field>

          <Field label="Notes (private)">
            <textarea
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Framing, shipping, location…"
              {...register('sale.notes')}
            />
          </Field>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save Work
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
        
        <WorkImageList
          images={(work as any).images}
          onChange={handleImagesChange}
          seriesSlug={series.slug}
          workSlug={(work as any).slug}
          uploadedFiles={uploadedFiles}
          onUploadedFilesChange={setUploadedFiles}
        />
      </div>
    </div>
  );
}
