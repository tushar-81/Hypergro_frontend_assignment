import React, { useState } from 'react';
import { FormBuilderProvider } from '~/context/FormBuilderContext';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldPropertyPanel } from './FieldPropertyPanel';
import { FormPreview } from './FormPreview';
import { TemplateManager } from './TemplateManager';
import { Icon } from './Icon';
import { Save, Eye, EyeOff, Layout, Settings, FileText } from 'lucide-react';
import clsx from 'clsx';

interface FormBuilderLayoutProps {
  children?: React.ReactNode;
}

export const FormBuilderLayout: React.FC<FormBuilderLayoutProps> = ({ children }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  return (
    <FormBuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="Layout" className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
              </div>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTemplateManager(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={clsx(
                  'flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors',
                  showPreview
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icon name="Save" className="h-4 w-4" />
                <span>Auto-saved</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Field Palette */}
          <FieldPalette />

          {/* Center - Form Canvas */}
          <FormCanvas />

          {/* Right Sidebar - Properties Panel */}
          <FieldPropertyPanel />

          {/* Far Right - Preview Panel */}
          {showPreview && <FormPreview />}
        </div>

        {/* Template Manager Modal */}
        <TemplateManager
          isOpen={showTemplateManager}
          onClose={() => setShowTemplateManager(false)}
        />

        {children}
      </div>
    </FormBuilderProvider>
  );
};
