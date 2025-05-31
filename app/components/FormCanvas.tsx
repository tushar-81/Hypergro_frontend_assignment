import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { DraggableField } from './DraggableField';
import { Icon } from './Icon';

export const FormCanvas: React.FC = () => {
  const { state, dispatch } = useFormBuilder();
  const { currentForm, selectedField } = state;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && currentForm) {
      const oldIndex = currentForm.fields.findIndex(field => field.id === active.id);
      const newIndex = currentForm.fields.findIndex(field => field.id === over?.id);

      const reorderedFields = arrayMove(currentForm.fields, oldIndex, newIndex);
      dispatch({ type: 'REORDER_FIELDS', payload: reorderedFields });
    }

    dispatch({ type: 'SET_IS_DRAGGING', payload: false });
  };

  const handleDragStart = () => {
    dispatch({ type: 'SET_IS_DRAGGING', payload: true });
  };

  if (!currentForm) {
    return (      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icon name="FileText" className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No Form Selected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create a new form or select an existing one to start building</p>
          <button
            onClick={() => dispatch({ type: 'CREATE_NEW_FORM' })}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Create New Form
          </button>
        </div>
      </div>
    );
  }

  return (    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form Title
              </label>
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => dispatch({
                  type: 'SET_CURRENT_FORM',
                  payload: { ...currentForm, title: e.target.value, updatedAt: new Date() }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter form title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form Description
              </label>
              <textarea
                value={currentForm.description || ''}
                onChange={(e) => dispatch({
                  type: 'SET_CURRENT_FORM',
                  payload: { ...currentForm, description: e.target.value, updatedAt: new Date() }
                })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter form description..."
              />
            </div>            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentForm.fields.length} field{currentForm.fields.length !== 1 ? 's' : ''}
                </span>
                {currentForm.isMultiStep && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    Multi-step
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ID: {currentForm.id}
              </div>
            </div>
          </div>
        </div>

        {/* Fields */}
        {currentForm.fields.length === 0 ? (          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Icon name="Plus" className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Add Your First Field</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Select a field type from the left panel to start building your form
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentForm.fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {currentForm.fields.map((field, index) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    index={index}
                    isSelected={selectedField?.id === field.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
