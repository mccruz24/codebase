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

  startDate: string; // YYYY-MM-DD (date-only)
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
  dose: number;
  notes?: string;
  site?: string;
  photo?: string;
  photoPath?: string;
  needleDepth?: number;
  glideSerum?: string;
}

export interface AestheticCheckIn {
  id: string;
  date: string; // YYYY-MM-DD (date-only)
  weight?: number;
  metrics: {
    muscleFullness: number; // 1-10
    skinClarity: number;
    skinTexture: number; // 1-10
    facialFullness: number;
    inflammation: number;
    jawlineDefinition: number;
    energy: number;
    sleepQuality: number;
    libido: number;
  };
  notes?: string;
}

