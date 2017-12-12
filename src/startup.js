import { getWeb3, getOwnerAccount, log } from './utils';
import constants from './constants';
import fs from 'fs';
import path from 'path';

const {
  SELLER_PASSWORD,
  BUYER_PASSWORD,
  DATA_DIR,
  ACCOUNT_TOP_UP_BALANCE
} = constants;

const keystorePath = 'keystore';

const etherBalance = async (
  web3,
  addr
) => {
  const balance = await web3.eth.getBalance(addr);
  const ethers = web3.utils.fromWei(
    balance,
    'ether'
  );
  return parseFloat(ethers);
};

const sendWaitMinedTransaction = async (web3, to, from, value) => {
  return await new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      from,
      to,
      value: web3.utils.toWei(`${value}`, 'ether')
    })
      .on('confirmation', resolve)
      .on('error', reject);
  });
};

const sendWaitTxGetBalance = async (web3, to, from, value) => {
  await sendWaitMinedTransaction(web3, to, from, value);
  return await etherBalance(web3, to);
};

const logPrepareAccounts = async () => {
  const web3 = getWeb3();
  if (!DATA_DIR || !fs.existsSync(DATA_DIR)) {
    log('DATA_DIR environment variable is required to run server in Geth mode. Please set DATA_DIR to point to your dev blockchain data directory');
  }
  log(`Starting in Geth mode. Datadir is ${DATA_DIR}`);
  const keystores = fs.readdirSync(path.join(DATA_DIR, keystorePath));
  const ownerExcludedKeystores = keystores.slice(1);
  if (ownerExcludedKeystores.length !== 2) {
    log('Currently only 3 account mode is supported. Please create a test blockchain with 3 accounts.');
    process.exit(1);
  } else {
    const keystoreObjects = ownerExcludedKeystores.map((filePath) => {
      const rawdata = fs.readFileSync(path.join(DATA_DIR, keystorePath, filePath));
      return JSON.parse(rawdata);
    });
    const sellerDecrypted = web3.eth.accounts.decrypt(keystoreObjects[0], SELLER_PASSWORD);
    const buyerDecrypted = web3.eth.accounts.decrypt(keystoreObjects[1], BUYER_PASSWORD);
    let sellerBalance = await etherBalance(web3, sellerDecrypted.address);
    let buyerBalance = await etherBalance(web3, buyerDecrypted.address);
    if (!sellerBalance || !buyerBalance) {
      const owner = await getOwnerAccount(web3);
      if (!sellerBalance) {
        sellerBalance = await sendWaitTxGetBalance(
          web3,
          sellerDecrypted.address,
          owner,
          ACCOUNT_TOP_UP_BALANCE
        );
      }
      if (!buyerBalance) {
        buyerBalance = await sendWaitTxGetBalance(
          web3,
          buyerDecrypted.address,
          owner,
          ACCOUNT_TOP_UP_BALANCE
        );
      }
    }
    log('## Seller ##');
    log(`Private Key: ${sellerDecrypted.privateKey}`);
    log(`Address: ${sellerDecrypted.address}`);
    log(`Balance: ${sellerBalance}`);
    log('#############');
    log('## Buyer ##');
    log(`Private Key: ${buyerDecrypted.privateKey}`);
    log(`Address: ${buyerDecrypted.address}`);
    log(`Balance: ${buyerBalance}`);
    log('#############');
  }
};

export default logPrepareAccounts;
