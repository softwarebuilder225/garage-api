import type { CarOrigin } from '../models/car.js';

const ORIGIN_BY_CODE: Record<string, CarOrigin> = {
  '1': 'usa',
  '2': 'europe',
  '3': 'japan',
  usa: 'usa',
  europe: 'europe',
  japan: 'japan',
};

export interface RawCarRow {
  mpg: string;
  cylinders: string;
  displacement: string;
  horsepower: string;
  weight: string;
  acceleration: string;
  year: string;
  origin: string;
  name: string;
}

export interface CleanCarInput {
  name: string;
  mpg: number | null;
  cylinders: number;
  displacement: number;
  horsepower: number | null;
  weight: number;
  acceleration: number;
  modelYear: number;
  origin: CarOrigin;
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '?') {
    // horsepower uses '?' for missing values
    return null;
  }

  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

function parseRequiredNumber(value: string, field: string): number {
  const number = parseOptionalNumber(value);
  if (number === null) {
    throw new Error(`Missing or invalid number for "${field}": "${value}"`);
  }
  return number;
}

// Dataset years are two-digit (70 => 1970).
export function normaliseModelYear(year: number): number {
  if (year >= 0 && year < 100) {
    return 1900 + year;
  }
  return year;
}

export function normaliseOrigin(value: string): CarOrigin {
  const key = value.trim().toLowerCase();
  const origin = ORIGIN_BY_CODE[key];
  if (!origin) {
    throw new Error(`Unknown origin value: "${value}"`);
  }
  return origin;
}

export function cleanCarRow(row: RawCarRow): CleanCarInput {
  const name = row.name.trim();
  if (!name) {
    throw new Error('Car name is required');
  }

  return {
    name,
    mpg: parseOptionalNumber(row.mpg),
    cylinders: parseRequiredNumber(row.cylinders, 'cylinders'),
    displacement: parseRequiredNumber(row.displacement, 'displacement'),
    horsepower: parseOptionalNumber(row.horsepower),
    weight: parseRequiredNumber(row.weight, 'weight'),
    acceleration: parseRequiredNumber(row.acceleration, 'acceleration'),
    modelYear: normaliseModelYear(parseRequiredNumber(row.year, 'year')),
    origin: normaliseOrigin(row.origin),
  };
}
