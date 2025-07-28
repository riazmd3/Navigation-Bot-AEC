import React from 'react';
import { MapPin, Navigation, ArrowLeft, ExternalLink } from 'lucide-react';
import { Avatar } from './Avatar';
import { Language, Location } from '../types';

interface NavigationScreenProps {
  language: Language;
  location: Location;
  onBack: () => void;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({ 
  language, 
  location, 
  onBack 
}) => {
  const message = language === 'tamil' 
    ? `${location.name.tamil} க்கு செல்ல உதவுகிறேன்`
    : `I'll help you navigate to ${location.name.english}`;

  const handleOpenMaps = () => {
    if (location.coordinates) {
      const { lat, lng } = location.coordinates;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{language === 'tamil' ? 'திரும்பு' : 'Back'}</span>
          </button>
        </div>

        <Avatar language={language} message={message} />
        
        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {location.name[language]}
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              {location.description[language]}
            </p>
          </div>

          {/* Map placeholder */}
          <div className="bg-gray-200 rounded-xl h-64 mb-6 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">
                {language === 'tamil' ? 'வரைபட காட்சி' : 'Map View'}
              </p>
              <p className="text-xs">
                {language === 'tamil' ? 'Google Maps API தேவை' : 'Requires Google Maps API'}
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="space-y-4">
            <button
              onClick={handleOpenMaps}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Navigation className="w-5 h-5" />
              <span>
                {language === 'tamil' ? 'Google Maps இல் திறக்கவும்' : 'Open in Google Maps'}
              </span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button className="bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors">
                {language === 'tamil' ? 'வழிகாட்டுதல்' : 'Get Directions'}
              </button>
              
              <button className="bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                {language === 'tamil' ? 'தொடர்பு' : 'Contact Info'}
              </button>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 text-center">
              {language === 'tamil' 
                ? 'உதவிக்கு +91-XXXX-XXXX-XX என்ற எண்ணில் தொடர்பு கொள்ளவும்'
                : 'For assistance, call +91-XXXX-XXXX-XX'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};