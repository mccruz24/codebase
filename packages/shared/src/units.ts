export type UnitSystem = 'metric' | 'imperial';

export function lbToKg(lb: number) {
  return lb * 0.45359237;
}

export function kgToLb(kg: number) {
  return kg / 0.45359237;
}

export function formatWeight(weightLb: number, units: UnitSystem) {
  const value = units === 'metric' ? lbToKg(weightLb) : weightLb;
  const unit = units === 'metric' ? 'kg' : 'lbs';
  return { value, unit };
}

export function displayWeightValue(weightLb: number, units: UnitSystem) {
  return units === 'metric' ? lbToKg(weightLb) : weightLb;
}

export function parseWeightInput(value: string, units: UnitSystem) {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return units === 'metric' ? kgToLb(n) : n;
}

