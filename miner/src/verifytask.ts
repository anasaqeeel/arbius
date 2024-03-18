import * as fs from 'fs';
import { initializeLogger, log } from './log';
import { ethers, BigNumber } from 'ethers';
import { base58 } from '@scure/base';
import axios from 'axios';
import Config from './config.json';
import { initializeMiningConfig } from './mc';
import { initializeBlockchain } from './blockchain';
import { Kandinsky2Model, getModelById, checkModelFilter, hydrateInput } from './models';
import { sleep, now, taskid2Seed, expretry, generateCommitment } from './utils';
import { MiningConfig, Task, Solution, Job, Model, QueueJobProps } from './types';
import { c } from './mc';
import { replicate } from './ml';
import { wallet, arbius, token, solver, getBlockNumber, depositForValidator, getValidatorStaked } from './blockchain';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);

const EnabledModels = [
  {
    ...Kandinsky2Model,
    filters: [
      {
        minfee: ethers.utils.parseEther('0'),
        mintime: 0,
      },
    ],
    getfiles: async (m: Model, taskid: string, input: any) => {
      const url = c.ml.cog[Config.models.kandinsky2.id].url;
      const res = await axios.post(url, { input });

      if (!res) {
        throw new Error('unable to getfiles');
      }

      if (res.data.output.length !== 1) {
        throw new Error('unable to getfiles -- data.output length not 1');
      }

      const b64data = res.data.output[0];
      const data = b64data.replace(/^data:\w+\/\w+;base64,/, '');
      const buf = Buffer.from(data, 'base64');

      const path = 'out-1.png';
      fs.writeFileSync(`${__dirname}/../cache/${path}`, buf);

      return [path];
    },
  },
];

async function verifyTask(taskid: string) {
  const { cid: inputCidBytes } = await expretry(async () => await arbius.tasks(taskid));

  const inputCid = base58.encode(Uint8Array.from(Buffer.from(inputCidBytes.slice(2), 'hex')));
  const res = await expretry(async () => await axios.get(`https://ipfs.io/ipfs/${inputCid}`));
  if (res?.status !== 200) {
    log.error(`Task (${taskid}) input CID could not be retrieved (${res?.status})`);
    return;
  }

  const taskInputData = res.data;
  console.log(taskInputData);

  const { validator: solutionValidator, blocktime: solutionBlocktime, claimed: solutionClaimed, cid: solutionCid } = await expretry(async () => await arbius.solutions(taskid));

  console.log({
    solutionValidator,
    solutionBlocktime,
    solutionClaimed,
    solutionCid,
  });

  const { owner } = await expretry(async () => await arbius.tasks(taskid));
  console.log({ owner });

  const { model: taskModel, fee: taskFee, owner: taskOwner, blocktime: taskBlocktime, version: taskVersion, cid: taskCid } = await expretry(async () => await arbius.tasks(taskid));
  console.log({
    taskModel,
    taskFee,
    taskOwner,
    taskBlocktime,
    taskVersion,
    taskCid,
  });

  const m = getModelById(EnabledModels, taskModel);
  if (m === null) {
    log.error(`Task (${taskid}) could not find model (${taskModel})`);
    return;
  }
  console.log({ m });

  const { modelEnabled, modelTemplate, filterPassed } = checkModelFilter(EnabledModels, {
    model: taskModel,
    now: now(),
    fee: taskFee,
    blocktime: taskBlocktime,
    owner: taskOwner,
  });

  const preprocessed_obj = taskInputData;

  const hydrated = hydrateInput(preprocessed_obj, modelTemplate);
  if (hydrated.err) {
    log.warn(`Task (${taskid}) hydration error ${hydrated.errmsg}`);
    return;
  }

  let input = hydrated.input;
  input.seed = taskid2Seed(taskid);
  console.log({ input });

  const cid = await m.getcid(c, m, taskid, input);
  if (!cid) {
    log.error(`Task (${taskid}) CID could not be generated`);
    return;
  }
  log.info(`CID ${cid} generated`);

  if (cid !== solutionCid) {
    log.error(`Task (${taskid}) CID mismatch`);
    return;
  } else {
    log.info(`Task (${taskid}) CID matches`);
    return;
  }
}

export async function main(taskid: string) {
  log.debug("Setting max file listeners to 100 for ethers");
  process.setMaxListeners(100);

  await verifyTask(taskid);
}

async function start(configPath: string, taskid: string) {
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
    log.info(`Arbius Verify Task ${rev.substring(0, 8)} starting`);
  } catch (e) {
    log.warn('Could not retrieve Git revision. Make sure GIT_REV environment variable is set.');
  }

  log.debug(`Logging to ${c.log_path}`);

  await initializeBlockchain();
  log.debug(`Loaded wallet (${wallet.address})`);

  await main(taskid);
}

if (process.argv.length < 3) {
  console.error('Usage: yarn verify:task MiningConfig.json taskid');
  process.exit(1);
}

start(process.argv[2], process.argv[3]).catch((e) => {
  log.error('Unhandled error:', e);
  process.exit(1);
});