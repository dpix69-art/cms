import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Field from '../../components/Field';
import FormArray from '../../components/FormArray';
import ImageDropzone from '../../components/ImageDropzone';
import type { Statement, Exhibition, UploadedFile } from '../../lib/schema';
import { generateId } from '../../lib/slug';

const StatementFormSchema = z.object({
  portrait: z.string().optional(),
  paragraphs: z.array(z.string().min(1, 'Paragraph cannot be empty')),
  pressKitPdf: z.string().optional(),
});

interface StatementEditorProps {
  data: Statement;
  onChange: (data: Statement) => void;
}

export default function StatementEditor({ data, onChange }: StatementEditorProps) {
  const [portraitFiles, setPortraitFiles] = useState<UploadedFile[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(StatementFormSchema),
    defaultValues: data,
  });

  const watchedData = watch();

  React.useEffect(() => {
    onChange({
      ...watchedData,
      exhibitions: data.exhibitions,
    });
  }, [watchedData, data.exhibitions, onChange]);

  const createNewExhibition = (): Exhibition & { id: string } => ({
    id: generateId(),
    year: new Date().getFullYear().toString(),
    event: '',
  });

  const handleExhibitionsChange = (exhibitions: Exhibition[]) => {
    onChange({ ...data, exhibitions });
  };

  const renderParagraph = (item: string, index: number, onItemChange: (item: string) => void) => (
    <Field label={`Paragraph ${index + 1}`}>
      <textarea
        value={item}
        onChange={(e) => onItemChange(e.target.value)}
        rows={4}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Statement paragraph"
      />
    </Field>
  );

  const renderExhibition = (item: Exhibition & { id: string }, index: number, onItemChange: (item: Exhibition & { id: string }) => void) => (
    <div className="grid grid-cols-4 gap-4">
      <Field label="Year" required>
        <input
          type="text"
          value={item.year}
          onChange={(e) => onItemChange({ ...item, year: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="2024"
        />
      </Field>

      <div className="col-span-3">
        <Field label="Event" required>
          <input
            type="text"
            value={item.event}
            onChange={(e) => onItemChange({ ...item, event: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Exhibition name and venue"
          />
        </Field>
      </div>
    </div>
  );

  const paragraphsWithIds = data.paragraphs.map((paragraph, index) => ({
    id: `paragraph-${index}`,
    value: paragraph,
  }));

  const exhibitionsWithIds = data.exhibitions.map((exhibition, index) => ({
    ...exhibition,
    id: `exhibition-${index}`,
  }));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Artist Statement</h2>
        <p className="mt-2 text-gray-600">Manage your artist statement, portrait, and exhibition history.</p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portrait</h3>
          <ImageDropzone
            files={portraitFiles}
            onFilesChange={(files) => {
              setPortraitFiles(files);
              if (files.length > 0) {
                setValue('portrait', files[0].path);
              }
            }}
            pathTemplate="images/portrait.{ext}"
            maxFiles={1}
          />
          
          <Field label="Portrait URL" className="mt-4">
            <input
              type="text"
              {...register('portrait')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="images/portrait.jpg"
            />
          </Field>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statement Paragraphs</h3>
          <FormArray
            items={paragraphsWithIds}
            onItemsChange={(items) => {
              const paragraphs = items.map(item => item.value);
              setValue('paragraphs', paragraphs);
            }}
            onAddItem={() => ({ id: generateId(), value: '' })}
            renderItem={(item: any, index: number, onItemChange: (item: any) => void) => 
              renderParagraph(item.value, index, (value) => onItemChange({ ...item, value }))
            }
            addButtonText="Add Paragraph"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exhibitions</h3>
          <FormArray
            items={exhibitionsWithIds}
            onItemsChange={(items) => {
              const exhibitions = items.map(({ id, ...exhibition }) => exhibition);
              handleExhibitionsChange(exhibitions);
            }}
            onAddItem={createNewExhibition}
            renderItem={renderExhibition}
            addButtonText="Add Exhibition"
          />
        </div>

        <Field label="Press Kit PDF" error={errors.pressKitPdf?.message}>
          <input
            type="text"
            {...register('pressKitPdf')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="files/press-kit.pdf or https://..."
          />
        </Field>
      </div>
    </div>
  );
}