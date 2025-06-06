import React, { useState, useRef, useEffect } from 'react';
import { useFormBuilder } from '~/context/FormBuilderContext';
import { predefinedTemplates } from '~/data/templates';
import { Form } from '~/types/form';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from './Icon';
import { X, Download, Upload, Share2, Save, FolderOpen, BarChart3, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { FormResponseViewer } from './FormResponseViewer';
import clsx from 'clsx';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useFormBuilder();
  const [activeTab, setActiveTab] = useState<'templates' | 'saved' | 'share' | 'responses'>('templates');
  const [shareableLink, setShareableLink] = useState<string>('');
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // Reset activeTab to 'templates' when modal opens and cleanup when it closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('templates');
      setShowResponseViewer(false);
    } else {
      // Reset all state when modal closes
      setActiveTab('templates');
      setShowResponseViewer(false);
      setShareableLink('');
    }
  }, [isOpen]);
  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if FormResponseViewer is open
      if (showResponseViewer) return;
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // If FormResponseViewer is open, close it first, otherwise close the main modal
        if (showResponseViewer) {
          setShowResponseViewer(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, showResponseViewer]);

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
    
    // Copy to clipboard and show mobile-aware warning
    navigator.clipboard.writeText(link).then(() => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        alert('⚠️ Link copied! Note: This form is stored locally on this device. Recipients may see "Form Not Found" if they haven\'t accessed it from this device before. Consider exporting the form instead for reliable sharing.');
      } else {
        alert('✅ Shareable link copied to clipboard!\n\n⚠️ Important: This form is stored in your browser\'s local storage. Recipients on different devices may see "Form Not Found". For reliable cross-device sharing, consider exporting the form as JSON instead.');
      }
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert('Link copied! ⚠️ Note: Forms are stored locally and may not work on other devices. Consider exporting as JSON for reliable sharing.');
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
  };  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
            <span className="hidden md:inline">Form Manager</span>
            <span className="md:hidden">Manager</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
            aria-label="Close Form Manager"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Mobile Tab Navigation */}
          <div className="md:hidden border-b border-gray-200 dark:border-gray-700 p-2">
            <div className="flex space-x-1 overflow-x-auto">
              {[
                { id: 'templates', label: 'Templates', icon: 'Layout' },
                { id: 'saved', label: 'Saved', icon: 'FolderOpen' },
                { id: 'share', label: 'Share', icon: 'Share2' },
                { id: 'responses', label: 'Responses', icon: 'BarChart3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'flex items-center space-x-1 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon name={tab.icon} className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {[
                { id: 'templates', label: 'Templates', icon: 'Layout' },
                { id: 'saved', label: 'Saved Forms', icon: 'FolderOpen' },
                { id: 'share', label: 'Share & Export', icon: 'Share2' },
                { id: 'responses', label: 'View Responses', icon: 'BarChart3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon name={tab.icon} className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'templates' && (
              <div>
                <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Predefined Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {predefinedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-700"
                      onClick={() => loadTemplate(template.form)}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm md:text-base">{template.name}</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{template.form.fields.length} fields</span>
                        {template.form.isMultiStep && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                            Multi-step
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}            {activeTab === 'saved' && (
              <div>
                <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Saved Forms</h3>
                {state.savedForms.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">No saved forms yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {state.savedForms.map((form) => (
                      <div
                        key={form.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-700"
                        onClick={() => loadSavedForm(form)}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm md:text-base">{form.title}</h4>
                        {form.description && (
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3">{form.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{form.fields.length} fields</span>
                          <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {form.isMultiStep && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs">
                            Multi-step
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}            {activeTab === 'share' && (
              <div>
                <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Share & Export</h3>
                
                {!state.currentForm ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">No form selected</p>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">                    {/* Share Form Link */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm md:text-base">Share Form Link</h4>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <p className="font-medium mb-1">Important Limitation</p>
                            <p className="text-xs">
                              Forms are stored locally in your browser. Links may show "Form Not Found" on other devices. 
                              For reliable sharing, use the Export option instead.
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Generate a shareable link for this device/browser only
                      </p>
                      <button
                        onClick={generateShareableLink}
                        className="flex items-center justify-center space-x-2 px-4 py-3 md:py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full sm:w-auto min-h-[44px] md:min-h-[36px] text-sm md:text-base"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Generate Link</span>
                      </button>
                      
                      {shareableLink && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-600">
                          <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Shareable Link:</p>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                              type="text"
                              value={shareableLink}
                              readOnly
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              onClick={() => navigator.clipboard.writeText(shareableLink)}
                              className="px-3 py-2 text-sm bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-400 min-h-[44px] md:min-h-[36px]"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            ⚠️ This link only works on devices that have accessed this form before
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Export Form - Recommended */}
                    <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-start space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100 text-sm md:text-base">Export Form (Recommended)</h4>
                          <p className="text-xs md:text-sm text-green-700 dark:text-green-300 mt-1">
                            Download as JSON file for reliable cross-device sharing
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={exportForm}
                        className="flex items-center justify-center space-x-2 px-4 py-3 md:py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors w-full sm:w-auto min-h-[44px] md:min-h-[36px] text-sm md:text-base"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Form</span>
                      </button>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        ✅ Recipients can import this file on any device
                      </p>                    </div>

                    {/* Import Form */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm md:text-base">Import Form</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Upload a previously exported form JSON file
                      </p>
                      <label className="flex items-center justify-center space-x-2 px-4 py-3 md:py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-md hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors cursor-pointer w-full sm:w-auto min-h-[44px] md:min-h-[36px] text-sm md:text-base">
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
            )}            {activeTab === 'responses' && (
              <div>
                <div className="flex items-center mb-4">
                  
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Form Responses</h3>
                </div>
                
                {!state.currentForm ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No form selected</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Select a form to view its responses and analytics
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {state.currentForm.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        View and analyze responses submitted to this form
                      </p>
                      <button
                        onClick={() => setShowResponseViewer(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>View Responses</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>        {/* Form Response Viewer Modal */}
      {showResponseViewer && state.currentForm && (        <FormResponseViewer
          form={state.currentForm}
          isOpen={showResponseViewer}
          onClose={() => setShowResponseViewer(false)}
          onBack={() => {
            setShowResponseViewer(false);
            setActiveTab('templates');
          }}
        />
      )}
    </div>
  );
};
