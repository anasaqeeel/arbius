import * as fs from 'fs';
import { initializeLogger, log } from './log';
import { c, initializeMiningConfig } from './mc';
import { ethers } from 'ethers';
import Config from './config.json';
import { sleep } from './utils';
import { MiningConfig } from './types';
import { wallet, arbius, initializeBlockchain } from './blockchain';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);

async function main() {
  log.debug("Setting max file listeners to 100 for ethers");
  process.setMaxListeners(100);

  let totalSolutions = 0;
  let shortSolutions = 0;
  const solutionMap: Map<string, string[]> = new Map();
  const shortSolutionMap: Map<string, string[]> = new Map();

  arbius.on('SolutionSubmitted', (validator: string, taskid: string, evt: ethers.Event) => {
    totalSolutions++;
    shortSolutions++;

    const updateSolutionMap = (map: Map<string, string[]>) => {
      const solutions = map.get(validator);
      if (solutions) {
        solutions.push(taskid);
      } else {
        map.set(validator, [taskid]);
      }
    };

    updateSolutionMap(solutionMap);
    updateSolutionMap(shortSolutionMap);
  });

  const bufferTime = 60; // seconds

  setInterval(() => {
    const sorted = Array.from(shortSolutionMap.entries()).sort((a, b) => b[1].length - a[1].length);

    log.debug('=====');
    log.debug(`Total Solutions: ${totalSolutions}`);
    log.debug(`Short Solutions: ${shortSolutions}`);
    log.debug(`Solutions per second: ${shortSolutions / bufferTime}`);
    log.debug(`Total validators solutions in last minute: ${sorted.length}`);
    log.debug('Top 30 validators by solutions in last minute:');

    sorted.slice(0, 30).forEach(([validator, solutions]) => {
      log.debug(`${validator}: ${solutions.length}`);
    });

    shortSolutions = 0;
    shortSolutionMap.clear();
  }, bufferTime * 1000);

  while (true) {
    await sleep(1000);
  }
}

async function start(configPath: string) {
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
    log.info(`Arbius Solution Watch ${rev.substring(0, 8)} starting`);
  } catch (e) {
    log.warn('Could not retrieve Git revision. Make sure GIT_REV environment variable is set.');
  }

  log.debug(`Logging to ${c.log_path}`);

  await initializeBlockchain();
  log.debug(`Loaded wallet (${wallet.address})`);

  await main();
}

if (process.argv.length < 3) {
  console.error('Usage: yarn watch:solution MiningConfig.json');
  process.exit(1);
}

start(process.argv[2]);