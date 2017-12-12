import fs from 'fs';
import solc from 'solc';
import constants from './constants';
import {
  getWeb3,
  getOwnerAccount,
  log
} from './utils';

const {
  CONTRACT_PATH,
  CONTRACT_NAME,
  DEFAULT_DEPLOY_GAS,
  USE_GETH
} = constants;

let compiledContractRef = null;

const getContractCode = () => fs.readFileSync(CONTRACT_PATH).toString();

const getCompiledContract = () => {
  if (!compiledContractRef) {
    compiledContractRef = solc.compile(getContractCode());
  }
  return compiledContractRef;
};

const getContractByteCode = () => {
  if (!compiledContractRef) {
    getCompiledContract();
  }
  return compiledContractRef.contracts[`:${CONTRACT_NAME}`].bytecode;
};

const getContractAbi = (compiled) => compiled.contracts[`:${CONTRACT_NAME}`].interface;

export const getContractJsonAbi = () => {
  const compiledContract = getCompiledContract();
  const abi = getContractAbi(compiledContract);
  return JSON.parse(abi);
};

export const deployContract = async (opts) => {
  let address;
  try {
    const byteCode = getContractByteCode();
    const jsonAbi = getContractJsonAbi();
    const web3 = getWeb3();
    const owner = await getOwnerAccount(web3);
    const AcceptPay = new web3.eth.Contract(jsonAbi);
    const contractForDeploy = AcceptPay.deploy({
      data: '0x' + byteCode,
      arguments: opts
    });
    let gasEstimate;
    if (USE_GETH) {
      gasEstimate = await contractForDeploy.estimateGas();
    } else {
      gasEstimate = await contractForDeploy.estimateGas({
        gas: DEFAULT_DEPLOY_GAS
      });
    }
    const instance = await contractForDeploy.send({
      from: owner,
      gas: gasEstimate
    });
    address = instance.options.address;
  } catch (e) {
    log(e.stack);
  }
  return address;
};
