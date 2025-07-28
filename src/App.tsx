import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RoleSelection } from './components/RoleSelection';
import { LocationSelection } from './components/LocationSelection';
import { NavigationScreen } from './components/NavigationScreen';
import { LanguageToggle } from './components/LanguageToggle';
import { AppState, Location, Language } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'welcome',
    selectedRole: null,
    selectedLocation: null,
    language: 'tamil'
  });

  // Auto-advance from welcome screen
  const handleWelcomeComplete = () => {
    setAppState(prev => ({ ...prev, currentScreen: 'roleSelection' }));
  };

  const handleRoleSelect = (roleId: string) => {
    setAppState(prev => ({ 
      ...prev, 
      selectedRole: roleId, 
      currentScreen: 'locationSelection' 
    }));
  };

  const handleLocationSelect = (location: Location) => {
    setAppState(prev => ({ 
      ...prev, 
      selectedLocation: location, 
      currentScreen: 'navigation' 
    }));
  };

  const handleBackToLocations = () => {
    setAppState(prev => ({ 
      ...prev, 
      currentScreen: 'locationSelection',
      selectedLocation: null
    }));
  };

  const handleLanguageChange = (language: Language) => {
    setAppState(prev => ({ ...prev, language }));
  };

  // Update document title based on language
  useEffect(() => {
    const title = appState.language === 'tamil' 
      ? 'அருணை பொறியியல் கல்லூரி - வழிகாட்டி'
      : 'Arunai Engineering College - Navigator';
    document.title = title;
  }, [appState.language]);

  return (
    <div className="relative">
      {/* Language Toggle - Show on all screens except welcome */}
      {appState.currentScreen !== 'welcome' && (
        <LanguageToggle 
          language={appState.language} 
          onLanguageChange={handleLanguageChange} 
        />
      )}

      {/* Screen Routing */}
      {appState.currentScreen === 'welcome' && (
        <WelcomeScreen 
          language={appState.language}
          onComplete={handleWelcomeComplete}
        />
      )}

      {appState.currentScreen === 'roleSelection' && (
        <RoleSelection 
          language={appState.language}
          onRoleSelect={handleRoleSelect}
        />
      )}

      {appState.currentScreen === 'locationSelection' && (
        <LocationSelection 
          language={appState.language}
          selectedRole={appState.selectedRole!}
          onLocationSelect={handleLocationSelect}
        />
      )}

      {appState.currentScreen === 'navigation' && appState.selectedLocation && (
        <NavigationScreen 
          language={appState.language}
          location={appState.selectedLocation}
          onBack={handleBackToLocations}
        />
      )}
    </div>
  );
}

export default App;