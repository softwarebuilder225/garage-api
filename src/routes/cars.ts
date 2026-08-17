import { Router, type Request, type Response } from 'express';
import { carsToCsv, csvFilename } from '../lib/cars-csv.js';
import { createCar, listCars, serialiseCar } from '../services/cars-service.js';
import { carListQuerySchema, type CarListQuery } from '../validation/car-list-query.js';
import { createCarSchema } from '../validation/create-car.js';

export const carsRouter = Router();

function parseListQuery(req: Request, res: Response): CarListQuery | null {
  const parsed = carListQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid query parameters',
      details: parsed.error.flatten().fieldErrors,
    });
    return null;
  }

  return parsed.data;
}

carsRouter.get('/export', async (req, res, next) => {
  try {
    const filters = parseListQuery(req, res);
    if (!filters) {
      return;
    }

    const { cars } = await listCars(filters);
    const csv = carsToCsv(cars);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvFilename()}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

carsRouter.get('/', async (req, res, next) => {
  try {
    const filters = parseListQuery(req, res);
    if (!filters) {
      return;
    }

    const { cars, total } = await listCars(filters);

    res.json({
      data: cars.map(serialiseCar),
      total,
      filters,
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
        error: 'Invalid car',
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
