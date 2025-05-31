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
  history: Form[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
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
  | { type: 'TOGGLE_MULTI_STEP' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: FormBuilderState = {
  currentForm: null,
  selectedField: null,
  previewMode: 'desktop',
  currentStep: 0,
  isDragging: false,
  savedForms: [],
  templates: [],
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
};

const MAX_HISTORY_SIZE = 50;

// Helper function to add a state to history
const addToHistory = (state: FormBuilderState, form: Form): FormBuilderState => {
  if (!form) return state;
  
  // Create a deep copy of the form for history
  const formSnapshot = JSON.parse(JSON.stringify(form));
  
  // Remove items after current index (when making new changes after undo)
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  
  // Add new state to history
  newHistory.push(formSnapshot);
  
  // Limit history size
  if (newHistory.length > MAX_HISTORY_SIZE) {
    newHistory.shift();
  } else {
    // Only increment index if we didn't remove from the beginning
    return {
      ...state,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 0,
      canRedo: false,
    };
  }
  
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    canUndo: newHistory.length > 0,
    canRedo: false,
  };
};

// Helper function to check if an action should be added to history
const shouldAddToHistory = (action: FormBuilderAction): boolean => {
  return [
    'ADD_FIELD',
    'UPDATE_FIELD', 
    'DELETE_FIELD',
    'REORDER_FIELDS',
    'TOGGLE_MULTI_STEP',
    'SET_CURRENT_FORM'
  ].includes(action.type);
};

const formBuilderReducer = (state: FormBuilderState, action: FormBuilderAction): FormBuilderState => {  switch (action.type) {
    case 'SET_CURRENT_FORM': {
      const newState = { ...state, currentForm: action.payload };
      return shouldAddToHistory(action) && action.payload
        ? addToHistory(newState, action.payload)
        : newState;
    }
    
    case 'CREATE_NEW_FORM': {
      const newForm: Form = {
        id: uuidv4(),
        title: 'Untitled Form',
        description: '',
        fields: [],
        isMultiStep: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newState = { ...state, currentForm: newForm, selectedField: null };
      return addToHistory(newState, newForm);
    }
    
    case 'ADD_FIELD': {
      if (!state.currentForm) return state;
      const updatedForm = {
        ...state.currentForm,
        fields: [...state.currentForm.fields, action.payload],
        updatedAt: new Date(),
      };
      const newState = {
        ...state,
        currentForm: updatedForm,
      };
      return addToHistory(newState, updatedForm);
    }
    
    case 'UPDATE_FIELD': {
      if (!state.currentForm) return state;
      const updatedForm = {
        ...state.currentForm,
        fields: state.currentForm.fields.map(field =>
          field.id === action.payload.id ? { ...field, ...action.payload.field } : field
        ),
        updatedAt: new Date(),
      };
      const newState = {
        ...state,
        currentForm: updatedForm,
        selectedField: state.selectedField?.id === action.payload.id 
          ? { ...state.selectedField, ...action.payload.field } 
          : state.selectedField,
      };
      return addToHistory(newState, updatedForm);
    }
    
    case 'DELETE_FIELD': {
      if (!state.currentForm) return state;
      const updatedForm = {
        ...state.currentForm,
        fields: state.currentForm.fields.filter(field => field.id !== action.payload),
        updatedAt: new Date(),
      };
      const newState = {
        ...state,
        currentForm: updatedForm,
        selectedField: state.selectedField?.id === action.payload ? null : state.selectedField,
      };
      return addToHistory(newState, updatedForm);
    }
    
    case 'REORDER_FIELDS': {
      if (!state.currentForm) return state;
      const updatedForm = {
        ...state.currentForm,
        fields: action.payload,
        updatedAt: new Date(),
      };
      const newState = {
        ...state,
        currentForm: updatedForm,
      };
      return addToHistory(newState, updatedForm);
    }
      case 'TOGGLE_MULTI_STEP': {
      if (!state.currentForm) return state;
      
      let updatedForm;
      
      if (!state.currentForm.isMultiStep) {
        // Enabling multi-step: distribute fields across steps
        const fieldsCount = state.currentForm.fields.length;
        const targetSteps = Math.max(2, Math.min(3, Math.ceil(fieldsCount / 3))); // 2-3 steps based on field count
        const fieldsPerStep = Math.ceil(fieldsCount / targetSteps);
        
        const updatedFields = state.currentForm.fields.map((field, index) => ({
          ...field,
          step: Math.floor(index / fieldsPerStep) + 1
        }));
        
        const steps = Array.from({ length: targetSteps }, (_, i) => ({
          id: uuidv4(),
          title: `Step ${i + 1}`,
          description: i === 0 ? 'Basic Information' : 
                      i === 1 ? 'Additional Details' : 
                      'Final Steps',
          fields: [],
        }));
        
        updatedForm = {
          ...state.currentForm,
          isMultiStep: true,
          fields: updatedFields,
          steps,
          updatedAt: new Date(),
        };
      } else {
        // Disabling multi-step: reset all fields to step 1
        const updatedFields = state.currentForm.fields.map(field => ({
          ...field,
          step: 1
        }));
        
        updatedForm = {
          ...state.currentForm,
          isMultiStep: false,
          fields: updatedFields,
          steps: undefined,
          updatedAt: new Date(),
        };
      }
      
      const newState = {
        ...state,
        currentForm: updatedForm,
      };
      return addToHistory(newState, updatedForm);
    }
    
    case 'UNDO': {
      if (!state.canUndo || state.historyIndex <= 0) return state;
      
      const newIndex = state.historyIndex - 1;
      const previousForm = state.history[newIndex];
      
      return {
        ...state,
        currentForm: previousForm,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        selectedField: null, // Clear selection when undoing
      };
    }
    
    case 'REDO': {
      if (!state.canRedo || state.historyIndex >= state.history.length - 1) return state;
      
      const newIndex = state.historyIndex + 1;
      const nextForm = state.history[newIndex];
      
      return {
        ...state,
        currentForm: nextForm,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
        selectedField: null, // Clear selection when redoing
      };    }
    
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
