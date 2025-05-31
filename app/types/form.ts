export type FieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'date' | 'email' | 'phone' | 'radio' | 'number';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  validation: FieldValidation;
  options?: DropdownOption[]; // For dropdown and radio fields
  step?: number; // For multi-step forms
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  steps?: FormStep[];
  isMultiStep: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
}

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>;
}
