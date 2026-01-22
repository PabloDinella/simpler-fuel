// Unit conversion utilities

// Distance conversions
const KM_TO_MI = 0.621371;
const MI_TO_KM = 1.609344;

// Volume conversions
const L_TO_GAL_US = 0.264172;
const GAL_US_TO_L = 3.785411784;
const L_TO_GAL_UK = 0.219969;
const GAL_UK_TO_L = 4.54609;

export type DistanceUnit = 'km' | 'mi';
export type VolumeUnit = 'L' | 'gal_us' | 'gal_uk';
export type ConsumptionFormat = 'km_per_L' | 'L_per_100km' | 'mpg_us' | 'mpg_uk';

// Distance conversion functions
export function convertDistanceToKm(value: number, fromUnit: DistanceUnit): number {
  if (fromUnit === 'km') return value;
  return value * MI_TO_KM;
}

export function convertDistanceFromKm(value: number, toUnit: DistanceUnit): number {
  if (toUnit === 'km') return value;
  return value * KM_TO_MI;
}

// Volume conversion functions
export function convertVolumeToLiters(value: number, fromUnit: VolumeUnit): number {
  switch (fromUnit) {
    case 'L':
      return value;
    case 'gal_us':
      return value * GAL_US_TO_L;
    case 'gal_uk':
      return value * GAL_UK_TO_L;
  }
}

export function convertVolumeFromLiters(value: number, toUnit: VolumeUnit): number {
  switch (toUnit) {
    case 'L':
      return value;
    case 'gal_us':
      return value * L_TO_GAL_US;
    case 'gal_uk':
      return value * L_TO_GAL_UK;
  }
}

// Calculate fuel consumption between two entries
export interface FuelEntry {
  odometer_km: number;
  liters: number;
  date: string;
}

export function calculateConsumption(
  entries: FuelEntry[],
  format: ConsumptionFormat
): Array<{ value: number; date: string }> {
  if (entries.length < 2) return [];

  // Sort by date ascending
  const sorted = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const results: Array<{ value: number; date: string }> = [];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    const distanceKm = current.odometer_km - previous.odometer_km;
    const fuelLiters = current.liters;

    if (distanceKm > 0 && fuelLiters > 0) {
      const value = formatConsumption(distanceKm, fuelLiters, format);
      results.push({
        value,
        date: current.date
      });
    }
  }

  return results;
}

// Format consumption value based on selected format
export function formatConsumption(
  distanceKm: number,
  fuelLiters: number,
  format: ConsumptionFormat
): number {
  switch (format) {
    case 'km_per_L':
      return distanceKm / fuelLiters;
    
    case 'L_per_100km':
      return (fuelLiters / distanceKm) * 100;
    
    case 'mpg_us': {
      const distanceMiles = distanceKm * KM_TO_MI;
      const fuelGallons = fuelLiters * L_TO_GAL_US;
      return distanceMiles / fuelGallons;
    }
    
    case 'mpg_uk': {
      const distanceMiles = distanceKm * KM_TO_MI;
      const fuelGallons = fuelLiters * L_TO_GAL_UK;
      return distanceMiles / fuelGallons;
    }
  }
}

// Get unit labels for display
export function getDistanceUnitLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'km' : 'mi';
}

export function getVolumeUnitLabel(unit: VolumeUnit): string {
  switch (unit) {
    case 'L': return 'L';
    case 'gal_us': return 'gal (US)';
    case 'gal_uk': return 'gal (UK)';
  }
}

export function getConsumptionFormatLabel(format: ConsumptionFormat): string {
  switch (format) {
    case 'km_per_L': return 'km/L';
    case 'L_per_100km': return 'L/100km';
    case 'mpg_us': return 'mpg (US)';
    case 'mpg_uk': return 'mpg (UK)';
  }
}

// Format number for display
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
