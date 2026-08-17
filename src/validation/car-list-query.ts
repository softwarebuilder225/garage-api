import { z } from 'zod';
import { CAR_ORIGINS } from '../models/car.js';

const optionalNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value;
}, z.coerce.number().finite().optional());

const optionalOrigin = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return String(value).toLowerCase();
}, z.enum(CAR_ORIGINS).optional());

export const carListQuerySchema = z.object({
  q: z.string().trim().optional().default(''),
  origin: optionalOrigin,
  cylinders: optionalNumber,
  minYear: optionalNumber,
  maxYear: optionalNumber,
  minMpg: optionalNumber,
  maxMpg: optionalNumber,
  sort: z
    .enum([
      'name',
      'mpg',
      'cylinders',
      'displacement',
      'horsepower',
      'weight',
      'acceleration',
      'modelYear',
      'origin',
    ])
    .optional()
    .default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CarListQuery = z.infer<typeof carListQuerySchema>;
