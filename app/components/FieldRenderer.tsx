import React from 'react';
import { FormField } from '~/types/form';
import { validateField } from '~/utils/validation';
import clsx from 'clsx';

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  className,
}) => {  const baseInputClasses = clsx(
    'w-full rounded-md border px-3 py-2 text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
    error 
      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500',
    disabled && 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed',
    className
  );

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
            required={field.validation.required}
            minLength={field.validation.minLength}
            maxLength={field.validation.maxLength}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, 'min-h-[100px] resize-vertical')}
            required={field.validation.required}
            minLength={field.validation.minLength}
            maxLength={field.validation.maxLength}
            rows={4}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
            required={field.validation.required}
            min={field.validation.min}
            max={field.validation.max}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.validation.required}
          />
        );
      
      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.validation.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );
        case 'checkbox':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.label}
              {field.validation.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </span>
          </label>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">      {field.type !== 'checkbox' && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.validation.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {field.helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
