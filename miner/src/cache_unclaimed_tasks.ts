import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ethers } from "ethers";
import { initializeLogger, log } from "./log";
import { initializeMiningConfig, c } from "./mc";
import { initializeBlockchain, wallet, arbius } from "./blockchain";

const maxBlocks = 10_000;

const getLogs = async (startBlock: number, endBlock: number) => {
  const unclaimedTasks: string[] = [];

  let fromBlock = startBlock;
  let toBlock = endBlock - fromBlock + 1 > maxBlocks ? fromBlock + maxBlocks - 1 : endBlock;

  while (toBlock <= endBlock) {
    log.debug(`Processing block [${fromBlock.toString()} to ${toBlock.toString()}]`);

    const events = await arbius.provider.getLogs({
      address: arbius.address,
      topics: [
        [
          ethers.utils.id("SolutionSubmitted(address,bytes32)"),
          ethers.utils.id("SolutionClaimed(address,bytes32)"),
        ],
        ethers.utils.hexZeroPad(wallet.address, 32),
      ],
      fromBlock,
      toBlock,
    });

    events.map((event) => {
      const parsedLog = arbius.interface.parseLog(event);
      switch (parsedLog.name) {
        case "SolutionSubmitted":
          log.debug(`Found solution submitted: ${parsedLog.args.task}`);
          unclaimedTasks.push(parsedLog.args.task);
          break;
        case "SolutionClaimed":
          log.debug(`Found solution claimed: ${parsedLog.args.task}`);
          const unclaimedTaskIdx = unclaimedTasks.indexOf(parsedLog.args.task);
          if (unclaimedTaskIdx > -1) {
            unclaimedTasks.splice(unclaimedTaskIdx, 1);
          }
          break;
      }
    });

    log.debug(`Unclaimed solutions: ${unclaimedTasks.length}`);

    if (toBlock === endBlock) break;

    fromBlock = toBlock + 1;
    toBlock = endBlock - fromBlock + 1 > maxBlocks ? fromBlock + maxBlocks - 1 : endBlock;
  }

  return unclaimedTasks;
};

async function main(configPath: string, startBlock?: string, endBlock?: string) {
  try {
    const mconf = JSON.parse(readFileSync(configPath, "utf8"));
    initializeMiningConfig(mconf);
  } catch (e) {
    console.error(`Unable to parse ${configPath}`);
    process.exit(1);
  }

  initializeLogger(null);
  await initializeBlockchain();

  const defaultStartBlock = "51380392";
  const defaultEndBlock = ""+(await wallet.provider.getBlockNumber());

  startBlock = startBlock || defaultStartBlock;
  endBlock = endBlock || defaultEndBlock;

  const unclaimedTasks = await getLogs(Number(startBlock), Number(endBlock));

  log.debug(`${unclaimedTasks.length} unclaimed tasks found for ${wallet.address}`);

  try {
    writeFileSync(join(__dirname, "unclaimed.json"), JSON.stringify(unclaimedTasks));
  } catch (e) {
    log.error("Error writing JSON file:", e);
    process.exit(1);
  }
}

if (process.argv.length < 3) {
  log.error("Usage: yarn scan:unclaimed MiningConfig.json [startBlock] [endBlock]");
  process.exit(1);
}

main(process.argv[2], process.argv[3], process.argv[4]);