import React from 'react';
import { GraduationCap, Users, Heart } from 'lucide-react';
import { Avatar } from './Avatar';
import { roles } from '../data/roles';
import { Language } from '../types';

interface RoleSelectionProps {
  language: Language;
  onRoleSelect: (roleId: string) => void;
}

const iconMap = {
  GraduationCap,
  Users,
  Heart
};

export const RoleSelection: React.FC<RoleSelectionProps> = ({ language, onRoleSelect }) => {
  const message = language === 'tamil' 
    ? 'தயவுசெய்து உங்கள் பாத்திரத்தை தேர்ந்தெடுக்கவும்'
    : 'Please select your role to continue';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Avatar language={language} message={message} />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {roles.map((role) => {
            const IconComponent = iconMap[role.icon as keyof typeof iconMap];
            
            return (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-white"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {role.name[language]}
                  </h3>
                  
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto group-hover:w-16 transition-all duration-300"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};