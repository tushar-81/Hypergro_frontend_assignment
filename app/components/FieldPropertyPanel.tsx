import React, { useState } from 'react';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { FormField, DropdownOption } from '~/types/form';
import { Icon } from './Icon';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

export const FieldPropertyPanel: React.FC = () => {
  const { state, dispatch } = useFormBuilder();
  const { selectedField } = state;

  if (!selectedField) {
    return (
      <div className="bg-white border-l border-gray-200 w-80 p-4 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Icon name="Settings" className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Select a field to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateField = (updates: Partial<FormField>) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: selectedField.id, field: updates },
    });
  };

  const addOption = () => {
    const newOption: DropdownOption = {
      id: uuidv4(),
      label: `Option ${(selectedField.options?.length || 0) + 1}`,
      value: `option${(selectedField.options?.length || 0) + 1}`,
    };
    
    updateField({
      options: [...(selectedField.options || []), newOption],
    });
  };

  const updateOption = (optionId: string, updates: Partial<DropdownOption>) => {
    const updatedOptions = selectedField.options?.map(option =>
      option.id === optionId ? { ...option, ...updates } : option
    );
    updateField({ options: updatedOptions });
  };

  const deleteOption = (optionId: string) => {
    const updatedOptions = selectedField.options?.filter(option => option.id !== optionId);
    updateField({ options: updatedOptions });
  };

  const hasOptions = selectedField.type === 'dropdown' || selectedField.type === 'radio';

  return (
    <div className="bg-white border-l border-gray-200 w-80 p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Field Properties</h3>
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {selectedField.type.charAt(0).toUpperCase() + selectedField.type.slice(1)} Field
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Properties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label
          </label>
          <input
            type="text"
            value={selectedField.label}
            onChange={(e) => updateField({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedField.type !== 'checkbox' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder
            </label>
            <input
              type="text"
              value={selectedField.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Help Text
          </label>
          <textarea
            value={selectedField.helpText || ''}
            onChange={(e) => updateField({ helpText: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Validation Properties */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Validation</h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedField.validation.required || false}
                onChange={(e) => updateField({
                  validation: { ...selectedField.validation, required: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>

            {(selectedField.type === 'text' || selectedField.type === 'textarea') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Length
                  </label>
                  <input
                    type="number"
                    value={selectedField.validation.minLength || ''}
                    onChange={(e) => updateField({
                      validation: { 
                        ...selectedField.validation, 
                        minLength: e.target.value ? parseInt(e.target.value) : undefined 
                      }
                    })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Length
                  </label>
                  <input
                    type="number"
                    value={selectedField.validation.maxLength || ''}
                    onChange={(e) => updateField({
                      validation: { 
                        ...selectedField.validation, 
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                      }
                    })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {selectedField.type === 'number' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Value
                  </label>
                  <input
                    type="number"
                    value={selectedField.validation.min || ''}
                    onChange={(e) => updateField({
                      validation: { 
                        ...selectedField.validation, 
                        min: e.target.value ? parseInt(e.target.value) : undefined 
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Value
                  </label>
                  <input
                    type="number"
                    value={selectedField.validation.max || ''}
                    onChange={(e) => updateField({
                      validation: { 
                        ...selectedField.validation, 
                        max: e.target.value ? parseInt(e.target.value) : undefined 
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {(selectedField.type === 'text' || selectedField.type === 'email' || selectedField.type === 'phone') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern (Regex)
                </label>
                <input
                  type="text"
                  value={selectedField.validation.pattern || ''}
                  onChange={(e) => updateField({
                    validation: { 
                      ...selectedField.validation, 
                      pattern: e.target.value || undefined 
                    }
                  })}
                  placeholder="e.g., ^[A-Za-z]+$"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Options for dropdown and radio fields */}
        {hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900">Options</h4>
              <button
                onClick={addOption}
                className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2">
              {selectedField.options?.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(option.id, { label: e.target.value })}
                      placeholder={`Option ${index + 1} label`}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => updateOption(option.id, { value: e.target.value })}
                      placeholder={`Option ${index + 1} value`}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => deleteOption(option.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={(selectedField.options?.length || 0) <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
