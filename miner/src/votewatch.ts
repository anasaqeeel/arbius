import * as fs from 'fs';
import { initializeLogger, log } from './log';
import { c, initializeMiningConfig } from './mc';
import { ethers } from 'ethers';
import Config from './config.json';
import { sleep } from './utils';
import { arbius, initializeBlockchain } from './blockchain';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);

async function main(taskidWatch?: string) {
  log.debug("Setting max file listeners to 100 for ethers");
  process.setMaxListeners(100);

  const logEvent = (event: string, ...args: any[]) => {
    if (!taskidWatch || args[1] === taskidWatch) {
      log.info(event, ...args);
    }
  };

  arbius.on('ContestationSubmitted', (validator: string, taskid: string, evt: ethers.Event) => {
    logEvent('ContestationSubmitted', validator, taskid);
  });

  arbius.on('ContestationVote', (validator: string, taskid: string, yea: boolean, evt: ethers.Event) => {
    logEvent('ContestationVote', validator, taskid, yea);
  });

  arbius.on('ContestationVoteFinish', (taskid: string, start_idx: number, end_idx: number, evt: ethers.Event) => {
    logEvent('ContestationVoteFinish', taskid, start_idx, end_idx);
  });

  while (true) {
    await sleep(1000);
  }
}

async function start(configPath: string, taskid?: string) {
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
    log.info(`Arbius Vote Watch ${rev.substring(0, 8)} starting`);
  } catch (e) {
    log.warn('Could not retrieve Git revision. Make sure GIT_REV environment variable is set.');
  }

  log.debug(`Logging to ${c.log_path}`);

  await initializeBlockchain();

  await main(taskid);
}

if (process.argv.length < 3) {
  console.error('Usage: yarn watch:vote MiningConfig.json [taskid]');
  process.exit(1);
}

start(process.argv[2], process.argv[3]).catch((e) => {
  log.error('Unhandled error:', e);
  process.exit(1);
});