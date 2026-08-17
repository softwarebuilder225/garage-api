import { z } from 'zod';
import { normaliseModelYear, normaliseOrigin } from '../lib/clean-car.js';
import { CAR_ORIGINS } from '../models/car.js';

function toNumberOrUndefined(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

function toNumberOrNull(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

const requiredPositiveNumber = (label: string) =>
  z.preprocess(
    toNumberOrUndefined,
    z
      .number({ error: `${label} is required` })
      .finite({ error: `${label} must be a number` })
      .positive({ error: `${label} must be greater than 0` }),
  );

export const createCarSchema = z.object({
  name: z
    .string({ error: 'Car name is required' })
    .trim()
    .min(1, 'Car name is required')
    .max(120, 'Car name is too long'),
  mpg: z.preprocess(
    toNumberOrNull,
    z
      .number({ error: 'MPG must be a number' })
      .finite()
      .nonnegative({ error: 'MPG cannot be negative' })
      .nullable(),
  ),
  cylinders: z.preprocess(
    toNumberOrUndefined,
    z
      .number({ error: 'Cylinders is required' })
      .int({ error: 'Cylinders must be a whole number' })
      .min(3, 'Cylinders must be between 3 and 16')
      .max(16, 'Cylinders must be between 3 and 16'),
  ),
  displacement: requiredPositiveNumber('Displacement'),
  horsepower: z.preprocess(
    toNumberOrNull,
    z
      .number({ error: 'Horsepower must be a number' })
      .finite()
      .nonnegative({ error: 'Horsepower cannot be negative' })
      .nullable(),
  ),
  weight: requiredPositiveNumber('Weight'),
  acceleration: requiredPositiveNumber('Acceleration'),
  modelYear: z.preprocess(
    toNumberOrUndefined,
    z
      .number({ error: 'Year is required' })
      .int({ error: 'Year must be a whole number' })
      .positive()
      .transform(normaliseModelYear)
      .refine((year) => year >= 1900 && year <= 2030, {
        message: 'Year must be between 1900 and 2030',
      }),
  ),
  origin: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return String(value).trim().toLowerCase();
  }, z.string({ error: 'Origin is required' }).transform((value, ctx) => {
    try {
      return normaliseOrigin(value);
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: `Origin must be one of ${CAR_ORIGINS.join(', ')}`,
      });
      return z.NEVER;
    }
  })),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;
