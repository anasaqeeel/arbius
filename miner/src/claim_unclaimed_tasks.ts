import { readFileSync, writeFileSync } from "fs";
import { ethers } from "ethers";
import { expretry } from "./utils";
import { initializeLogger, log } from "./log";
import { initializeMiningConfig, c } from "./mc";
import { initializeBlockchain, wallet, arbius } from "./blockchain";

async function main(configPath: string, unclaimedSrc?: string) {
  try {
    const mconf = JSON.parse(readFileSync(configPath, "utf8"));
    initializeMiningConfig(mconf);
  } catch (e) {
    console.error(`Unable to parse ${configPath}`);
    process.exit(1);
  }

  let unclaimedPath = unclaimedSrc || "unclaimed.json";
  let taskids: string[];

  try {
    taskids = JSON.parse(readFileSync(unclaimedPath, "utf8"));
  } catch (e) {
    console.error(`Unable to parse ${unclaimedSrc}`);
    process.exit(1);
  }

  initializeLogger(null);
  await initializeBlockchain();

  for (let taskid of taskids) {
    log.debug(`Attempting to claim ${taskid}`);

    try {
      const tx = await expretry(async () => await arbius.claimSolution(taskid));
      const receipt = await tx.wait();
      log.info(`Claimed ${taskid} in ${receipt.transactionHash}`);
    } catch (e) {
      log.error(`Error claiming task ${taskid}:`, e);
      // Optionally, you can choose to continue or stop execution based on the error
      // For example, to stop execution:
      // process.exit(1);
    }

    // Add a delay between each claim transaction to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for 1 second (adjust as needed)
  }
}

if (process.argv.length < 3) {
  log.error("Usage: yarn bulk:claim MiningConfig.json [unclaimed.json]");
  process.exit(1);
}

main(process.argv[2], process.argv[3]);