import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Hash } from 'lucide-react';
import Field from '../../components/Field';
import FormArray from '../../components/FormArray';
import ImageDropzone from '../../components/ImageDropzone';
import type { Sound, SoundTrack, BodyBlock, SoundPhoto, UploadedFile } from '../../lib/schema';
import { makeSlug, generateId } from '../../lib/slug';

const SoundFormSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1900).max(2100),
  platform: z.enum(['soundcloud', 'bandcamp']),
  pageUrl: z.string().optional(),
  cover: z.string().optional(),
  embed: z.string().optional(),
  meta: z.object({
    label: z.string().optional(),
    platforms: z.array(z.string()).optional(),
  }).optional(),
});

interface SoundEditorProps {
  sound: Sound;
  soundIndex: number;
  onChange: (sound: Sound) => void;
  onBack: () => void;
  allSounds: Sound[];
}

export default function SoundEditor({ 
  sound, 
  soundIndex, 
  onChange, 
  onBack, 
  allSounds 
}: SoundEditorProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [coverFiles, setCoverFiles] = useState<UploadedFile[]>([]);
  const [photoFiles, setPhotoFiles] = useState<UploadedFile[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(SoundFormSchema),
    defaultValues: {
      ...sound,
      meta: sound.meta || { label: '', platforms: [] },
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
    return !allSounds.some((s, index) => 
      s.slug === slug && index !== soundIndex
    );
  };

  const onSubmit = (data: any) => {
    const updatedSound: Sound = {
      ...data,
      tracks: sound.tracks || [],
      photos: sound.photos || [],
      bodyBlocks: sound.bodyBlocks || [],
    };
    onChange(updatedSound);
  };

  const createNewTrack = (): SoundTrack & { id: string } => ({
    id: generateId(),
    title: '',
    duration: '',
  });

  const createNewBodyBlock = (): BodyBlock & { id: string } => ({
    id: generateId(),
    type: 'p',
    text: '',
  });

  const createNewPhoto = (): SoundPhoto & { id: string } => ({
    id: generateId(),
    url: '',
    alt: '',
  });

  const handleTracksChange = (tracks: SoundTrack[]) => {
    onChange({ ...sound, tracks });
  };

  const handleBodyBlocksChange = (bodyBlocks: BodyBlock[]) => {
    onChange({ ...sound, bodyBlocks });
  };

  const handlePhotosChange = (photos: SoundPhoto[]) => {
    onChange({ ...sound, photos });
  };

  const handlePlatformsChange = (platforms: string[]) => {
    const meta = sound.meta || { label: '', platforms: [] };
    onChange({ ...sound, meta: { ...meta, platforms } });
  };

  const renderTrack = (item: SoundTrack & { id: string }, index: number, onItemChange: (item: SoundTrack & { id: string }) => void) => (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Title" required>
        <input
          type="text"
          value={item.title}
          onChange={(e) => onItemChange({ ...item, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Track title"
        />
      </Field>

      <Field label="Duration" required>
        <input
          type="text"
          value={item.duration}
          onChange={(e) => onItemChange({ ...item, duration: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="3:45"
        />
      </Field>
    </div>
  );

  const renderBodyBlock = (item: BodyBlock & { id: string }, index: number, onItemChange: (item: BodyBlock & { id: string }) => void) => (
    <Field label={`Paragraph ${index + 1}`}>
      <textarea
        value={item.text}
        onChange={(e) => onItemChange({ ...item, text: e.target.value })}
        rows={4}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Paragraph text"
      />
    </Field>
  );

  const renderPhoto = (item: SoundPhoto & { id: string }, index: number, onItemChange: (item: SoundPhoto & { id: string }) => void) => (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Photo URL" required>
        <input
          type="text"
          value={item.url}
          onChange={(e) => onItemChange({ ...item, url: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="images/sounds/photo.jpg"
        />
      </Field>

      <Field label="Alt Text" required>
        <input
          type="text"
          value={item.alt}
          onChange={(e) => onItemChange({ ...item, alt: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Photo description"
        />
      </Field>
    </div>
  );

  const tracksWithIds = (sound.tracks || []).map((track, index) => ({
    ...track,
    id: `track-${index}`,
  }));

  const bodyBlocksWithIds = (sound.bodyBlocks || []).map((block, index) => ({
    ...block,
    id: `block-${index}`,
  }));

  const photosWithIds = (sound.photos || []).map((photo, index) => ({
    ...photo,
    id: `photo-${index}`,
  }));

  const platformsWithIds = (sound.meta?.platforms || []).map((platform, index) => ({
    id: `platform-${index}`,
    value: platform,
  }));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Sounds List</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900">Edit Sound</h2>
        <p className="mt-2 text-gray-600">Configure sound details and manage content.</p>
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
              placeholder="Sound title"
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
                placeholder="sound-slug"
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

        <div className="grid grid-cols-2 gap-6">
          <Field label="Year" required error={errors.year?.message}>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="2024"
              min="1900"
              max="2100"
            />
          </Field>

          <Field label="Platform" required error={errors.platform?.message}>
            <select
              {...register('platform')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="soundcloud">SoundCloud</option>
              <option value="bandcamp">Bandcamp</option>
            </select>
          </Field>
        </div>

        <Field label="Page URL" error={errors.pageUrl?.message}>
          <input
            type="url"
            {...register('pageUrl')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://soundcloud.com/..."
          />
        </Field>

        <Field label="Embed Code" error={errors.embed?.message}>
          <textarea
            {...register('embed')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Embed URL or HTML code"
          />
        </Field>

        <div className="grid grid-cols-2 gap-6">
          <Field label="Label">
            <input
              type="text"
              {...register('meta.label')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Record label"
            />
          </Field>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save Sound
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200 space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Image</h3>
          <ImageDropzone
            files={coverFiles}
            onFilesChange={(files) => {
              setCoverFiles(files);
              if (files.length > 0) {
                onChange({ ...sound, cover: files[0].path });
              }
            }}
            pathTemplate={`images/covers/${sound.slug}.{ext}`}
            maxFiles={1}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tracks</h3>
          <FormArray
            items={tracksWithIds}
            onItemsChange={(items) => {
              const tracks = items.map(({ id, ...track }) => track);
              handleTracksChange(tracks);
            }}
            onAddItem={createNewTrack}
            renderItem={renderTrack}
            addButtonText="Add Track"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platforms</h3>
          <FormArray
            items={platformsWithIds}
            onItemsChange={(items) => {
              const platforms = items.map(item => item.value);
              handlePlatformsChange(platforms);
            }}
            onAddItem={() => ({ id: generateId(), value: '' })}
            renderItem={(item: any, index: number, onItemChange: (item: any) => void) => (
              <Field label="Platform">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => onItemChange({ ...item, value: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Platform name"
                />
              </Field>
            )}
            addButtonText="Add Platform"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
          <ImageDropzone
            files={photoFiles}
            onFilesChange={(files) => {
              setPhotoFiles(files);
              const photos = files.map((file, index) => ({
                url: file.path,
                alt: `Photo ${index + 1}`,
              }));
              handlePhotosChange(photos);
            }}
            pathTemplate={`images/sounds/${sound.slug}-{n}.{ext}`}
            templateVariables={{ n: photoFiles.length + 1 }}
          />
          
          <div className="mt-4">
            <FormArray
              items={photosWithIds}
              onItemsChange={(items) => {
                const photos = items.map(({ id, ...photo }) => photo);
                handlePhotosChange(photos);
              }}
              onAddItem={createNewPhoto}
              renderItem={renderPhoto}
              addButtonText="Add Photo Manually"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Body Text</h3>
          <FormArray
            items={bodyBlocksWithIds}
            onItemsChange={(items) => {
              const bodyBlocks = items.map(({ id, ...block }) => block);
              handleBodyBlocksChange(bodyBlocks);
            }}
            onAddItem={createNewBodyBlock}
            renderItem={renderBodyBlock}
            addButtonText="Add Paragraph"
          />
        </div>
      </div>
    </div>
  );
}