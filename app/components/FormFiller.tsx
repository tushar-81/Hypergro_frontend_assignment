import React, { useState, useEffect } from 'react';
import { Form, FormSubmission } from '~/types/form';
import { FieldRenderer } from './FieldRenderer';
import { validateForm, getFieldDefaultValue } from '~/utils/validation';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

interface FormFillerProps {
  form: Form;
  onSubmit?: (submission: FormSubmission) => void;
  className?: string;
}

export const FormFiller: React.FC<FormFillerProps> = ({ 
  form, 
  onSubmit,
  className 
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Initialize form data with default values
    const initialData: Record<string, any> = {};
    form.fields.forEach(field => {
      initialData[field.id] = getFieldDefaultValue(field);
    });
    setFormData(initialData);
  }, [form]);

  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    
    // Add to touched fields
    setTouchedFields(prev => new Set([...prev, fieldId]));

    // Clear field error if it exists
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const getCurrentStepFields = () => {
    if (!form.isMultiStep) {
      return form.fields;
    }
    
    return form.fields.filter(field => field.step === currentStep + 1);
  };

  const canProceedToNextStep = () => {
    const currentFields = getCurrentStepFields();
    const currentStepErrors = validateForm(currentFields, formData);
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allErrors = validateForm(form.fields, formData);
    setErrors(allErrors);
    
    if (Object.keys(allErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Create submission
        const submission: FormSubmission = {
          id: uuidv4(),
          formId: form.id,
          data: formData,
          submittedAt: new Date(),
        };

        // Save submission to localStorage (in a real app, this would be sent to a server)
        const existingSubmissions = JSON.parse(
          localStorage.getItem(`submissions_${form.id}`) || '[]'
        );
        existingSubmissions.push(submission);
        localStorage.setItem(
          `submissions_${form.id}`, 
          JSON.stringify(existingSubmissions)
        );

        // Call onSubmit callback if provided
        if (onSubmit) {
          await onSubmit(submission);
        }

        setIsSubmitted(true);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting the form. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Mark all fields as touched to show errors
      const allFieldIds = new Set(form.fields.map(f => f.id));
      setTouchedFields(allFieldIds);
    }
  };

  const getTotalSteps = () => {
    if (!form.isMultiStep) return 1;
    const maxStep = Math.max(...form.fields.map(f => f.step || 1));
    return maxStep;
  };

  const getStepTitle = (step: number) => {
    if (!form.isMultiStep) return form.title;
    return form.steps?.[step]?.title || `Step ${step + 1}`;
  };

  const getStepDescription = (step: number) => {
    if (!form.isMultiStep) return form.description;
    return form.steps?.[step]?.description;
  };  if (isSubmitted) {
    return (
      <div className={clsx('max-w-2xl mx-auto p-4 md:p-6', className)}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base">
            Your form has been submitted successfully. We'll get back to you soon.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({});
              setCurrentStep(0);
              setTouchedFields(new Set());
              setErrors({});
              // Reinitialize form data
              const initialData: Record<string, any> = {};
              form.fields.forEach(field => {
                initialData[field.id] = getFieldDefaultValue(field);
              });
              setFormData(initialData);
            }}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm md:text-base min-h-[44px]"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = getTotalSteps();
  const currentFields = getCurrentStepFields();
  const progress = form.isMultiStep ? ((currentStep + 1) / totalSteps) * 100 : 100;  return (
    <div className={clsx('max-w-2xl mx-auto p-4 md:p-6', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              {getStepTitle(currentStep)}
            </h1>
            {getStepDescription(currentStep) && (
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">{getStepDescription(currentStep)}</p>
            )}
          </div>          {/* Progress Bar (Multi-step only) */}
          {form.isMultiStep && (
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6 md:space-y-8">
            {currentFields.map(field => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
                error={touchedFields.has(field.id) ? errors[field.id] : undefined}
              />
            ))}
          </div>{/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Please fix the following errors:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    {Object.entries(errors).map(([fieldId, error]) => {
                      const field = form.fields.find(f => f.id === fieldId);
                      return (
                        <li key={fieldId}>
                          {field?.label}: {error}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}          {/* Navigation Buttons */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
            {form.isMultiStep && currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center justify-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium min-h-[44px] w-full sm:w-auto"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {form.isMultiStep && currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
                className={clsx(
                  'flex items-center justify-center space-x-2 px-6 py-3 rounded-md transition-colors font-medium min-h-[44px] w-full sm:w-auto',
                  canProceedToNextStep()
                    ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                )}
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                  'flex items-center justify-center space-x-2 px-8 py-3 rounded-md transition-colors font-medium min-h-[44px] w-full sm:w-auto',
                  isSubmitting
                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
