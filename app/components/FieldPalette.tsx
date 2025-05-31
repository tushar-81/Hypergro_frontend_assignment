import React from 'react';
import { FieldType } from '~/types/form';
import { createField, getFieldIcon } from '~/utils/fieldUtils';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { Icon } from './Icon';
import clsx from 'clsx';

const fieldTypes: { type: FieldType; label: string; description: string }[] = [
  { type: 'text', label: 'Text Input', description: 'Single line text field' },
  { type: 'textarea', label: 'Text Area', description: 'Multi-line text field' },
  { type: 'email', label: 'Email', description: 'Email address input' },
  { type: 'phone', label: 'Phone', description: 'Phone number input' },
  { type: 'number', label: 'Number', description: 'Numeric input field' },
  { type: 'date', label: 'Date', description: 'Date picker input' },
  { type: 'dropdown', label: 'Dropdown', description: 'Select from options' },
  { type: 'radio', label: 'Radio Buttons', description: 'Single selection from options' },
  { type: 'checkbox', label: 'Checkbox', description: 'Boolean input field' },
];

export const FieldPalette: React.FC = () => {
  const { state, dispatch } = useFormBuilder();

  const handleAddField = (type: FieldType) => {
    if (!state.currentForm) return;
    
    const currentStep = state.currentForm.isMultiStep ? state.currentStep + 1 : 1;
    const newField = createField(type, currentStep);
    
    dispatch({ type: 'ADD_FIELD', payload: newField });
    dispatch({ type: 'SELECT_FIELD', payload: newField });
  };

  return (    <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Field Components</h3>
      
      <div className="space-y-2">
        {fieldTypes.map((fieldType) => (
          <button
            key={fieldType.type}
            onClick={() => handleAddField(fieldType.type)}            className={clsx(
              'w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600',
              'hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'bg-white dark:bg-gray-700',
              !state.currentForm && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!state.currentForm}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">                <Icon 
                  name={getFieldIcon(fieldType.type)} 
                  className="h-5 w-5 text-gray-600 dark:text-gray-400" 
                />
              </div>
              <div className="flex-1 min-w-0">                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {fieldType.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {fieldType.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => dispatch({ type: 'CREATE_NEW_FORM' })}
            className="w-full text-left p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
          >
            Create New Form
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MULTI_STEP' })}            className={clsx(
              'w-full text-left p-2 text-sm rounded-md transition-colors',
              state.currentForm?.isMultiStep 
                ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
              !state.currentForm && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!state.currentForm}
          >
            {state.currentForm?.isMultiStep ? 'Disable Multi-Step' : 'Enable Multi-Step'}
          </button>
        </div>
      </div>
    </div>
  );
};
