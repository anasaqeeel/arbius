import * as fs from 'fs';
import { initializeLogger, log } from './log';
import { c, initializeMiningConfig } from './mc';
import { initializeML } from './ml';
import { initializeBlockchain, wallet } from './blockchain';
import { initializeRPC } from './rpc';
import { main } from './index';
import { checkIpfs } from './ipfs';

async function start(configPath: string) {
  try {
    const mconf = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    initializeMiningConfig(mconf);
  } catch (e) {
    console.error(`Unable to parse ${configPath}`);
    process.exit(1);
  }

  initializeLogger(c.log_path);

  if (c.evilmode) {
    for (let i = 0; i < 20; ++i) {
      log.warn('YOU HAVE EVIL MODE ENABLED, YOU WILL BE SLASHED');
      log.warn('KILL YOUR MINER IMMEDIATELY IF NOT ON TESTNET');
    }
  }

  try {
    const rev = process.env.GIT_REV || 'unknown';
    log.info(`Arbius Miner ${rev.substring(0, 8)} starting`);
  } catch (e) {
    log.warn('Could not retrieve Git revision. Make sure GIT_REV environment variable is set.');
  }

  log.debug(`Logging to ${c.log_path}`);

  await initializeML(c);
  log.debug(`ML initialized`);

  await initializeBlockchain();
  log.debug(`Loaded wallet (${wallet.address})`);

  await initializeRPC();
  log.debug(`RPC initialized`);

  await checkIpfs(c);
  log.debug(`IPFS check passed`);

  try {
    await main();
  } catch (e) {
    log.error('Error in main function:', e);
    process.exit(1);
  }
}

if (process.argv.length < 3) {
  console.error('Usage: yarn start MiningConfig.json');
  process.exit(1);
}

start(process.argv[2]).catch((e) => {
  log.error('Unhandled error:', e);
  process.exit(1);
});