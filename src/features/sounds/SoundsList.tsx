import React from 'react';
import { Edit, Copy } from 'lucide-react';
import FormArray from '../../components/FormArray';
import type { Sound } from '../../lib/schema';
import { generateId, makeSlug } from '../../lib/slug';

interface SoundsListProps {
  data: Sound[];
  onChange: (data: Sound[]) => void;
  onEditSound: (index: number) => void;
  selectedSoundIndex?: number;
}

export default function SoundsList({ data, onChange, onEditSound, selectedSoundIndex }: SoundsListProps) {
  const createNewSound = (): Sound & { id: string } => ({
    id: generateId(),
    slug: '',
    title: '',
    year: new Date().getFullYear(),
    platform: 'soundcloud',
    cover: '',
    embed: '',
    meta: { label: '', platforms: [] },
  });

  const duplicateSound = (sound: Sound): Sound & { id: string } => ({
    ...sound,
    id: generateId(),
    slug: `${sound.slug}-copy`,
    title: `${sound.title} (Copy)`,
  });

  const soundsWithIds = data.map((sound, index) => ({
    ...sound,
    id: `sound-${index}`,
  }));

  const renderItem = (item: Sound & { id: string }, index: number) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {item.title || 'Untitled Sound'}
          </h3>
          <p className="text-sm text-gray-500">
            {item.slug || 'no-slug'} • {item.year} • {item.platform}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const duplicated = duplicateSound(item);
              const newData = [...data];
              newData.splice(index + 1, 0, duplicated);
              onChange(newData);
            }}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Duplicate sound"
          >
            <Copy size={16} />
          </button>
          
          <button
            onClick={() => onEditSound(index)}
            className={`p-2 transition-colors ${
              selectedSoundIndex === index
                ? 'text-blue-600 bg-blue-50 rounded'
                : 'text-gray-400 hover:text-blue-500'
            }`}
            title="Edit sound"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>
      
      {item.meta?.label && (
        <p className="text-sm text-gray-600">Label: {item.meta.label}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sounds</h2>
        <p className="mt-2 text-gray-600">Manage your music releases and audio works.</p>
      </div>

      <FormArray
        items={soundsWithIds}
        onItemsChange={(items) => {
          const updatedData = items.map(({ id, ...sound }) => sound);
          onChange(updatedData);
        }}
        onAddItem={createNewSound}
        renderItem={renderItem}
        addButtonText="Add New Sound"
      />
    </div>
  );
}