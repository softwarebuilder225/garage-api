import { readFileSync } from 'node:fs';
import type { RawCarRow } from './clean-car.js';

const EXPECTED_HEADERS = [
  'mpg',
  'cylinders',
  'displacement',
  'horsepower',
  'weight',
  'acceleration',
  'year',
  'origin',
  'name',
] as const;

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function headerAlias(header: string): string {
  const normalised = normaliseHeader(header);
  if (normalised === 'model_year') {
    return 'year';
  }
  if (normalised === 'car_name' || normalised === 'carname') {
    return 'name';
  }
  return normalised;
}

export function parseAutomobileCsv(csvText: string): RawCarRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one car');
  }

  const headers = splitCsvLine(lines[0]).map(headerAlias);

  for (const expected of EXPECTED_HEADERS) {
    if (!headers.includes(expected)) {
      throw new Error(
        `CSV is missing required column "${expected}". Found: ${headers.join(', ')}`,
      );
    }
  }

  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    if (values.length < headers.length) {
      throw new Error(`Row ${index + 2} has too few columns: ${line}`);
    }

    const record: Record<string, string> = {};
    headers.forEach((header, columnIndex) => {
      record[header] = values[columnIndex] ?? '';
    });

    return {
      mpg: record.mpg,
      cylinders: record.cylinders,
      displacement: record.displacement,
      horsepower: record.horsepower,
      weight: record.weight,
      acceleration: record.acceleration,
      year: record.year,
      origin: record.origin,
      name: record.name,
    };
  });
}

export function readAutomobileCsv(filePath: string): RawCarRow[] {
  const csvText = readFileSync(filePath, 'utf8');
  return parseAutomobileCsv(csvText);
}
