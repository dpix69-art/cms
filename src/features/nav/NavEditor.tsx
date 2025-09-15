import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Field from '../../components/Field';
import FormArray from '../../components/FormArray';
import type { NavItem } from '../../lib/schema';
import { generateId } from '../../lib/slug';

const NavItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  href: z.string().min(1, 'Link is required'),
});

const NavFormSchema = z.object({
  items: z.array(NavItemSchema),
});

interface NavEditorProps {
  data: NavItem[];
  onChange: (data: NavItem[]) => void;
}

export default function NavEditor({ data, onChange }: NavEditorProps) {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(NavFormSchema),
    defaultValues: {
      items: data.map(item => ({ ...item, id: generateId() })),
    },
  });

  const watchedItems = watch('items');

  React.useEffect(() => {
    const items = watchedItems.map(({ id, ...item }) => item);
    onChange(items);
  }, [watchedItems, onChange]);

  const createNewItem = () => ({
    id: generateId(),
    label: '',
    href: '',
  });

  const validateUrl = (url: string) => {
    if (url.startsWith('#') || url.startsWith('mailto:')) {
      return true;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const renderItem = (item: any, index: number, onItemChange: (item: any) => void) => (
    <div className="grid grid-cols-2 gap-4">
      <Field 
        label="Label" 
        required 
        error={errors.items?.[index]?.label?.message}
      >
        <input
          type="text"
          value={item.label}
          onChange={(e) => onItemChange({ ...item, label: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Navigation label"
        />
      </Field>

      <Field 
        label="Link" 
        required 
        error={errors.items?.[index]?.href?.message}
        description="URL, #anchor, or mailto: link"
      >
        <input
          type="text"
          value={item.href}
          onChange={(e) => onItemChange({ ...item, href: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            item.href && !validateUrl(item.href) ? 'border-red-300 bg-red-50' : ''
          }`}
          placeholder="https://example.com or #section"
        />
        {item.href && !validateUrl(item.href) && (
          <p className="mt-1 text-sm text-red-600">
            Must be a valid URL, #anchor, or mailto: link
          </p>
        )}
      </Field>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Navigation</h2>
        <p className="mt-2 text-gray-600">Manage the main navigation menu items.</p>
      </div>

      <FormArray
        items={watchedItems}
        onItemsChange={(items) => setValue('items', items)}
        onAddItem={createNewItem}
        renderItem={renderItem}
        addButtonText="Add Navigation Item"
      />
    </div>
  );
}