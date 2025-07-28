import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Avatar } from './Avatar';
import { locations } from '../data/locations';
import { Language, Location } from '../types';

interface LocationSelectionProps {
  language: Language;
  selectedRole: string;
  onLocationSelect: (location: Location) => void;
}

export const LocationSelection: React.FC<LocationSelectionProps> = ({ 
  language, 
  selectedRole, 
  onLocationSelect 
}) => {
  const message = language === 'tamil' 
    ? 'நீங்கள் எங்கு செல்ல விரும்புகிறீர்கள்?'
    : 'Where would you like to visit?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <Avatar language={language} message={message} />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => onLocationSelect(location)}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-white text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                    {location.name[language]}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {location.description[language]}
                  </p>
                  
                  <div className="flex items-center text-emerald-600 text-sm font-medium">
                    <Navigation className="w-4 h-4 mr-1" />
                    {language === 'tamil' ? 'வழிகாட்டு' : 'Navigate'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};