import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import Field from '../../components/Field';
import FormArray from '../../components/FormArray';
import WorkEditor from './WorkEditor';
import type { Series, Work } from '../../lib/schema';
import { makeSlug, generateId } from '../../lib/slug';

const SeriesFormSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.string().min(1, 'Year is required'),
  intro: z.union([z.string(), z.array(z.string())]),
  artworkImages: z.array(z.string()).optional(),
});

interface SeriesEditorProps {
  series: Series;
  seriesIndex: number;
  onChange: (series: Series) => void;
  onBack: () => void;
  allSeries: Series[];
}

export default function SeriesEditor({ 
  series, 
  seriesIndex, 
  onChange, 
  onBack, 
  allSeries 
}: SeriesEditorProps) {
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number | null>(null);
  const [introAsArray, setIntroAsArray] = useState(Array.isArray(series.intro));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(SeriesFormSchema),
    defaultValues: {
      ...series,
      intro: Array.isArray(series.intro) ? series.intro : [series.intro],
    },
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');

  const handleMakeSlug = () => {
    if (watchedTitle && !slugManuallyEdited) {
      const newSlug = makeSlug(watchedTitle);
      setValue('slug', newSlug);
    }
  };

  const isSlugUnique = (slug: string) => {
    return !allSeries.some((s, index) => 
      s.slug === slug && index !== seriesIndex
    );
  };

  const onSubmit = (data: any) => {
    const updatedSeries: Series = {
      ...data,
      intro: introAsArray ? data.intro : data.intro.join('\n\n'),
      works: series.works,
    };
    onChange(updatedSeries);
  };

  const createNewWork = (): Work & { id: string } => ({
    id: generateId(),
    slug: '',
    title: '',
    year: new Date().getFullYear(),
    technique: '',
    dimensions: '',
    images: [],
  });

  const handleWorksChange = (works: Work[]) => {
    onChange({ ...series, works });
  };

  const handleWorkChange = (workIndex: number, work: Work) => {
    const updatedWorks = series.works.map((w, i) => i === workIndex ? work : w);
    handleWorksChange(updatedWorks);
  };

  if (selectedWorkIndex !== null) {
    return (
      <WorkEditor
        work={series.works[selectedWorkIndex]}
        workIndex={selectedWorkIndex}
        series={series}
        onChange={(work) => handleWorkChange(selectedWorkIndex, work)}
        onBack={() => setSelectedWorkIndex(null)}
        allWorks={series.works}
      />
    );
  }

  const worksWithIds = series.works.map((work, index) => ({
    ...work,
    id: `work-${index}`,
  }));

  const renderWork = (item: Work & { id: string }, index: number) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {item.title || 'Untitled Work'}
          </h4>
          <p className="text-sm text-gray-500">
            {item.slug || 'no-slug'} • {item.year} • {item.images.length} images
          </p>
        </div>
        
        <button
          onClick={() => setSelectedWorkIndex(index)}
          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          Edit
        </button>
      </div>
      
      {item.technique && (
        <p className="text-sm text-gray-600">{item.technique}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Series List</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900">Edit Series</h2>
        <p className="mt-2 text-gray-600">Configure series details and manage works.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              placeholder="Series title"
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
                placeholder="series-slug"
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
              <p className="mt-1 text-sm text-red-600">Slug must be unique</p>
            )}
          </Field>
        </div>

        <Field label="Year" required error={errors.year?.message}>
          <input
            type="text"
            {...register('year')}
            className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="2024"
          />
        </Field>

        <Field label="Introduction">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">Format:</span>
              <button
                type="button"
                onClick={() => setIntroAsArray(!introAsArray)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {introAsArray ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{introAsArray ? 'Multiple paragraphs' : 'Single paragraph'}</span>
              </button>
            </div>
            
            {introAsArray ? (
              <FormArray
                items={watch('intro') as string[]}
                onItemsChange={(items) => setValue('intro', items)}
                onAddItem={() => ''}
                renderItem={(item: string, index: number, onChange: (item: string) => void) => (
                  <textarea
                    value={item}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Paragraph text"
                  />
                )}
                addButtonText="Add Paragraph"
              />
            ) : (
              <textarea
                value={Array.isArray(watch('intro')) ? (watch('intro') as string[]).join('\n\n') : watch('intro')}
                onChange={(e) => setValue('intro', [e.target.value])}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Series introduction"
              />
            )}
          </div>
        </Field>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save Series
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Works</h3>
        
        <FormArray
          items={worksWithIds}
          onItemsChange={(items) => {
            const works = items.map(({ id, ...work }) => work);
            handleWorksChange(works);
          }}
          onAddItem={createNewWork}
          renderItem={renderWork}
          addButtonText="Add New Work"
        />
      </div>
    </div>
  );
}