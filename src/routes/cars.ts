import { Router } from 'express';
import { listCars, serialiseCar } from '../services/cars-service.js';
import { carListQuerySchema } from '../validation/car-list-query.js';

export const carsRouter = Router();

carsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = carListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { cars, total } = await listCars(parsed.data);

    res.json({
      data: cars.map(serialiseCar),
      total,
      filters: parsed.data,
    });
  } catch (error) {
    next(error);
  }
});
