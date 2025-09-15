import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove?: () => void;
}

function SortableItem({ id, children, onRemove }: SortableItemProps) {
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
      
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

interface FormArrayProps<T> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  onAddItem: () => T;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode;
  addButtonText?: string;
  className?: string;
}

export default function FormArray<T extends { id?: string }>({
  items,
  onItemsChange,
  onAddItem,
  renderItem,
  addButtonText = 'Add Item',
  className = '',
}: FormArrayProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item, index) => 
        (item.id || index.toString()) === active.id
      );
      const newIndex = items.findIndex((item, index) => 
        (item.id || index.toString()) === over.id
      );

      onItemsChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleAddItem = () => {
    const newItem = onAddItem();
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const handleUpdateItem = (index: number, updatedItem: T) => {
    const newItems = items.map((item, i) => i === index ? updatedItem : item);
    onItemsChange(newItems);
  };

  const itemIds = items.map((item, index) => item.id || index.toString());

  return (
    <div className={`space-y-4 ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id || index}
              id={item.id || index.toString()}
              onRemove={() => handleRemoveItem(index)}
            >
              {renderItem(item, index, (updatedItem) => handleUpdateItem(index, updatedItem))}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={handleAddItem}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Plus size={16} />
        <span>{addButtonText}</span>
      </button>
    </div>
  );
}