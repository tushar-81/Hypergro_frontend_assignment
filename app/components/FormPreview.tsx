import React, { useState, useEffect } from 'react';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { FieldRenderer } from './FieldRenderer';
import { validateForm, getFieldDefaultValue } from '~/utils/validation';
import { PreviewMode } from '~/types/form';
import { Monitor, Tablet, Smartphone, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';

export const FormPreview: React.FC = () => {
  const { state, dispatch } = useFormBuilder();
  const { currentForm, previewMode } = state;
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentForm) {
      const initialData: Record<string, any> = {};
      currentForm.fields.forEach(field => {
        initialData[field.id] = getFieldDefaultValue(field);
      });
      setFormData(initialData);
      setErrors({});
      setTouchedFields(new Set());
      setCurrentStep(0);
    }
  }, [currentForm]);

  if (!currentForm) {
    return (
      <div className="bg-white border-l border-gray-200 w-96 p-4 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No form to preview</p>
        </div>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    
    // Add to touched fields
    setTouchedFields(prev => new Set([...prev, fieldId]));

    // Validate the specific field
    const field = currentForm.fields.find(f => f.id === fieldId);
    if (field) {
      const fieldErrors = validateForm([field], newFormData);
      setErrors(prev => ({
        ...prev,
        [fieldId]: fieldErrors[fieldId] || '',
      }));
    }
  };

  const getCurrentStepFields = () => {
    if (!currentForm.isMultiStep) {
      return currentForm.fields;
    }
    
    return currentForm.fields.filter(field => field.step === currentStep + 1);
  };

  const canProceedToNextStep = () => {
    const currentFields = getCurrentStepFields();
    const currentStepErrors = validateForm(currentFields, formData);
    
    // Check if all required fields in current step are filled and valid
    return Object.keys(currentStepErrors).length === 0;
  };

  const handleNextStep = () => {
    const currentFields = getCurrentStepFields();
    const currentStepErrors = validateForm(currentFields, formData);
    
    if (Object.keys(currentStepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, getTotalSteps() - 1));
    } else {
      setErrors(prev => ({ ...prev, ...currentStepErrors }));
      // Mark all current step fields as touched
      currentFields.forEach(field => {
        setTouchedFields(prev => new Set([...prev, field.id]));
      });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allErrors = validateForm(currentForm.fields, formData);
    setErrors(allErrors);
    
    if (Object.keys(allErrors).length === 0) {
      // Form is valid, handle submission
      alert('Form submitted successfully!\\n\\nData: ' + JSON.stringify(formData, null, 2));
    } else {
      // Mark all fields as touched to show errors
      const allFieldIds = new Set(currentForm.fields.map(f => f.id));
      setTouchedFields(allFieldIds);
    }
  };

  const getTotalSteps = () => {
    if (!currentForm.isMultiStep) return 1;
    const maxStep = Math.max(...currentForm.fields.map(f => f.step || 1));
    return maxStep;
  };

  const getStepTitle = (step: number) => {
    if (!currentForm.isMultiStep) return currentForm.title;
    return currentForm.steps?.[step]?.title || `Step ${step + 1}`;
  };

  const getStepDescription = (step: number) => {
    if (!currentForm.isMultiStep) return currentForm.description;
    return currentForm.steps?.[step]?.description;
  };

  const getPreviewContainerClasses = () => {
    const baseClasses = 'mx-auto bg-white rounded-lg shadow-lg transition-all duration-300';
    
    switch (previewMode) {
      case 'mobile':
        return clsx(baseClasses, 'max-w-sm');
      case 'tablet':
        return clsx(baseClasses, 'max-w-md');
      default:
        return clsx(baseClasses, 'max-w-2xl');
    }
  };

  const totalSteps = getTotalSteps();
  const currentFields = getCurrentStepFields();
  const progress = currentForm.isMultiStep ? ((currentStep + 1) / totalSteps) * 100 : 100;

  return (
    <div className="bg-gray-100 border-l border-gray-200 w-96 p-4 h-full overflow-y-auto">
      {/* Preview Mode Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[            { mode: 'desktop' as PreviewMode, icon: Monitor },
            { mode: 'tablet' as PreviewMode, icon: Tablet },
            { mode: 'mobile' as PreviewMode, icon: Smartphone },
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', payload: mode })}
              className={clsx(
                'flex items-center justify-center p-2 rounded-md transition-colors',
                previewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              title={`${mode} preview`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Form Preview */}
      <div className="relative">
        <div className={getPreviewContainerClasses()}>
          <form onSubmit={handleSubmit} className="p-6">
            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getStepTitle(currentStep)}
              </h2>
              {getStepDescription(currentStep) && (
                <p className="text-gray-600">{getStepDescription(currentStep)}</p>
              )}
            </div>

            {/* Progress Bar (Multi-step only) */}
            {currentForm.isMultiStep && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {currentFields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={touchedFields.has(field.id) ? errors[field.id] : undefined}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentForm.isMultiStep && currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentForm.isMultiStep && currentStep < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep()}
                  className={clsx(
                    'flex items-center space-x-2 px-4 py-2 rounded-md transition-colors',
                    canProceedToNextStep()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Submit</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Form Info */}
      <div className="mt-4 text-xs text-gray-500 bg-white p-3 rounded-lg">
        <div className="space-y-1">
          <div>Form ID: {currentForm.id}</div>
          <div>Fields: {currentForm.fields.length}</div>
          {currentForm.isMultiStep && <div>Steps: {totalSteps}</div>}
          <div>Preview Mode: {previewMode}</div>
        </div>
      </div>
    </div>
  );
};
