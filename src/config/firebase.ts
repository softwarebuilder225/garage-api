import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env, isFirebaseConfigured } from './env.js';

let app: App | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): App {
  if (app) {
    return app;
  }

  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env and set FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS.',
    );
  }

  const credentialsPath = resolve(env.GOOGLE_APPLICATION_CREDENTIALS as string);

  if (!existsSync(credentialsPath)) {
    throw new Error(
      `Firebase service account file not found at "${credentialsPath}". Download it from Firebase → Project settings → Service accounts.`,
    );
  }

  app = initializeApp({
    credential: cert(credentialsPath),
    projectId: env.FIREBASE_PROJECT_ID,
  });

  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }

  return db;
}
