import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import logPrepareAccounts from './startup';
import constants from './constants';
import { log } from './utils';

const {
  USE_GETH
} = constants;

const port = process.env.PORT || 9011;
const app = express();
const jsonMiddleware = bodyParser.json();

app.use(jsonMiddleware);
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

routes(app);

let promise;

if (USE_GETH) {
  promise = logPrepareAccounts();
} else {
  promise = Promise.resolve();
}

promise
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on ${port}`);
    });
  })
  .catch((e) => {
    log(e.stack);
    debugger;
  });

