import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '~/context/ThemeContext';
import clsx from 'clsx';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'relative flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-all duration-300',
        'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
        'border border-gray-300 dark:border-gray-600'
      )}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-4 h-4">
        <Sun 
          className={clsx(
            'absolute h-4 w-4 transition-all duration-300',
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
          )} 
        />
        <Moon 
          className={clsx(
            'absolute h-4 w-4 transition-all duration-300',
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
          )} 
        />
      </div>
      <span className="hidden sm:inline">
        {theme === 'light' ? 'Dark' : 'Light'} Mode
      </span>
    </button>
  );
};
