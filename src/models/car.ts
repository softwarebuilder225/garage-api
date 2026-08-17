export const CAR_ORIGINS = ['usa', 'europe', 'japan'] as const;

export type CarOrigin = (typeof CAR_ORIGINS)[number];

export interface Car {
  id: string;
  name: string;
  mpg: number | null;
  cylinders: number;
  displacement: number;
  horsepower: number | null;
  weight: number;
  acceleration: number;
  modelYear: number;
  origin: CarOrigin;
  createdAt: Date;
}

export const CARS_COLLECTION = 'cars';
