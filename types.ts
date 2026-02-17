
export interface Compound {
  id: string;
  name: string;
  category: 'peptide' | 'relaxant' | 'booster' | 'microneedling'; 
  subCategory?: string; 
  targetArea?: string[]; 
  
  doseUnit: string; // mg, IU, ml, mm
  doseAmount?: number; // Default amount
  
  // Frequency
  frequencyType?: 'interval' | 'specific_days';
  frequencyDays?: number; 
  frequencySpecificDays?: string[]; 

  startDate: string; // ISO date string
  isArchived: boolean;
  color: string;

  // Vial Info
  peptideAmount?: number; 
  dilutionAmount?: number; 
  concentration?: number; 
}

export interface InjectionLog {
  id: string;
  compoundId: string;
  timestamp: string; // ISO datetime
  dose: number; // For MN, this can be 0 or repurposed, but we use specific fields below
  notes?: string;
  site?: string;
  
  // New Fields
  photo?: string; // Base64 string of the image
  needleDepth?: number; // Specific for MN
  glideSerum?: string; // Specific for MN
}

export interface AestheticCheckIn {
  id: string;
  date: string; // ISO date
  weight?: number;
  metrics: {
    muscleFullness: number; // 1-10
    skinClarity: number;
    skinTexture: number; // 1-10 (New)
    facialFullness: number;
    inflammation: number;
    jawlineDefinition: number;
    energy: number;
    sleepQuality: number;
    libido: number;
  };
  notes?: string;
}

export interface ResearchEntry {
  id: string;
  name: string;
  classification: string; 
  overview: string;
  researchContext: string[]; 
  mechanism: string;
  limitations: string;
  regulatoryStatus: string;
  references: string[]; 
  category: 'Reparative' | 'Metabolic' | 'Cosmetic' | 'Cognitive' | 'Other';
}

export interface AppSettings {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    reminders: boolean;
  };
}

export const METRIC_LABELS: Record<string, string> = {
  muscleFullness: "Muscle Fullness",
  skinClarity: "Skin Clarity",
  skinTexture: "Skin Texture",
  facialFullness: "Facial Fullness",
  inflammation: "Inflammation (Low to High)",
  jawlineDefinition: "Jawline Definition",
  energy: "Energy",
  sleepQuality: "Sleep Quality",
  libido: "Libido"
};

export const COLORS = [
  'bg-red-500', 
  'bg-rose-500', 
  'bg-pink-500', 
  'bg-fuchsia-500', 
  'bg-purple-500', 
  'bg-indigo-500', 
  'bg-blue-500', 
  'bg-sky-500', 
  'bg-teal-500', 
  'bg-emerald-500'
];

export const TEXT_COLORS: Record<string, string> = {
  'bg-red-500': 'text-red-500',
  'bg-rose-500': 'text-rose-500',
  'bg-pink-500': 'text-pink-500',
  'bg-fuchsia-500': 'text-fuchsia-500',
  'bg-purple-500': 'text-purple-500',
  'bg-indigo-500': 'text-indigo-500',
  'bg-blue-500': 'text-blue-500',
  'bg-sky-500': 'text-sky-500',
  'bg-teal-500': 'text-teal-500',
  'bg-emerald-500': 'text-emerald-500',
};