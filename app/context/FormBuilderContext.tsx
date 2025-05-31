import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Form, FormField, FormStep, FormTemplate, PreviewMode } from '~/types/form';
import { v4 as uuidv4 } from 'uuid';

interface FormBuilderState {
  currentForm: Form | null;
  selectedField: FormField | null;
  previewMode: PreviewMode;
  currentStep: number;
  isDragging: boolean;
  savedForms: Form[];
  templates: FormTemplate[];
}

type FormBuilderAction =
  | { type: 'SET_CURRENT_FORM'; payload: Form }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: { id: string; field: Partial<FormField> } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: FormField[] }
  | { type: 'SELECT_FIELD'; payload: FormField | null }
  | { type: 'SET_PREVIEW_MODE'; payload: PreviewMode }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_IS_DRAGGING'; payload: boolean }
  | { type: 'SAVE_FORM'; payload: Form }
  | { type: 'LOAD_FORMS'; payload: Form[] }
  | { type: 'CREATE_NEW_FORM' }
  | { type: 'ADD_STEP'; payload: FormStep }
  | { type: 'UPDATE_STEP'; payload: { id: string; step: Partial<FormStep> } }
  | { type: 'DELETE_STEP'; payload: string }
  | { type: 'TOGGLE_MULTI_STEP' };

const initialState: FormBuilderState = {
  currentForm: null,
  selectedField: null,
  previewMode: 'desktop',
  currentStep: 0,
  isDragging: false,
  savedForms: [],
  templates: [],
};

const formBuilderReducer = (state: FormBuilderState, action: FormBuilderAction): FormBuilderState => {
  switch (action.type) {
    case 'SET_CURRENT_FORM':
      return { ...state, currentForm: action.payload };
    
    case 'CREATE_NEW_FORM':
      const newForm: Form = {
        id: uuidv4(),
        title: 'Untitled Form',
        description: '',
        fields: [],
        isMultiStep: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { ...state, currentForm: newForm, selectedField: null };
    
    case 'ADD_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: [...state.currentForm.fields, action.payload],
          updatedAt: new Date(),
        },
      };
    
    case 'UPDATE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id ? { ...field, ...action.payload.field } : field
          ),
          updatedAt: new Date(),
        },
        selectedField: state.selectedField?.id === action.payload.id 
          ? { ...state.selectedField, ...action.payload.field } 
          : state.selectedField,
      };
    
    case 'DELETE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.filter(field => field.id !== action.payload),
          updatedAt: new Date(),
        },
        selectedField: state.selectedField?.id === action.payload ? null : state.selectedField,
      };
    
    case 'REORDER_FIELDS':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: action.payload,
          updatedAt: new Date(),
        },
      };
    
    case 'SELECT_FIELD':
      return { ...state, selectedField: action.payload };
    
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_IS_DRAGGING':
      return { ...state, isDragging: action.payload };
    
    case 'SAVE_FORM':
      const updatedForms = state.savedForms.filter(form => form.id !== action.payload.id);
      return {
        ...state,
        savedForms: [...updatedForms, action.payload],
      };
    
    case 'LOAD_FORMS':
      return { ...state, savedForms: action.payload };
    
    case 'TOGGLE_MULTI_STEP':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          isMultiStep: !state.currentForm.isMultiStep,
          steps: !state.currentForm.isMultiStep ? [
            {
              id: uuidv4(),
              title: 'Step 1',
              fields: [...state.currentForm.fields],
            }
          ] : undefined,
          updatedAt: new Date(),
        },
      };
    
    default:
      return state;
  }
};

const FormBuilderContext = createContext<{
  state: FormBuilderState;
  dispatch: React.Dispatch<FormBuilderAction>;
} | null>(null);

export const FormBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  // Auto-save functionality
  useEffect(() => {
    if (state.currentForm) {
      const saveTimer = setTimeout(() => {
        if (state.currentForm) {
          localStorage.setItem(`form_${state.currentForm.id}`, JSON.stringify(state.currentForm));
          dispatch({ type: 'SAVE_FORM', payload: state.currentForm });
        }
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
  }, [state.currentForm]);

  // Load saved forms on mount
  useEffect(() => {
    const savedForms: Form[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('form_')) {
        try {
          const form = JSON.parse(localStorage.getItem(key) || '');
          savedForms.push(form);
        } catch (error) {
          console.error('Error loading form:', error);
        }
      }
    }
    dispatch({ type: 'LOAD_FORMS', payload: savedForms });
  }, []);

  return (
    <FormBuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </FormBuilderContext.Provider>
  );
};

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
};
