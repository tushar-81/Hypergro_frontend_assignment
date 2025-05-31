import React, { useState, useRef, useEffect } from 'react';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { predefinedTemplates } from '~/data/templates';
import { Form } from '~/types/form';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from './Icon';
import { X, Download, Upload, Share2, Save, FolderOpen } from 'lucide-react';
import clsx from 'clsx';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useFormBuilder();
  const [activeTab, setActiveTab] = useState<'templates' | 'saved' | 'share'>('templates');
  const [shareableLink, setShareableLink] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const loadTemplate = (templateForm: any) => {
    const newForm: Form = {
      ...templateForm,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'SET_CURRENT_FORM', payload: newForm });
    onClose();
  };

  const loadSavedForm = (form: Form) => {
    dispatch({ type: 'SET_CURRENT_FORM', payload: form });
    onClose();
  };

  const generateShareableLink = () => {
    if (!state.currentForm) return;
    
    // Save form to localStorage with a shareable ID
    const shareId = uuidv4();
    localStorage.setItem(`shared_form_${shareId}`, JSON.stringify(state.currentForm));
    
    const link = `${window.location.origin}/form/${shareId}`;
    setShareableLink(link);
    
    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
      alert('Shareable link copied to clipboard!');
    });
  };

  const exportForm = () => {
    if (!state.currentForm) return;
    
    const dataStr = JSON.stringify(state.currentForm, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.currentForm.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const formData = JSON.parse(e.target?.result as string);
        const importedForm: Form = {
          ...formData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch({ type: 'SET_CURRENT_FORM', payload: importedForm });
        onClose();
      } catch (error) {
        alert('Error importing form: Invalid file format');
      }
    };
    reader.readAsText(file);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Form Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            aria-label="Close Form Manager"
          >
            <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: 'templates', label: 'Templates', icon: 'Layout' },
                { id: 'saved', label: 'Saved Forms', icon: 'FolderOpen' },
                { id: 'share', label: 'Share & Export', icon: 'Share2' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon name={tab.icon} className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'templates' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Predefined Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => loadTemplate(template.form)}
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.form.fields.length} fields</span>
                        {template.form.isMultiStep && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            Multi-step
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Forms</h3>
                {state.savedForms.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No saved forms yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.savedForms.map((form) => (
                      <div
                        key={form.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => loadSavedForm(form)}
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{form.title}</h4>
                        {form.description && (
                          <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{form.fields.length} fields</span>
                          <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {form.isMultiStep && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                            Multi-step
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'share' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Share & Export</h3>
                
                {!state.currentForm ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No form selected</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Generate Shareable Link */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Generate Shareable Link</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Create a public link that allows others to fill out your form
                      </p>
                      <button
                        onClick={generateShareableLink}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Generate Link</span>
                      </button>
                      
                      {shareableLink && (
                        <div className="mt-4 p-3 bg-gray-50 rounded border">
                          <p className="text-sm font-medium text-gray-700 mb-2">Shareable Link:</p>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={shareableLink}
                              readOnly
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none"
                            />
                            <button
                              onClick={() => navigator.clipboard.writeText(shareableLink)}
                              className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Export Form */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Export Form</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Download your form as a JSON file
                      </p>
                      <button
                        onClick={exportForm}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Form</span>
                      </button>
                    </div>

                    {/* Import Form */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Import Form</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload a previously exported form JSON file
                      </p>
                      <label className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Import Form</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importForm}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
