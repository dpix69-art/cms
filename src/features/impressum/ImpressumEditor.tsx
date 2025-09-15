import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormArray from '../../components/FormArray';
import type { Impressum } from '../../lib/schema';
import { generateId } from '../../lib/slug';

const ImpressumFormSchema = z.object({
  paragraphs: z.array(z.string().min(1, 'Paragraph cannot be empty')),
});

interface ImpressumEditorProps {
  data: Impressum;
  onChange: (data: Impressum) => void;
}

export default function ImpressumEditor({ data, onChange }: ImpressumEditorProps) {
  const { watch, setValue } = useForm({
    resolver: zodResolver(ImpressumFormSchema),
    defaultValues: data,
  });

  const watchedData = watch();

  React.useEffect(() => {
    onChange(watchedData);
  }, [watchedData, onChange]);

  const renderParagraph = (item: string, index: number, onItemChange: (item: string) => void) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Paragraph {index + 1}
      </label>
      <textarea
        value={item}
        onChange={(e) => onItemChange(e.target.value)}
        rows={4}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Legal text paragraph"
      />
    </div>
  );

  const paragraphsWithIds = data.paragraphs.map((paragraph, index) => ({
    id: `paragraph-${index}`,
    value: paragraph,
  }));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Impressum</h2>
        <p className="mt-2 text-gray-600">Legal information and disclaimers.</p>
      </div>

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
  );
}