import { Router } from 'express';
import { isFirebaseConfigured } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'johns-garage-api',
    firebaseConfigured: isFirebaseConfigured(),
  });
});
