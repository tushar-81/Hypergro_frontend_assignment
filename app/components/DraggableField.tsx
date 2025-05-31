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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
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
      style={style}
      className={clsx(
        'bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200',
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        isDragging && 'opacity-50 scale-95'
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          {field.validation.required && (
            <span className="text-red-500 text-xs">*</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSelect}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="Edit field"
          >
            <Edit3 className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete field"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
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
        <p className="text-xs text-gray-500 mt-2">{field.helpText}</p>
      )}
    </div>
  );
};
