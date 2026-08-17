# Automobile dataset

Source: [Automobile Dataset on Kaggle](https://www.kaggle.com/datasets/tawfikelmetwally/automobile-dataset)
(UCI Auto MPG data, 1970s-1980s).

File used by the import script: `Automobile.csv`

| Column | Notes |
| --- | --- |
| mpg | Miles per gallon; may be empty in rare cases |
| cylinders | Engine cylinders |
| displacement | Engine size (cubic inches) |
| horsepower | May be `?` in the raw CSV; stored as `null` |
| weight | Pounds |
| acceleration | 0–60 time in seconds |
| year | Stored as `70`-`82` in CSV; import converts to `1970`-`1982` |
| origin | `1` USA, `2` Europe, `3` Japan |
| name | Car make and model |

Import with:

```bash
npm run import
# or replace existing cars:
npm run import -- --clear
```
