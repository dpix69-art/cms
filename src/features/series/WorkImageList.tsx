import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';
import ImageDropzone from '../../components/ImageDropzone';
import Field from '../../components/Field';
import type { Image, UploadedFile } from '../../lib/schema';
import { generateId } from '../../lib/slug';

interface SortableImageProps {
  id: string;
  image: Image;
  index: number;
  onChange: (image: Image) => void;
  onRemove: () => void;
}

function SortableImage({ id, image, index, onChange, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      
      <div className="flex-1 grid grid-cols-3 gap-4">
        <Field label="Image URL" required>
          <input
            type="text"
            value={image.url}
            onChange={(e) => onChange({ ...image, url: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="images/series/work.jpg"
          />
        </Field>

        <Field label="Role" required>
          <select
            value={image.role}
            onChange={(e) => onChange({ ...image, role: e.target.value as 'main' | 'detail' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="main">Main</option>
            <option value="detail">Detail</option>
          </select>
        </Field>

        <div className="flex items-end">
          <button
            onClick={onRemove}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface WorkImageListProps {
  images: Image[];
  onChange: (images: Image[]) => void;
  seriesSlug: string;
  workSlug: string;
  uploadedFiles: UploadedFile[];
  onUploadedFilesChange: (files: UploadedFile[]) => void;
}

export default function WorkImageList({
  images,
  onChange,
  seriesSlug,
  workSlug,
  uploadedFiles,
  onUploadedFilesChange,
}: WorkImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((_, index) => index.toString() === active.id);
      const newIndex = images.findIndex((_, index) => index.toString() === over.id);

      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const handleImageChange = (index: number, image: Image) => {
    const newImages = images.map((img, i) => i === index ? image : img);
    onChange(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    onUploadedFilesChange(files);
    
    // Add new images from uploaded files
    const newImages = files.map((file, index) => ({
      url: file.path,
      role: (index === 0 ? 'main' : 'detail') as 'main' | 'detail',
    }));
    
    onChange([...images, ...newImages]);
  };

  const getMainTemplate = () => `images/${seriesSlug}/${workSlug}.{ext}`;
  const getDetailTemplate = () => {
    const detailCount = images.filter(img => img.role === 'detail').length;
    return `images/${seriesSlug}/${workSlug}-d-${detailCount + 1}.{ext}`;
  };

  return (
    <div className="space-y-6">
      <ImageDropzone
        files={uploadedFiles}
        onFilesChange={handleFilesUploaded}
        pathTemplate={images.length === 0 ? getMainTemplate() : getDetailTemplate()}
        templateVariables={{ seriesSlug, workSlug }}
      />

      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Current Images</h4>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={images.map((_, index) => index.toString())} 
              strategy={verticalListSortingStrategy}
            >
              {images.map((image, index) => (
                <SortableImage
                  key={index}
                  id={index.toString()}
                  image={image}
                  index={index}
                  onChange={(img) => handleImageChange(index, img)}
                  onRemove={() => handleRemoveImage(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}