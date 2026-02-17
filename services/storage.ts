import { Compound, InjectionLog, AestheticCheckIn, COLORS, AppSettings } from '../types';

const STORAGE_KEYS = {
  COMPOUNDS: 'al_compounds',
  INJECTIONS: 'al_injections',
  CHECKINS: 'al_checkins',
  SETTINGS: 'al_settings',
  INIT: 'al_initialized_v5' // Bumped version for micro needling
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Mock Data Seeder
export const seedMockData = () => {
  if (localStorage.getItem(STORAGE_KEYS.INIT)) return;

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // 1. Create Compounds
  const testCId = generateId();
  const bpcId = generateId() + '3';
  const dysportId = generateId() + '4';
  const rejuranId = generateId() + '5';
  const mnId = generateId() + '6';
  
  const compounds: Compound[] = [
    {
      id: testCId,
      name: "Testosterone Cypionate",
      category: 'peptide',
      doseUnit: "mg",
      doseAmount: 50,
      frequencyType: "specific_days",
      frequencySpecificDays: ["Mon", "Thu"],
      startDate: new Date(now.getTime() - 60 * oneDay).toISOString(),
      isArchived: false,
      color: 'bg-indigo-500',
      peptideAmount: 200, 
      dilutionAmount: 1,
      concentration: 200
    },
    {
      id: bpcId,
      name: "BPC-157",
      category: 'peptide',
      doseUnit: "mcg",
      doseAmount: 500,
      frequencyType: "interval",
      frequencyDays: 1, // Every Day
      startDate: new Date(now.getTime() - 10 * oneDay).toISOString(),
      isArchived: false,
      color: 'bg-teal-500',
      peptideAmount: 5, 
      dilutionAmount: 2, 
      concentration: 2.5 
    },
    {
      id: dysportId,
      name: "Dysport",
      category: 'relaxant',
      targetArea: ["Masseter"],
      doseUnit: "IU",
      doseAmount: 60,
      frequencyType: "interval",
      frequencyDays: 120, // Every 4 months
      startDate: new Date(now.getTime() - 100 * oneDay).toISOString(),
      isArchived: false,
      color: 'bg-purple-500',
      peptideAmount: 300, 
      dilutionAmount: 1.5, 
      concentration: 200
    },
    {
      id: rejuranId,
      name: "Rejuran Healer",
      category: 'booster',
      subCategory: 'Polynucleotide',
      targetArea: ["Full Face"],
      doseUnit: "ml",
      doseAmount: 2,
      frequencyType: "interval",
      frequencyDays: 30, // Every month
      startDate: new Date(now.getTime() - 45 * oneDay).toISOString(),
      isArchived: false,
      color: 'bg-sky-500'
    },
    {
      id: mnId,
      name: "Dr. Pen Protocol",
      category: 'microneedling',
      targetArea: ["Face", "Neck"],
      doseUnit: "mm",
      doseAmount: 1.5,
      frequencyType: "interval",
      frequencyDays: 28, // Every 4 weeks
      startDate: new Date(now.getTime() - 60 * oneDay).toISOString(),
      isArchived: false,
      color: 'bg-rose-500'
    }
  ];

  // 2. Create Injections (Last 30 days)
  const injections: InjectionLog[] = [];
  
  // Backfill Test C
  for (let i = 0; i < 8; i++) {
    const date = new Date(now.getTime() - (i * 3.5 * oneDay));
    injections.push({
      id: generateId() + i,
      compoundId: testCId,
      timestamp: date.toISOString(),
      dose: 50,
      site: i % 2 === 0 ? "Left Ventroglute" : "Right Ventroglute"
    });
  }

  // Backfill BPC-157 (Every day for last 10 days)
  for (let i = 0; i < 10; i++) {
    const date = new Date(now.getTime() - (i * oneDay));
    if (i === 0) continue; 
    
    injections.push({
      id: generateId() + i + '_bpc',
      compoundId: bpcId,
      timestamp: date.toISOString(),
      dose: 500,
      site: "Stomach"
    });
  }
  
  // Backfill Dysport
  injections.push({
      id: generateId() + '_botox',
      compoundId: dysportId,
      timestamp: new Date(now.getTime() - 95 * oneDay).toISOString(),
      dose: 60,
      site: "Masseter"
  });

  // Backfill MN
  injections.push({
      id: generateId() + '_mn1',
      compoundId: mnId,
      timestamp: new Date(now.getTime() - 30 * oneDay).toISOString(),
      dose: 1.5,
      site: "Face, Neck"
  });

  // 3. Create Check-ins (4 weeks)
  const checkIns: AestheticCheckIn[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(now.getTime() - (i * 7 * oneDay));
    checkIns.push({
      id: generateId() + i + '_checkin',
      date: date.toISOString(),
      weight: 185 - (i * 0.5), 
      metrics: {
        muscleFullness: 6 + (Math.random() * 2),
        skinClarity: 5 + (Math.random() * 3),
        skinTexture: 5 + (Math.random() * 2),
        facialFullness: 6 - (i * 0.2), 
        inflammation: 4 - (i * 0.3),
        jawlineDefinition: 5 + (i * 0.5),
        energy: 7 + (Math.random() * 2),
        sleepQuality: 6 + (Math.random() * 2),
        libido: 8
      }
    });
  }

  localStorage.setItem(STORAGE_KEYS.COMPOUNDS, JSON.stringify(compounds));
  localStorage.setItem(STORAGE_KEYS.INJECTIONS, JSON.stringify(injections));
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));
  localStorage.setItem(STORAGE_KEYS.INIT, 'true');
};

// Compounds
export const getCompounds = (): Compound[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPOUNDS);
  // Migration support
  return data ? JSON.parse(data).map((c: any) => ({ 
    ...c, 
    category: (['peptide','relaxant','booster','microneedling'].includes(c.category)) ? c.category : 'peptide' 
  })) : [];
};

export const saveCompound = (compound: Omit<Compound, 'id'> & { id?: string }): void => {
  const compounds = getCompounds();
  if (compound.id) {
    const index = compounds.findIndex(c => c.id === compound.id);
    if (index !== -1) compounds[index] = compound as Compound;
  } else {
    compounds.push({ ...compound, id: generateId(), isArchived: false } as Compound);
  }
  localStorage.setItem(STORAGE_KEYS.COMPOUNDS, JSON.stringify(compounds));
};

export const deleteCompound = (id: string): void => {
  const compounds = getCompounds().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.COMPOUNDS, JSON.stringify(compounds));
};

// Injections
export const getInjections = (): InjectionLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INJECTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveInjection = (log: Omit<InjectionLog, 'id'>): void => {
  const logs = getInjections();
  logs.push({ ...log, id: generateId() });
  localStorage.setItem(STORAGE_KEYS.INJECTIONS, JSON.stringify(logs));
};

// Check-ins
export const getCheckIns = (): AestheticCheckIn[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHECKINS);
  return data ? JSON.parse(data).sort((a: AestheticCheckIn, b: AestheticCheckIn) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
};

export const saveCheckIn = (checkIn: Omit<AestheticCheckIn, 'id'>): void => {
  const checkIns = getCheckIns();
  checkIns.push({ ...checkIn, id: generateId() });
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));
};

// Settings
export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    units: 'imperial',
    theme: 'system',
    notifications: { push: true, reminders: true }
  };
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Data Management
export const exportData = () => {
  const data = {
    compounds: getCompounds(),
    injections: getInjections(),
    checkIns: getCheckIns(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.COMPOUNDS);
  localStorage.removeItem(STORAGE_KEYS.INJECTIONS);
  localStorage.removeItem(STORAGE_KEYS.CHECKINS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.INIT); // Allow reseeding if desired
  // Keep disclaimer acceptance
};