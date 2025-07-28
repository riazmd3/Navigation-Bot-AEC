export interface Location {
  id: string;
  name: {
    tamil: string;
    english: string;
  };
  description: {
    tamil: string;
    english: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Role {
  id: string;
  name: {
    tamil: string;
    english: string;
  };
  icon: string;
}

export type Language = 'tamil' | 'english';

export interface AppState {
  currentScreen: 'welcome' | 'roleSelection' | 'locationSelection' | 'navigation';
  selectedRole: string | null;
  selectedLocation: Location | null;
  language: Language;
}