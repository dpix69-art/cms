import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Field from '../../components/Field';
import FormArray from '../../components/FormArray';
import type { Contacts, Social } from '../../lib/schema';
import { generateId } from '../../lib/slug';

const ContactsFormSchema = z.object({
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  city: z.string().optional(),
  country: z.string().optional(),
  introText: z.string().optional(),
  openToText: z.string().optional(),
  portfolioPdf: z.string().optional(),
});

interface ContactsEditorProps {
  data: Contacts;
  onChange: (data: Contacts) => void;
}

export default function ContactsEditor({ data, onChange }: ContactsEditorProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(ContactsFormSchema),
    defaultValues: data,
  });

  const watchedData = watch();

  React.useEffect(() => {
    onChange({
      ...watchedData,
      socials: data.socials,
    });
  }, [watchedData, data.socials, onChange]);

  const createNewSocial = (): Social & { id: string } => ({
    id: generateId(),
    label: '',
    href: '',
  });

  const handleSocialsChange = (socials: Social[]) => {
    onChange({ ...data, socials });
  };

  const validateUrl = (url: string) => {
    if (url.startsWith('mailto:')) {
      return true;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const renderSocial = (item: Social & { id: string }, index: number, onItemChange: (item: Social & { id: string }) => void) => (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Label" required>
        <input
          type="text"
          value={item.label}
          onChange={(e) => onItemChange({ ...item, label: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Instagram, Twitter, etc."
        />
      </Field>

      <Field label="URL" required>
        <input
          type="text"
          value={item.href}
          onChange={(e) => onItemChange({ ...item, href: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            item.href && !validateUrl(item.href) ? 'border-red-300 bg-red-50' : ''
          }`}
          placeholder="https://instagram.com/..."
        />
        {item.href && !validateUrl(item.href) && (
          <p className="mt-1 text-sm text-red-600">
            Must be a valid URL or mailto: link
          </p>
        )}
      </Field>
    </div>
  );

  const socialsWithIds = data.socials.map((social, index) => ({
    ...social,
    id: `social-${index}`,
  }));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="mt-2 text-gray-600">Manage your contact details and social media links.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </Field>

          <Field label="Portfolio PDF">
            <input
              type="text"
              {...register('portfolioPdf')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="files/portfolio.pdf or https://..."
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Field label="City">
            <input
              type="text"
              {...register('city')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your city"
            />
          </Field>

          <Field label="Country">
            <input
              type="text"
              {...register('country')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your country"
            />
          </Field>
        </div>

        <Field label="Intro Text">
          <textarea
            {...register('introText')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Brief introduction or call to action"
          />
        </Field>

        <Field label="Open To Text">
          <textarea
            {...register('openToText')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="What you're open to (collaborations, commissions, etc.)"
          />
        </Field>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
          <FormArray
            items={socialsWithIds}
            onItemsChange={(items) => {
              const socials = items.map(({ id, ...social }) => social);
              handleSocialsChange(socials);
            }}
            onAddItem={createNewSocial}
            renderItem={renderSocial}
            addButtonText="Add Social Link"
          />
        </div>
      </div>
    </div>
  );
}