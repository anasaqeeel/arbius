import EngineArtifact from './artifacts/contracts/V2_EngineV2.sol/V2_EngineV2.json';
import BaseTokenArtifact from './artifacts/contracts/BaseTokenV1.sol/BaseTokenV1.json';
import * as fs from 'fs';
import { initializeLogger, log } from './log';
import { c, initializeMiningConfig } from './mc';
import { ethers, Contract, Wallet, BigNumber } from 'ethers';
import Config from './config.json';
import { sleep, expretry } from './utils';
import { MiningConfig } from './types';
import { initializeBlockchain, arbius, wallet, token } from './blockchain';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);

async function main(taskidWatch: string, vote: boolean = true) {
  log.debug("Setting max file listeners to 100 for ethers");
  process.setMaxListeners(100);

  log.debug(`Checking ${wallet.address} to vote ${vote}`);

  const [etherBalance, balance, validatorStaked, validatorMinimum] = await Promise.all([
    expretry(async () => await arbius.provider.getBalance(wallet.address)),
    expretry(async () => await token.balanceOf(wallet.address)),
    expretry(async () => (await arbius.validators(wallet.address)).staked),
    expretry(async () => await arbius.getValidatorMinimum()),
  ]);

  let depositAmount = validatorMinimum.mul(120).div(100).sub(validatorStaked);
  if (depositAmount.gt(balance)) {
    depositAmount = balance;
  }

  log.debug(
    `${wallet.address}\tETH:${etherBalance ? ethers.utils.formatEther(etherBalance) : '0'}\tAIUS:${ethers.utils.formatEther(balance)}\tSTAKED:${ethers.utils.formatEther(validatorStaked)}\tDEPOSIT:${ethers.utils.formatEther(depositAmount)}`
  );

  if (depositAmount.gte(0)) {
    await expretry(async () => {
      const tx = await arbius.validatorDeposit(wallet.address, depositAmount);
      const receipt = await tx.wait();
      log.info(`AIUS Deposit in ${receipt.transactionHash}`);
    });
  }

  const existingContestation = await expretry(async () => await arbius.contestations(taskidWatch));
  log.info(`Contestation exists for ${taskidWatch} by ${existingContestation.validator}`);

  const canVote = await arbius.validatorCanVote(wallet.address, taskidWatch);
  if (canVote.toString() !== '0') {
    log.warn(`Validator cannot vote on ${taskidWatch} code ${canVote}`);
    process.exit(1);
  }

  if (existingContestation.validator !== ethers.constants.AddressZero) {
    const tx = await expretry(async () => await arbius.voteOnContestation(taskidWatch, vote));
    const receipt = await tx.wait();
    log.info(`Voted on contestation for ${taskidWatch} in ${receipt.transactionHash}`);
  } else {
    const tx = await expretry(async () => await arbius.submitContestation(taskidWatch));
    const receipt = await tx.wait();
    log.info(`Submitted contestation for ${taskidWatch} in ${receipt.transactionHash}`);
  }
}

async function start(configPath: string, taskid: string, vote: boolean = true) {
  try {
    const mconf = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    initializeMiningConfig(mconf);
  } catch (e) {
    console.error(`Unable to parse ${configPath}`);
    process.exit(1);
  }

  initializeLogger(c.log_path);

  try {
    const rev = process.env.GIT_REV || 'unknown';
    log.info(`Arbius Vote on Task ${rev.substring(0, 8)} starting`);
  } catch (e) {
    log.warn('Could not retrieve Git revision. Make sure GIT_REV environment variable is set.');
  }

  log.debug(`Logging to ${c.log_path}`);

  await initializeBlockchain();
  await main(taskid, vote);
}

if (process.argv.length < 5) {
  console.error('Usage: yarn vote MiningConfig.json [taskid] [true|false]');
  process.exit(1);
}

start(process.argv[2], process.argv[3], process.argv[4] === 'true' || process.argv[4] === '1')
  .catch((e) => {
    log.error('Unhandled error:', e);
    process.exit(1);
  });