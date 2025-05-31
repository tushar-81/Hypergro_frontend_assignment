import React from 'react';
import { useFormBuilder } from '~/context/FormBuilderContext';

interface UndoRedoControlsProps {
  className?: string;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({ className = '' }) => {
  const { state, dispatch } = useFormBuilder();

  const handleUndo = () => {
    if (state.canUndo) {
      dispatch({ type: 'UNDO' });
    }
  };

  const handleRedo = () => {
    if (state.canRedo) {
      dispatch({ type: 'REDO' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  // Add keyboard listeners to the document
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state.canUndo, state.canRedo]);

  return (
    <div className={`flex items-center space-x-1 ${className}`} onKeyDown={handleKeyDown}>
      {/* Undo Button */}
      <button
        onClick={handleUndo}
        disabled={!state.canUndo}
        title="Undo (Ctrl+Z)"
        className={`
          p-2 rounded-md transition-all duration-200 flex items-center justify-center
          ${state.canUndo 
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100' 
            : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
          }
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>

      {/* Redo Button */}
      <button
        onClick={handleRedo}
        disabled={!state.canRedo}
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        className={`
          p-2 rounded-md transition-all duration-200 flex items-center justify-center
          ${state.canRedo 
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100' 
            : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
          }
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>

      {/* History Info (optional, for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {state.historyIndex + 1}/{state.history.length}
        </div>
      )}
    </div>
  );
};
