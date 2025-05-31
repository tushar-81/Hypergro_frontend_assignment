import { FormField, FieldValidation } from '~/types/form';

export const validateField = (field: FormField, value: any): string | null => {
  const { validation } = field;

  // Required validation
  if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${field.label} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value);

  // Min length validation
  if (validation.minLength && stringValue.length < validation.minLength) {
    return `${field.label} must be at least ${validation.minLength} characters`;
  }

  // Max length validation
  if (validation.maxLength && stringValue.length > validation.maxLength) {
    return `${field.label} must be no more than ${validation.maxLength} characters`;
  }

  // Pattern validation
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(stringValue)) {
      if (field.type === 'email') {
        return 'Please enter a valid email address';
      } else if (field.type === 'phone') {
        return 'Please enter a valid phone number';
      } else {
        return `${field.label} format is invalid`;
      }
    }
  }

  // Number validations
  if (field.type === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${field.label} must be a valid number`;
    }
    
    if (validation.min !== undefined && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    
    if (validation.max !== undefined && numValue > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }
  }

  return null;
};

export const validateForm = (fields: FormField[], formData: Record<string, any>): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const error = validateField(field, formData[field.id]);
    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
};

export const getFieldDefaultValue = (field: FormField): any => {
  switch (field.type) {
    case 'checkbox':
      return false;
    case 'number':
      return '';
    case 'dropdown':
    case 'radio':
      return '';
    default:
      return '';
  }
};

export const isFieldValid = (field: FormField, value: any): boolean => {
  return validateField(field, value) === null;
};
