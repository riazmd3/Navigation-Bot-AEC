export interface Building {
  name: string;
  englishName?: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface Buildings {
  [key: string]: Building;
}

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

export interface NavigationState {
  currentStep: 'welcome' | 'selecting' | 'navigating' | 'arrived';
  selectedDestination: string | null;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  language: 'tamil' | 'english';
  isARMode: boolean;
  cameraPermission: boolean;
}