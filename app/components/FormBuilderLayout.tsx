import React, { useState } from 'react';
import { FormBuilderProvider } from '~/context/FormBuilderContext';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldPropertyPanel } from './FieldPropertyPanel';
import { FormPreview } from './FormPreview';
import { TemplateManager } from './TemplateManager';
import { ThemeToggle } from './ThemeToggle';
import { UndoRedoControls } from './UndoRedoControls';
import { Icon } from './Icon';
import { Save, Eye, EyeOff, Layout, Settings, FileText } from 'lucide-react';
import clsx from 'clsx';

interface FormBuilderLayoutProps {
  children?: React.ReactNode;
}

export const FormBuilderLayout: React.FC<FormBuilderLayoutProps> = ({ children }) => {
  const [showPreview, setShowPreview] = useState(false); // Start with preview hidden on mobile
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'canvas' | 'palette' | 'properties' | 'preview'>('canvas');

  return (
    <FormBuilderProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Icon name="Layout" className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  <span className="hidden sm:inline">Form Builder</span>
                  <span className="sm:hidden">Builder</span>
                </h1>
              </div>
              
              <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <nav className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => setShowTemplateManager(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </button>
                
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                
                <UndoRedoControls />
              </nav>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Mobile Template Button */}
              <button
                onClick={() => setShowTemplateManager(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Templates"
              >
                <FileText className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className={clsx(
                  'flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm rounded-md transition-colors',
                  showPreview
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
              
              <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600" />
              
              <ThemeToggle />
              
              <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600" />
              
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Icon name="Save" className="h-4 w-4" />
                <span>Auto-saved</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setMobileActivePanel('palette')}
              className={clsx(
                'flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors text-xs',
                mobileActivePanel === 'palette'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon name="Plus" className="h-5 w-5" />
              <span>Fields</span>
            </button>
            
            <button
              onClick={() => setMobileActivePanel('canvas')}
              className={clsx(
                'flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors text-xs',
                mobileActivePanel === 'canvas'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon name="Layout" className="h-5 w-5" />
              <span>Form</span>
            </button>
            
            <button
              onClick={() => setMobileActivePanel('properties')}
              className={clsx(
                'flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors text-xs',
                mobileActivePanel === 'properties'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon name="Settings" className="h-5 w-5" />
              <span>Properties</span>
            </button>
            
            {showPreview && (
              <button
                onClick={() => setMobileActivePanel('preview')}
                className={clsx(
                  'flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors text-xs',
                  mobileActivePanel === 'preview'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                )}
              >
                <Icon name="Eye" className="h-5 w-5" />
                <span>Preview</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-1">
            {/* Left Sidebar - Field Palette */}
            <FieldPalette />

            {/* Center - Form Canvas */}
            <FormCanvas />

            {/* Right Sidebar - Properties Panel */}
            <FieldPropertyPanel />

            {/* Far Right - Preview Panel */}
            {showPreview && <FormPreview />}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex-1 flex flex-col">
            {mobileActivePanel === 'palette' && <FieldPalette />}
            {mobileActivePanel === 'canvas' && <FormCanvas />}
            {mobileActivePanel === 'properties' && <FieldPropertyPanel />}
            {mobileActivePanel === 'preview' && showPreview && <FormPreview />}
          </div>
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
