import { FormField, FieldType } from '~/types/form';
import { v4 as uuidv4 } from 'uuid';

export const createField = (type: FieldType, step: number = 1): FormField => {
  const baseField = {
    id: uuidv4(),
    type,
    label: getDefaultLabel(type),
    validation: {},
    step,
  };

  switch (type) {
    case 'text':
      return {
        ...baseField,
        placeholder: 'Enter text...',
        validation: { maxLength: 255 },
      };
    
    case 'textarea':
      return {
        ...baseField,
        placeholder: 'Enter your message...',
        validation: { maxLength: 1000 },
      };
    
    case 'email':
      return {
        ...baseField,
        placeholder: 'your.email@example.com',
        validation: { 
          required: true,
          pattern: '^[^@]+@[^@]+\\.[^@]+$'
        },
      };
    
    case 'phone':
      return {
        ...baseField,
        placeholder: '+1 (555) 123-4567',
        validation: { 
          pattern: '^\\+?[1-9]\\d{1,14}$'
        },
      };
    
    case 'number':
      return {
        ...baseField,
        placeholder: 'Enter number...',
        validation: {},
      };
    
    case 'date':
      return {
        ...baseField,
        validation: { required: false },
      };
    
    case 'dropdown':
      return {
        ...baseField,
        validation: { required: true },
        options: [
          { id: uuidv4(), label: 'Option 1', value: 'option1' },
          { id: uuidv4(), label: 'Option 2', value: 'option2' },
        ],
      };
    
    case 'radio':
      return {
        ...baseField,
        validation: { required: true },
        options: [
          { id: uuidv4(), label: 'Option 1', value: 'option1' },
          { id: uuidv4(), label: 'Option 2', value: 'option2' },
        ],
      };
    
    case 'checkbox':
      return {
        ...baseField,
        validation: { required: false },
      };
    
    default:
      return baseField;
  }
};

const getDefaultLabel = (type: FieldType): string => {
  const labels: Record<FieldType, string> = {
    text: 'Text Input',
    textarea: 'Text Area',
    email: 'Email Address',
    phone: 'Phone Number',
    number: 'Number',
    date: 'Date',
    dropdown: 'Dropdown',
    radio: 'Radio Buttons',
    checkbox: 'Checkbox',
  };
  
  return labels[type] || 'Field';
};

export const getFieldIcon = (type: FieldType): string => {
  const icons: Record<FieldType, string> = {
    text: 'Type',
    textarea: 'AlignLeft',
    email: 'Mail',
    phone: 'Phone',
    number: 'Hash',
    date: 'Calendar',
    dropdown: 'ChevronDown',
    radio: 'Circle',
    checkbox: 'Square',
  };
  
  return icons[type] || 'Type';
};
