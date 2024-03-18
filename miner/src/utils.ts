import { ethers, BigNumber } from 'ethers';
import { log } from './log';

/**
 * Sleeps for the specified number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets the current timestamp in seconds.
 * @returns The current timestamp in seconds.
 */
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Converts a task ID to a seed value.
 * @param taskid The task ID as a string.
 * @returns The seed value derived from the task ID.
 */
export function taskid2Seed(taskid: string): number {
  const m = BigNumber.from('0x1FFFFFFFFFFFF0');
  return BigNumber.from(taskid).mod(m).toNumber();
}

/**
 * Retries a promise with exponential backoff.
 * @param fn The function that returns a promise to retry.
 * @param tries The maximum number of retry attempts (default: 10).
 * @param base The base delay in seconds for exponential backoff (default: 1.5).
 * @param maxDelay The maximum delay in seconds (default: 60).
 * @returns A promise that resolves to the value returned by the function or null if all retries fail.
 */
export async function expretry<T>(
  fn: () => Promise<T>,
  tries: number = 10,
  base: number = 1.5,
  maxDelay: number = 60,
): Promise<T | null> {
  for (let retry = 0; retry < tries; ++retry) {
    try {
      return await fn();
    } catch (e) {
      const seconds = Math.min(base ** retry, maxDelay);
      log.warn(`Retry request failed, retrying in ${seconds} seconds`);
      log.debug(JSON.stringify(e));
      await sleep(1000 * seconds);
    }
  }
  log.error(`Retry request failed ${tries} times`);
  return null;
}

/**
 * Generates a commitment hash from the provided address, task ID, and CID.
 * @param address The Ethereum address as a hex string.
 * @param taskid The task ID as a hex string.
 * @param cid The CID as a hex string.
 * @returns The commitment hash as a hex string.
 */
export function generateCommitment(address: string, taskid: string, cid: string): string {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'bytes32', 'bytes'],
      [address, taskid, cid],
    ),
  );
}