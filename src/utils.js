import constants from './constants';
import Web3 from 'web3';

const {
  PROVIDER_URL,
  RPC_IP,
  RPC_PORT,
  OWNER_REQUIRES_UNLOCK,
  OWNER_ACCOUNT_PASSWORD
} = constants;

const providerUrl = !!RPC_IP && !!RPC_PORT ? `http://${RPC_IP}:${RPC_PORT}` : PROVIDER_URL;

export const getWeb3 = () => new Web3(new Web3.providers.HttpProvider(providerUrl));

export const getAccounts = async () => {
  const web3 = getWeb3();
  const accounts = await web3.eth.getAccounts();
  return {
    seller: accounts[1].toLowerCase(),
    buyer: accounts[2].toLowerCase()
  };
};

export const getOwnerAccount = async (web3) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  if (OWNER_REQUIRES_UNLOCK) {
    await web3.eth.personal.unlockAccount(account, OWNER_ACCOUNT_PASSWORD);
  }
  return account;
};

export const log = (message) => {
  const date = new Date();
  console.log(`${date.toISOString()} : ${message}`);
};
