let extConfig;
try {
  extConfig = require('../secrets');
} catch (err) {
  extConfig = {};
}

const secretsOrExtWithDefault = (def) => (propName) => extConfig[propName] || process.env[propName] || def || '';

const wrapWithPropNames = obj => Object.keys(obj)
  .reduce(
    (
      acc,
      key
    ) => typeof obj[key] === 'function'
      ? Object.assign({}, acc, { [key]: obj[key](key) })
      : Object.assign({}, acc, { [key]: obj[key] }),
    {}
  );

const props = {
  RPC_IP: secretsOrExtWithDefault(''),
  RPC_PORT: secretsOrExtWithDefault(''),
  PROVIDER_URL: secretsOrExtWithDefault('http://localhost:8545'),
  CONTRACT_PATH: secretsOrExtWithDefault('./contracts/AcceptPay.sol'),
  CONTRACT_NAME: secretsOrExtWithDefault('AcceptPay'),
  DEFAULT_DEPLOY_GAS: secretsOrExtWithDefault(1500000),
  OWNER_REQUIRES_UNLOCK: secretsOrExtWithDefault(false),
  OWNER_ACCOUNT_PASSWORD: secretsOrExtWithDefault(''),
  SELLER_PASSWORD: secretsOrExtWithDefault('password'),
  BUYER_PASSWORD: secretsOrExtWithDefault('password'),
  USE_GETH: secretsOrExtWithDefault(false),
  ACCOUNT_TOP_UP_BALANCE: 2,
  DATA_DIR: process.env.DATA_DIR,
};

export default wrapWithPropNames(props);
