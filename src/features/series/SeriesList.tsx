import React from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import FormArray from '../../components/FormArray';
import type { Series } from '../../lib/schema';
import { generateId, makeSlug } from '../../lib/slug';

interface SeriesListProps {
  data: Series[];
  onChange: (data: Series[]) => void;
  onEditSeries: (index: number) => void;
  selectedSeriesIndex?: number;
}

export default function SeriesList({ data, onChange, onEditSeries, selectedSeriesIndex }: SeriesListProps) {
  const createNewSeries = (): Series & { id: string } => ({
    id: generateId(),
    slug: '',
    title: '',
    year: new Date().getFullYear().toString(),
    intro: '',
    artworkImages: [],
    works: [],
  });

  const duplicateSeries = (series: Series): Series & { id: string } => ({
    ...series,
    id: generateId(),
    slug: `${series.slug}-copy`,
    title: `${series.title} (Copy)`,
    works: series.works.map(work => ({
      ...work,
      slug: `${work.slug}-copy`,
    })),
  });

  const seriesWithIds = data.map((series, index) => ({
    ...series,
    id: `series-${index}`,
  }));

  const renderItem = (item: Series & { id: string }, index: number) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {item.title || 'Untitled Series'}
          </h3>
          <p className="text-sm text-gray-500">
            {item.slug || 'no-slug'} • {item.year} • {item.works.length} works
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const duplicated = duplicateSeries(item);
              const newData = [...data];
              newData.splice(index + 1, 0, duplicated);
              onChange(newData);
            }}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Duplicate series"
          >
            <Copy size={16} />
          </button>
          
          <button
            onClick={() => onEditSeries(index)}
            className={`p-2 transition-colors ${
              selectedSeriesIndex === index
                ? 'text-blue-600 bg-blue-50 rounded'
                : 'text-gray-400 hover:text-blue-500'
            }`}
            title="Edit series"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>
      
      {item.intro && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {Array.isArray(item.intro) ? item.intro.join(' ') : item.intro}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Series</h2>
        <p className="mt-2 text-gray-600">Manage your artwork series and collections.</p>
      </div>

      <FormArray
        items={seriesWithIds}
        onItemsChange={(items) => {
          const updatedData = items.map(({ id, ...series }) => series);
          onChange(updatedData);
        }}
        onAddItem={createNewSeries}
        renderItem={renderItem}
        addButtonText="Add New Series"
      />
    </div>
  );
}