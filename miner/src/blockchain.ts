import { ethers, Contract, Wallet, BigNumber } from 'ethers';
import { c } from './mc';
import Config from './config.json';
import { expretry } from './utils';
import EngineArtifact from './artifacts/contracts/V2_EngineV2.sol/V2_EngineV2.json';
import BaseTokenArtifact from './artifacts/contracts/BaseTokenV1.sol/BaseTokenV1.json';
import ArbSysArtifact from './artifacts/@arbitrum/nitro-contracts/src/precompiles/ArbSys.sol/ArbSys.json';

const ARBSYS_ADDR = ethers.utils.getAddress('0x0000000000000000000000000000000000000064');

let provider: ethers.providers.JsonRpcProvider;
let wallet: Wallet;
let arbius: Contract;
let token: Contract;
let solver: Contract;
let arbsys: Contract;

export async function initializeBlockchain() {
  provider = new ethers.providers.JsonRpcProvider(c.blockchain.rpc_url!);
  wallet = new Wallet(c.blockchain.private_key, provider);

  arbius = new Contract(ethers.utils.getAddress(Config.v2_engineAddress), EngineArtifact.abi, wallet);
  token = new Contract(ethers.utils.getAddress(Config.v2_baseTokenAddress), BaseTokenArtifact.abi, wallet);
  arbsys = new Contract(ARBSYS_ADDR, ArbSysArtifact.abi, wallet);

  if (!c.blockchain.use_delegated_validator) {
    solver = arbius;
  } else {
    // solver = new Contract(ethers.utils.getAddress(c.blockchain.delegated_validator_address), DelegatedValidator.abi, wallet);
  }
}

export async function getBlockNumber() {
  const abn = await expretry(async () => await arbsys.arbBlockNumber());
  return abn;
}

export async function getValidatorStaked(): Promise<BigNumber> {
  const staked = await expretry(async () => {
    const s = (await arbius.validators(wallet.address)).staked;
    return s;
  });
  return staked;
}

export async function depositForValidator(depositAmount: BigNumber) {
  const tx = await solver.validatorDeposit(wallet.address, depositAmount);
  const receipt = await tx.wait();
  return receipt;
}

export {
  provider,
  wallet,
  arbius,
  token,
  solver,
}