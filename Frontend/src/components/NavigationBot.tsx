import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MapPin, Navigation, Clock, Globe, Camera, X, Maximize2, ArrowLeft, Settings, Map } from 'lucide-react';
import { Avatar3D } from './Avatar3D';
import { ChatBubble } from './ChatBubble';
import { DestinationGrid } from './DestinationGrid';
import { NavigationMap } from './NavigationMap';
import { ARCamera } from './ARCamera';
import { SplashScreen } from './SplashScreen';
import { SpeechManager } from '../utils/speech';
import { getTranslation } from '../utils/translations';
import { buildings } from '../data/campus';
import { ChatMessage, NavigationState } from '../types';

export const NavigationBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [navState, setNavState] = useState<NavigationState>({
    currentStep: 'welcome',
    selectedDestination: null,
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    language: 'tamil', // Default to Tamil as requested
    isARMode: false,
    cameraPermission: false
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple operations
  const [navigationMode, setNavigationMode] = useState<'none' | 'map' | 'ar' | 'split'>('none');
  const [lastSpokenInstruction, setLastSpokenInstruction] = useState<string>('');
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
  const [showMapControls, setShowMapControls] = useState(false);
  
  const speechManagerRef = useRef<SpeechManager | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSplash) return;
    
    speechManagerRef.current = new SpeechManager();
    speechManagerRef.current.setLanguage(navState.language);
    speechManagerRef.current.setDistanceThreshold(10); // Set 10 meter threshold
    
    // Use default campus center location (will be updated by map's location detection)
    setUserLocation({ lat: 12.192850, lng: 79.083730 });

    // Initial welcome message
    const welcomeMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'bot',
      content: getTranslation('welcome', navState.language),
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Speak welcome message
    setTimeout(() => {
      speakMessage(welcomeMessage.content);
    }, 2000);

  }, [showSplash, navState.language]);

  useEffect(() => {
    // Auto-scroll to latest message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleLanguage = () => {
    const newLanguage = navState.language === 'tamil' ? 'english' : 'tamil';
    setNavState(prev => ({ ...prev, language: newLanguage }));
    speechManagerRef.current?.setLanguage(newLanguage);
    
    const message = addMessage('bot', getTranslation('welcome', newLanguage));
    speakMessage(message.content);
  };

  const toggleARMode = () => {
    setNavState(prev => ({ ...prev, isARMode: !prev.isARMode }));
  };

  const addMessage = (type: 'bot' | 'user', content: string) => {
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  const speakMessage = async (text: string, priority: number = 0) => {
    if (!speechManagerRef.current?.isSpeechSupported || navState.isMuted) return;
    
    setNavState(prev => ({ ...prev, isSpeaking: true }));
    
    try {
      await speechManagerRef.current.speak(
        text,
        () => setNavState(prev => ({ ...prev, isSpeaking: true })),
        () => setNavState(prev => ({ ...prev, isSpeaking: false })),
        priority
      );
    } catch (error) {
      setNavState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const toggleMute = () => {
    setNavState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    if (!navState.isMuted) {
      speechManagerRef.current?.stopSpeaking();
      speechManagerRef.current?.clearQueue();
    }
  };

  const startListening = async () => {
    if (isProcessing || navState.isListening || speechManagerRef.current?.isBusy) {
      console.log('Cannot start listening: operation in progress');
      return; // Prevent multiple operations
    }
    
    if (!speechManagerRef.current?.isRecognitionSupported) {
      const message = addMessage('bot', getTranslation('speechNotSupported', navState.language));
      speakMessage(message.content);
      return;
    }

    // Stop any current speech before listening
    speechManagerRef.current?.stopSpeaking();
    setNavState(prev => ({ ...prev, isSpeaking: false }));

    setNavState(prev => ({ ...prev, isListening: true }));
    
    try {
      await speechManagerRef.current.listen(
        (transcript) => {
          addMessage('user', transcript);
          processVoiceInput(transcript);
          setNavState(prev => ({ ...prev, isListening: false }));
        },
        (error) => {
          console.error('Speech recognition error:', error);
          const errorMessage = addMessage('bot', getTranslation('cameraError', navState.language));
          speakMessage(errorMessage.content);
          setNavState(prev => ({ ...prev, isListening: false }));
        }
      );
    } catch (error) {
      setNavState(prev => ({ ...prev, isListening: false }));
    }
  };

  const processVoiceInput = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Try to match building names
    const matchedBuilding = Object.entries(buildings).find(([key, building]) => 
      lowerTranscript.includes(building.name.toLowerCase()) ||
      lowerTranscript.includes((building.englishName || '').toLowerCase()) ||
      lowerTranscript.includes(key.toLowerCase())
    );

    if (matchedBuilding) {
      handleDestinationSelect(matchedBuilding[0]);
    } else {
      const response = addMessage('bot', getTranslation('didNotCatch', navState.language));
      speakMessage(response.content);
    }
  };

  const handleDestinationSelect = (destinationKey: string) => {
    // Prevent multiple simultaneous operations and clear any existing timeouts
    if (isProcessing || speechManagerRef.current?.isBusy || navState.isListening) {
      console.log('Operation already in progress, ignoring click');
      return;
    }
    
    setIsProcessing(true);
    
    // Stop any current speech
    speechManagerRef.current?.stopSpeaking();
    speechManagerRef.current?.stopListening();
    
    const building = buildings[destinationKey];
    if (!building) return;

    setNavState(prev => ({ 
      ...prev, 
      selectedDestination: destinationKey,
      currentStep: 'navigating',
      isSpeaking: false,
      isListening: false
    }));

    const response = addMessage('bot', getTranslation('calculating', navState.language, {
      destination: navState.language === 'tamil' ? building.name : (building.englishName || building.name),
      description: building.description || ''
    })
    );
    
    setShowMap(true);
    setNavigationMode('map'); // Start with map mode
    setIsMapFullscreen(true); // Make map fullscreen on mobile
    
    // Speak message after a short delay to ensure state is updated
    setTimeout(() => {
      speakMessage(response.content);
    }, 500);
    
    // Reset processing flag after speech
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  const toggleNavigationMode = () => {
    if (navigationMode === 'map') {
      setNavigationMode('ar');
    } else if (navigationMode === 'ar') {
      setNavigationMode('split');
    } else {
      setNavigationMode('map');
    }
  };

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteInfo({ distance, duration });
    
    const distanceText = distance > 1000 
      ? `${(distance / 1000).toFixed(1)} kilometers`
      : `${Math.round(distance)} meters`;
    
    const durationText = duration > 60 
      ? `${Math.round(duration / 60)} minutes`
      : `${Math.round(duration)} seconds`;

    const response = addMessage('bot', getTranslation('routeCalculated', navState.language, {
      distance: distanceText,
      duration: durationText
    })
    );
    
    speakMessage(response.content);
  };

  const handleNavigationInstruction = (instruction: string, distance?: number) => {
    const now = Date.now();
    
    // Check for location/range errors or routing service issues
    if (instruction.includes('too far') || instruction.includes('check your location') || instruction.includes('routing service issue')) {
      const errorMessage = navState.language === 'tamil' 
        ? instruction.includes('routing service issue') 
          ? 'வழிசெலுத்தல் சேவையில் சிக்கல் உள்ளது. நேரடி பாதையைப் பயன்படுத்துகிறேன்.'
          : 'உங்கள் இருப்பிடம் கல்லூரியிலிருந்து மிகவும் தொலைவில் உள்ளது. தயவுசெய்து உங்கள் இருப்பிடத்தை சரிபார்க்கவும் அல்லது அருகிலுள்ள இலக்கை தேர்ந்தெடுக்கவும்.'
        : instruction.includes('routing service issue')
          ? 'Routing service issue. Using direct route.'
          : 'Your location is too far from campus. Please check your location or select a nearby destination.';
      
      const response = addMessage('bot', errorMessage);
      speakMessage(response.content, 2); // High priority for error messages
      
      // Reset to home after speaking the error message (only for location errors, not routing issues)
      if (!instruction.includes('routing service issue')) {
        setTimeout(() => {
          resetToHome();
        }, 3000); // Wait 3 seconds after speaking
      }
    } else {
      // Check distance threshold for navigation instructions
      if (distance !== undefined && !speechManagerRef.current?.shouldSpeakNavigationInstruction(distance)) {
        // Distance is too far, don't speak but still add to chat
        console.log(`Distance ${distance}m exceeds threshold, not speaking instruction: ${instruction}`);
        addMessage('bot', instruction);
        return;
      }
      
      // Prevent repeated speech - only speak if different instruction and enough time has passed
      // But allow initial navigation messages to speak immediately
      const isInitialNavigation = instruction.includes('Navigation started') || instruction.includes('Total distance');
      const timeSinceLastSpeech = now - lastSpeechTime;
      const shouldSpeak = isInitialNavigation || (instruction !== lastSpokenInstruction && timeSinceLastSpeech > 2000);
      
      if (shouldSpeak) {
        setLastSpokenInstruction(instruction);
        setLastSpeechTime(now);
        const response = addMessage('bot', instruction);
        console.log('Speaking instruction with priority:', isInitialNavigation ? 2 : 1, 'text:', instruction);
        speakMessage(response.content, isInitialNavigation ? 2 : 1); // Higher priority for initial messages
      } else {
        // Still add to chat but don't speak
        console.log('Not speaking instruction (cooldown or duplicate):', instruction);
        addMessage('bot', instruction);
      }
    }
  };

  const resetToHome = () => {
    // Stop all current operations
    speechManagerRef.current?.stopSpeaking();
    speechManagerRef.current?.stopListening();
    
    // Clear all states
    setIsProcessing(false);
    setNavState({
      currentStep: 'welcome',
      selectedDestination: null,
      isListening: false,
      isSpeaking: false,
      isMuted: navState.isMuted, // Preserve mute state
      language: navState.language,
      isARMode: false,
      cameraPermission: false
    });
    setShowMap(false);
    setNavigationMode('none');
    setIsMapFullscreen(false);
    setRouteInfo(null);
    setCurrentInstruction('');
    
    // Clear messages and add fresh welcome
    setMessages([]);
    
    // Add welcome message after a short delay
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: getTranslation('welcome', navState.language),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      speakMessage(welcomeMessage.content);
    }, 500);
  };

  const resetNavigation = () => {
    setNavState(prev => ({
      currentStep: 'welcome',
      selectedDestination: null,
      isListening: false,
      isSpeaking: false,
      isMuted: navState.isMuted, // Preserve mute state
      language: navState.language,
      isARMode: false,
      cameraPermission: false
    }));
    setShowMap(false);
    setNavigationMode('none');
    setIsMapFullscreen(false);
    setRouteInfo(null);
    setCurrentInstruction('');
    
    // Add message and speak after a delay
    setTimeout(() => {
      const response = addMessage('bot', getTranslation('helpMore', navState.language));
      speakMessage(response.content);
    }, 500);
  };

  const handleBackToChat = () => {
    setIsMapFullscreen(false);
    setNavigationMode('none');
    setShowMapControls(false);
  };

  const toggleMapControls = () => {
    setShowMapControls(!showMapControls);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Language Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={toggleLanguage}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
            navState.language === 'tamil' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{navState.language === 'tamil' ? 'EN' : 'தமிழ்'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b relative z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campus Navigator</h1>
                <p className="text-sm text-gray-600">Your AI-powered campus guide</p>
              </div>
            </div>
            
            {routeInfo && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Navigation className="w-4 h-4" />
                  <span>{routeInfo.distance > 1000 
                    ? `${(routeInfo.distance / 1000).toFixed(1)}km` 
                    : `${Math.round(routeInfo.distance)}m`}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{routeInfo.duration > 60 
                    ? `${Math.round(routeInfo.duration / 60)}min` 
                    : `${Math.round(routeInfo.duration)}s`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isMapFullscreen && showMap && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Top Navigation Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4">
              {/* Back Button */}
              <button
                onClick={handleBackToChat}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{navState.language === 'tamil' ? 'திரும்பு' : 'Back'}</span>
              </button>

              {/* Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleNavigationMode}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    navigationMode === 'ar' 
                      ? 'bg-green-500 text-white' 
                      : navigationMode === 'split'
                      ? 'bg-purple-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {navigationMode === 'map' ? 'AR Mode' : 
                   navigationMode === 'ar' ? 'Split View' : 'Map Mode'}
                </button>
                
                {/* Map Controls Toggle */}
                <button
                  onClick={toggleMapControls}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsMapFullscreen(false)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Map Controls Popup */}
          {showMapControls && (
            <div className="absolute top-20 right-4 z-30 bg-white rounded-lg shadow-xl p-4 min-w-48">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {navState.language === 'tamil' ? 'வரைபட கட்டுப்பாடுகள்' : 'Map Controls'}
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setNavigationMode('map')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      navigationMode === 'map' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Map className="w-4 h-4" />
                      <span>{navState.language === 'tamil' ? 'வரைபட முறை' : 'Map Mode'}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setNavigationMode('ar')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      navigationMode === 'ar' 
                        ? 'bg-green-100 text-green-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>{navState.language === 'tamil' ? 'AR முறை' : 'AR Mode'}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setNavigationMode('split')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      navigationMode === 'split' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4" />
                      <span>{navState.language === 'tamil' ? 'பிரிப்பு காட்சி' : 'Split View'}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Content */}
          <div className="flex-1 relative pt-16">
            {navigationMode === 'map' && (
              <NavigationMap
                selectedDestination={navState.selectedDestination}
                userLocation={userLocation}
                onLocationUpdate={setUserLocation}
                onRouteCalculated={handleRouteCalculated}
                onNavigationInstruction={handleNavigationInstruction}
              />
            )}
            
            {navigationMode === 'ar' && (
              <ARCamera
                isActive={true}
                onToggle={() => {}}
                currentInstruction={currentInstruction}
                language={navState.language}
              />
            )}
            
            {navigationMode === 'split' && (
              <div className="h-full flex flex-col lg:flex-row">
                {/* AR Camera Section */}
                <div className="flex-1 relative">
                  <ARCamera
                    isActive={true}
                    onToggle={() => {}}
                    currentInstruction={currentInstruction}
                    language={navState.language}
                  />
                </div>
                
                {/* Map Section */}
                <div className="flex-1 border-t lg:border-t-0 lg:border-l border-gray-300">
                  <NavigationMap
                    selectedDestination={navState.selectedDestination}
                    userLocation={userLocation}
                    onLocationUpdate={setUserLocation}
                    onRouteCalculated={handleRouteCalculated}
                    onNavigationInstruction={handleNavigationInstruction}
                  />
                </div>
              </div>
            )}
            
            {/* Character Overlay */}
            <div className="absolute top-20 left-4 z-10">
              <Avatar3D 
                isSpeaking={navState.isSpeaking}
                isListening={navState.isListening}
                isNavigating={true}
                language={navState.language}
                className="scale-75"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-20">
        <div className="grid gap-6 lg:grid-cols-1">
          {/* Chat Interface */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <Avatar3D 
                isSpeaking={navState.isSpeaking}
                isListening={navState.isListening}
                isNavigating={navState.currentStep === 'navigating'}
                language={navState.language}
                className="mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-white">
                {navState.language === 'tamil' ? 'கல்லூரி வழிகாட்டி' : 'Campus Guide Assistant'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {navState.isListening ? getTranslation('listening', navState.language) : 
                 navState.isSpeaking ? getTranslation('speaking', navState.language) : 
                 speechManagerRef.current?.queueLength > 0 ? 
                   `${speechManagerRef.current.queueLength} message${speechManagerRef.current.queueLength > 1 ? 's' : ''} in queue` :
                 getTranslation('ready', navState.language)}
              </p>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="h-48 md:h-64 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {messages.map((message, idx) => (
                <ChatBubble key={message.id || `msg-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`} message={message} />
              ))}
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center justify-center space-x-3 mb-4">
                {/* Map Toggle */}
                {navState.selectedDestination && (
                  <button
                    onClick={() => setIsMapFullscreen(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>{navState.language === 'tamil' ? 'வழிசெலுத்தல்' : 'Navigate'}</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={startListening}
                  disabled={navState.isListening || navState.isSpeaking || isProcessing}
                  className={`
                    p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg font-medium
                    ${navState.isListening 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {navState.isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                
                {/* Debug button for testing routing */}
                <button
                  onClick={() => {
                    console.log('Testing routing with destination: gate');
                    handleDestinationSelect('gate');
                  }}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-xs font-medium transition-all duration-300"
                >
                  Test Route
                </button>
                
                <button
                  onClick={toggleMute}
                  className={`p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                    navState.isMuted 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                  }`}
                >
                  {navState.isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>

                {navState.selectedDestination && (
                  <button
                    onClick={resetNavigation}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {getTranslation('newDestination', navState.language)}
                  </button>
                )}
              </div>
            </div>

            {/* Destination Selection */}
            {!navState.selectedDestination && (
              <div className="p-4 border-t bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {getTranslation('selectDestination', navState.language)}
                </h3>
                <div className="max-h-48 md:max-h-64 overflow-y-auto">
                  <DestinationGrid
                    onSelectDestination={handleDestinationSelect}
                    selectedDestination={navState.selectedDestination}
                    language={navState.language}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mini Map Preview - Only show when not in fullscreen */}
          {showMap && !isMapFullscreen && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-4">
              <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {navState.language === 'tamil' ? 'வரைபடம்' : 'Map Preview'}
                </h3>
                <button
                  onClick={() => setIsMapFullscreen(true)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-32">
                <NavigationMap
                  selectedDestination={navState.selectedDestination}
                  userLocation={userLocation}
                  onLocationUpdate={setUserLocation}
                  onRouteCalculated={handleRouteCalculated}
                  onNavigationInstruction={handleNavigationInstruction}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};