import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env, isFirebaseConfigured } from './env.js';

let app: App | undefined;
let db: Firestore | undefined;

function serviceAccountFromEnv(): ServiceAccount | string {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
    }
  }

  const credentialsPath = resolve(env.GOOGLE_APPLICATION_CREDENTIALS as string);

  if (!existsSync(credentialsPath)) {
    throw new Error(`Service account file not found: ${credentialsPath}`);
  }

  return credentialsPath;
}

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
    throw new Error('Missing Firebase config (project id + credentials)');
  }

  app = initializeApp({
    credential: cert(serviceAccountFromEnv()),
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
