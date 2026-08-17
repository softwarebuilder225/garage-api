import { createApp } from './app.js';
import { env, isFirebaseConfigured } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);

  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Check .env');
  }
});
