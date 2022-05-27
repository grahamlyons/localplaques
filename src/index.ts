import express, {Express, NextFunction, Request, Response } from 'express';
import { engine } from 'express-handlebars';
import logger from 'pino-http';
import path from 'path';
import sassMiddleware from 'node-sass-middleware';

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(logger());
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
  res.err = err;
  res.status(500);
  res.send('Internal Server Error');
}

app.use(sassMiddleware({                                                           
  src: path.join(__dirname, '../public'),                                             
  dest: path.join(__dirname, '../public'),                                            
  indentedSyntax: false,
  sourceMap: true                                                                  
}));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
