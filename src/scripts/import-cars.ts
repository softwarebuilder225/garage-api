import { resolve } from 'node:path';
import { FieldValue } from 'firebase-admin/firestore';
import { cleanCarRow } from '../lib/clean-car.js';
import { readAutomobileCsv } from '../lib/parse-csv.js';
import { getDb, getFirebaseApp } from '../config/firebase.js';
import { CARS_COLLECTION } from '../models/car.js';

const BATCH_SIZE = 400;

async function clearCarsCollection(): Promise<number> {
  const db = getDb();
  const snapshot = await db.collection(CARS_COLLECTION).get();

  if (snapshot.empty) {
    return 0;
  }

  let deleted = 0;
  let batch = db.batch();
  let opsInBatch = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    opsInBatch += 1;
    deleted += 1;

    if (opsInBatch >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      opsInBatch = 0;
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  return deleted;
}

async function importCars(csvPath: string, clearExisting: boolean): Promise<void> {
  getFirebaseApp();

  const rawRows = readAutomobileCsv(csvPath);
  const cars = rawRows.map((row, index) => {
    try {
      return cleanCarRow(row);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to clean row ${index + 2}: ${message}`);
    }
  });

  console.log(`Parsed ${cars.length} cars from ${csvPath}`);

  if (clearExisting) {
    const deleted = await clearCarsCollection();
    console.log(`Cleared ${deleted} existing cars from "${CARS_COLLECTION}"`);
  }

  const db = getDb();
  let batch = db.batch();
  let opsInBatch = 0;
  let written = 0;

  for (const car of cars) {
    const ref = db.collection(CARS_COLLECTION).doc();
    batch.set(ref, {
      ...car,
      createdAt: FieldValue.serverTimestamp(),
    });
    opsInBatch += 1;
    written += 1;

    if (opsInBatch >= BATCH_SIZE) {
      await batch.commit();
      console.log(`Wrote ${written}/${cars.length} cars...`);
      batch = db.batch();
      opsInBatch = 0;
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  console.log(`Imported ${written} cars`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const clearExisting = args.includes('--clear');
  const pathArg = args.find((arg) => !arg.startsWith('--'));
  const csvPath = resolve(pathArg ?? 'data/Automobile.csv');

  try {
    await importCars(csvPath, clearExisting);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Import failed: ${message}`);
    process.exit(1);
  }
}

void main();
