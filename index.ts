import express, {Express, Request, Response } from 'express';

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World');
});

app.listen(port);
