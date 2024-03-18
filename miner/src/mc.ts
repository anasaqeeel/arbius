import { MiningConfig } from './types';

let c: MiningConfig;

export function initializeMiningConfig(data: MiningConfig) {
  c = {
    ...data,
    cache_path: data.cache_path || 'cache',
    read_only: data.read_only || false,
    prob: {
      task: data.prob?.task || 0.01,
      contestation_vote_finish: data.prob?.contestation_vote_finish || 0.2,
      contestation_submitted: data.prob?.contestation_submitted || 1.0,
      solution_submitted: data.prob?.solution_submitted || 0.01,
      task_retracted: data.prob?.task_retracted || 1,
    },
  };

  // Type assertion to ensure `c` matches the `MiningConfig` type
  c = c as MiningConfig;
}

export { c };