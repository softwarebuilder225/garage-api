import { FieldValue, type DocumentData, type QueryDocumentSnapshot, type Timestamp } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase.js';
import { CARS_COLLECTION, type Car, type CarOrigin } from '../models/car.js';
import type { CreateCarInput } from '../validation/create-car.js';
import type { CarListQuery } from '../validation/car-list-query.js';

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as Timestamp).toDate();
  }

  return new Date(0);
}

export function mapCarDoc(doc: QueryDocumentSnapshot<DocumentData>): Car {
  const data = doc.data();

  return {
    id: doc.id,
    name: String(data.name ?? ''),
    mpg: typeof data.mpg === 'number' ? data.mpg : null,
    cylinders: Number(data.cylinders),
    displacement: Number(data.displacement),
    horsepower: typeof data.horsepower === 'number' ? data.horsepower : null,
    weight: Number(data.weight),
    acceleration: Number(data.acceleration),
    modelYear: Number(data.modelYear),
    origin: data.origin as CarOrigin,
    createdAt: toDate(data.createdAt),
  };
}

function matchesFilters(car: Car, query: CarListQuery): boolean {
  if (query.q) {
    const needle = query.q.toLowerCase();
    if (!car.name.toLowerCase().includes(needle)) {
      return false;
    }
  }

  if (query.origin && car.origin !== query.origin) {
    return false;
  }

  if (query.cylinders !== undefined && car.cylinders !== query.cylinders) {
    return false;
  }

  if (query.minYear !== undefined && car.modelYear < query.minYear) {
    return false;
  }

  if (query.maxYear !== undefined && car.modelYear > query.maxYear) {
    return false;
  }

  if (query.minMpg !== undefined) {
    if (car.mpg === null || car.mpg < query.minMpg) {
      return false;
    }
  }

  if (query.maxMpg !== undefined) {
    if (car.mpg === null || car.mpg > query.maxMpg) {
      return false;
    }
  }

  return true;
}

function compareNullableNumbers(
  a: number | null,
  b: number | null,
  order: 'asc' | 'desc',
): number {
  if (a === null && b === null) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }

  return order === 'asc' ? a - b : b - a;
}

function sortCars(cars: Car[], query: CarListQuery): Car[] {
  const { sort, order } = query;
  const direction = order === 'asc' ? 1 : -1;

  return [...cars].sort((left, right) => {
    switch (sort) {
      case 'name':
      case 'origin': {
        const result = left[sort].localeCompare(right[sort], undefined, {
          sensitivity: 'base',
        });
        return result * direction;
      }
      case 'mpg':
      case 'horsepower':
        return compareNullableNumbers(left[sort], right[sort], order);
      case 'cylinders':
      case 'displacement':
      case 'weight':
      case 'acceleration':
      case 'modelYear': {
        const result = left[sort] - right[sort];
        return result * direction;
      }
      default:
        return 0;
    }
  });
}

export async function listCars(query: CarListQuery): Promise<{
  cars: Car[];
  total: number;
}> {
  const snapshot = await getDb().collection(CARS_COLLECTION).get();
  const cars = snapshot.docs.map(mapCarDoc).filter((car) => matchesFilters(car, query));
  const sorted = sortCars(cars, query);

  return {
    cars: sorted,
    total: sorted.length,
  };
}

export function serialiseCar(car: Car) {
  return {
    ...car,
    createdAt: car.createdAt.toISOString(),
  };
}

export async function createCar(input: CreateCarInput): Promise<Car> {
  const db = getDb();
  const ref = db.collection(CARS_COLLECTION).doc();
  const createdAt = new Date();

  await ref.set({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    id: ref.id,
    ...input,
    createdAt,
  };
}
