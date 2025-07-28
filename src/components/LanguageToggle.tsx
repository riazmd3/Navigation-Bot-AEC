import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageToggleProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  language, 
  onLanguageChange 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
        <button
          onClick={() => onLanguageChange('tamil')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            language === 'tamil'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          தமிழ்
        </button>
        
        <Globe className="w-4 h-4 text-gray-400 mx-1" />
        
        <button
          onClick={() => onLanguageChange('english')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            language === 'english'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};