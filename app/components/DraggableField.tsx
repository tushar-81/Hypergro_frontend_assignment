import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '~/types/form';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { FieldRenderer } from './FieldRenderer';
import { Trash2, Edit3, GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface DraggableFieldProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  isPreview?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  isSelected,
  isPreview = false,
  value,
  onChange,
  error,
}) => {
  const { dispatch } = useFormBuilder();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSelect = () => {
    if (!isPreview) {
      dispatch({ type: 'SELECT_FIELD', payload: field });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_FIELD', payload: field.id });
  };
  if (isPreview) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <FieldRenderer
          field={field}
          value={value}
          onChange={onChange || (() => {})}
          error={error}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}      className={clsx(
        'bg-white dark:bg-gray-800 border rounded-lg p-4 cursor-pointer transition-all duration-200',
        'touch-manipulation', // Improve touch performance
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm',
        isDragging && 'opacity-50 scale-95'
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 md:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded touch-manipulation"
          >
            <GripVertical className="h-5 w-5 md:h-4 md:w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </span>
          {field.validation.required && (
            <span className="text-red-500 text-xs">*</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">          <button
            onClick={handleSelect}
            className="p-2 md:p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors min-h-[44px] md:min-h-[32px] min-w-[44px] md:min-w-[32px] flex items-center justify-center"
            title="Edit field"
          >
            <Edit3 className="h-5 w-5 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 md:p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors min-h-[44px] md:min-h-[32px] min-w-[44px] md:min-w-[32px] flex items-center justify-center"
            title="Delete field"
          >
            <Trash2 className="h-5 w-5 md:h-4 md:w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
      
      <div className="pointer-events-none">
        <FieldRenderer
          field={field}
          value={''}
          onChange={() => {}}
          disabled={true}
          className="opacity-75"
        />
      </div>
        {field.helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{field.helpText}</p>
      )}
    </div>
  );
};
