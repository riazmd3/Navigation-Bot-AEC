import React, { useEffect, useState } from 'react';
import { Avatar } from './Avatar';
import { Language } from '../types';

interface WelcomeScreenProps {
  language: Language;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ language, onComplete }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const welcomeMessages = {
    tamil: [
      'வணக்கம்! அருணை பொறியியல் கல்லூரிக்கு உங்களை வரவேற்கிறோம்',
      'இது ஒரு சுயாட்சி நிறுவனம்',
      'உங்கள் வருகைக்கு நான் உதவ இங்கே இருக்கிறேன்'
    ],
    english: [
      'Hello! Welcome to Arunai Engineering College',
      'An Autonomous Institution',
      'I am here to help guide you through your visit'
    ]
  };

  const messages = welcomeMessages[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage(prev => {
        if (prev < messages.length - 1) {
          return prev + 1;
        } else {
          setTimeout(onComplete, 1500);
          return prev;
        }
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [language, messages, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="text-center">
        <Avatar 
          language={language} 
          message={messages[currentMessage]} 
          isWelcome={true}
        />
        
        {/* College Logo/Name */}
        <div className="mt-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {language === 'tamil' ? 'அருணை பொறியியல் கல்லூரி' : 'Arunai Engineering College'}
          </h1>
          <p className="text-lg opacity-90">
            {language === 'tamil' ? 'சுயாட்சி நிறுவனம்' : 'Autonomous Institution'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= currentMessage ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};