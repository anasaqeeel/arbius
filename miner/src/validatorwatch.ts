import * as fs from 'fs';
import { initializeLogger, log } from './log';
import { c, initializeMiningConfig } from './mc';
import { ethers, BigNumber } from 'ethers';
import Config from './config.json';
import { sleep } from './utils';
import { MiningConfig } from './types';
import { wallet, arbius, initializeBlockchain } from './blockchain';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);

async function main(vwatch: string) {
  log.debug("Setting max file listeners to 100 for ethers");
  process.setMaxListeners(100);

  const logEvent = (event: string, taskid: string, ...args: any[]) => {
    if (vwatch === args[0]) {
      log.info(event, taskid, ...args.slice(1));
    }
  };

  arbius.on('TaskSubmitted', (taskid: string, modelid: string, fee: BigNumber, sender: string, evt: ethers.Event) => {
    logEvent('TaskSubmitted', taskid, sender);
  });

  arbius.on('SolutionSubmitted', (validator: string, taskid: string, evt: ethers.Event) => {
    logEvent('SolutionSubmitted', taskid, validator);
  });

  arbius.on('ContestationSubmitted', (validator: string, taskid: string, evt: ethers.Event) => {
    logEvent('ContestationSubmitted', taskid, validator);
  });

  arbius.on('ContestationVote', (validator: string, taskid: string, yea: boolean, evt: ethers.Event) => {
    logEvent('ContestationVote', taskid, validator, yea);
  });

  while (true) {
    await sleep(1000);
  }
}

async function start(configPath: string, validator: string) {
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
    log.info(`Arbius Validator Watch ${rev.substring(0, 8)} starting`);
  } catch (e) {
    log.warn('Could not retrieve Git revision. Make sure GIT_REV environment variable is set.');
  }

  log.debug(`Logging to ${c.log_path}`);

  await initializeBlockchain();
  log.debug(`Loaded wallet (${wallet.address})`);

  await main(validator);
}

if (process.argv.length < 3) {
  console.error('Usage: yarn watch:validator MiningConfig.json VALIDATORADDRESS');
  process.exit(1);
}

start(process.argv[2], process.argv[3]).catch((e) => {
  log.error('Unhandled error:', e);
  process.exit(1);
});