import type { Car } from '../models/car.js';

const CSV_HEADERS = [
  'name',
  'modelYear',
  'origin',
  'mpg',
  'cylinders',
  'displacement',
  'horsepower',
  'weight',
  'acceleration',
] as const;

function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function carsToCsv(cars: Car[]): string {
  const rows = cars.map((car) =>
    [
      csvCell(car.name),
      csvCell(car.modelYear),
      csvCell(car.origin),
      csvCell(car.mpg),
      csvCell(car.cylinders),
      csvCell(car.displacement),
      csvCell(car.horsepower),
      csvCell(car.weight),
      csvCell(car.acceleration),
    ].join(','),
  );

  return `\uFEFF${[CSV_HEADERS.join(','), ...rows].join('\r\n')}\r\n`;
}

export function csvFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `johns-garage-cars-${stamp}.csv`;
}
