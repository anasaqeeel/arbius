import { MiningConfig } from './types';
import Replicate from 'replicate';

let replicate: Replicate;

export function initializeML(c: MiningConfig) {
  if (!c.ml?.replicate?.api_token) {
    throw new Error('Missing or invalid Replicate API token in the mining configuration.');
  }

  replicate = new Replicate({
    auth: c.ml.replicate.api_token,
  });
}

export { replicate };