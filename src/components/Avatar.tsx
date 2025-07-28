import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface AvatarProps {
  language: Language;
  message: string;
  isWelcome?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ language, message, isWelcome = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isWelcome) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isWelcome]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Container */}
      <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-1 shadow-xl">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {/* AI Avatar - Using CSS art for a friendly face */}
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              {/* Face */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-100 to-amber-200 relative">
                {/* Eyes */}
                <div className="absolute top-1/3 left-1/4 w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full"></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full"></div>
                {/* Smile */}
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-4 h-2 md:w-6 md:h-3 border-b-2 border-gray-800 rounded-full"></div>
                {/* Hair */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-10 md:w-24 md:h-12 bg-gradient-to-b from-gray-800 to-gray-700 rounded-t-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Speaking animation indicator */}
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="relative max-w-xs md:max-w-md mx-4">
        <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-100">
          <p className="text-sm md:text-base text-gray-800 text-center font-medium leading-relaxed">
            {message}
          </p>
        </div>
        {/* Speech bubble arrow */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
      </div>
    </div>
  );
};