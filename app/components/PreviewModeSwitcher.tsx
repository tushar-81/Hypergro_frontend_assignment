import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface PreviewModeSwitcherProps {
  children: React.ReactNode;
  className?: string;
  onBack?: () => void;
  title?: string;
}

export const PreviewModeSwitcher: React.FC<PreviewModeSwitcherProps> = ({ 
  children, 
  className,
  onBack,
  title = 'Preview'
}) => {
  const [selectedMode, setSelectedMode] = useState<PreviewMode>('desktop');

  const modes = [
    {
      id: 'desktop' as const,
      label: 'Desktop',
      icon: Monitor,
      width: '100%',
      maxWidth: '1024px',
    },
    {
      id: 'tablet' as const,
      label: 'Tablet',
      icon: Tablet,
      width: '768px',
      maxWidth: '768px',
    },
    {
      id: 'mobile' as const,
      label: 'Mobile',
      icon: Smartphone,
      width: '375px',
      maxWidth: '375px',
    },
  ];

  const currentMode = modes.find(mode => mode.id === selectedMode);
  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Header with Back Button and Mode Switcher */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Back Button and Title */}
        {onBack && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Go back to templates"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Templates</span>
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <div className="w-[140px]" /> {/* Spacer for centering */}
          </div>
        )}
        
        {/* Mode Switcher Buttons */}
        <div className="flex items-center justify-center space-x-1 p-4">
          <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    selectedMode === mode.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                  title={`${mode.label} Preview (${mode.width})`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Current mode indicator */}
          <div className="ml-4 text-sm text-gray-500 dark:text-gray-400 hidden md:block">
            {currentMode?.width === '100%' 
              ? `${currentMode.label} (max ${currentMode.maxWidth})`
              : `${currentMode?.label} (${currentMode?.width})`
            }
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex justify-center bg-gray-100 dark:bg-gray-900 p-4 overflow-auto">
        <div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            width: currentMode?.width,
            maxWidth: currentMode?.maxWidth,
            minHeight: '500px',
          }}
        >
          {children}
        </div>
      </div>

      {/* Mobile breakpoint indicator */}
      <div className="flex justify-center py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span className={clsx(
            'px-2 py-1 rounded',
            selectedMode === 'mobile' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
          )}>
            Mobile: ≤ 640px
          </span>
          <span className={clsx(
            'px-2 py-1 rounded',
            selectedMode === 'tablet' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
          )}>
            Tablet: 641px - 1023px
          </span>
          <span className={clsx(
            'px-2 py-1 rounded',
            selectedMode === 'desktop' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
          )}>
            Desktop: ≥ 1024px
          </span>
        </div>
      </div>
    </div>
  );
};
