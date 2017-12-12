import {
  deployContract,
  getContractJsonAbi
} from './deploy';
import {
  getAccounts,
  getWeb3
} from './utils';

const addresses = [];

const dateParser = (val) => Date.parse(val) / 1000 | 0;
const stringParser = (val) => {
  let toReturn;
  if (typeof val === 'string') {
    const web3 = getWeb3();
    toReturn = web3.utils.toHex(val);
  } else {
    throw new Error(`Value ${val} is not a string`);
  }
  return toReturn;
};

const deployFields = {
  startDate: dateParser,
  endDate: dateParser,
  terms: stringParser
};

const parseForDeploy = (
  body,
  validator
) => Object.entries(body).reduce((acc, [key, value]) => ({
  ...acc,
  [key]: validator[key](value)
}), {});

const resHeadersHandler = (req, res) => {
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send('');
};

const routes = (app) => {
  app.options('/deploy', resHeadersHandler);
  app.post('/deploy', async (req, res) => {
    const {
      terms,
      startDate,
      endDate
    } = parseForDeploy(req.body, deployFields);
    const {
      seller,
      buyer
    } = await getAccounts();
    const opts = [startDate, endDate, terms, seller, buyer];
    const address = await deployContract(opts);
    addresses.push(address);
    res.status(200).send({
      address
    });
  });

  app.get('/seller-address', async (req, res) => {
    const { seller: address } = await getAccounts();
    res.send({
      address
    });
  });

  app.get('/buyer-address', async (req, res) => {
    const { buyer: address } = await getAccounts();
    res.send({
      address
    });
  });

  app.get('/contract-abi', (req, res) => {
    res.send(getContractJsonAbi());
  });

  app.get('/contracts', (req, res) => {
    res.send(addresses);
  });
};

export default routes;
