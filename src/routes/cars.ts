import { Router } from 'express';
import { createCar, listCars, serialiseCar } from '../services/cars-service.js';
import { carListQuerySchema } from '../validation/car-list-query.js';
import { createCarSchema } from '../validation/create-car.js';

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

carsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = createCarSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Please check the car details and try again',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const car = await createCar(parsed.data);

    res.status(201).json({
      data: serialiseCar(car),
    });
  } catch (error) {
    next(error);
  }
});
