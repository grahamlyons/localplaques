import express, {Express, NextFunction, Request, Response } from 'express';
import { engine } from 'express-handlebars';
import morgan from 'morgan';

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

const logger = morgan('tiny');

app.use(logger);
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500)
  res.send('Internal Server Error');
}

app.use(errorHandler);

app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

app.listen(port);
