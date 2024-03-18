import { BigNumber } from 'ethers';
import { base58 } from '@scure/base';
import { log } from './log';
import Config from './config.json';

import Kandinsky2Template from "./templates/kandinsky2.json"

import { expretry } from './utils';
import { pinFilesToIPFS } from './ipfs';
import {
  MiningConfig,
  Model,
  MiningFilter,
  FilterResult,
  InputHydrationResult,
} from './types';

const default__filters: MiningFilter[] = [];

const default__getfiles = async (
  model: Model,
  taskid: string,
  input: any
): Promise<string[]> => {
  throw new Error(`getfiles unimplemented for task (${taskid}) model ${JSON.stringify(model)}`);
};

const default__getcid = async (
  c: MiningConfig,
  model: Model,
  taskid: string,
  input: any
): Promise<string> => {
  if (c.evilmode) {
    return '0x12206666666666666666666666666666666666666666666666666666666666666666';
  }
  const paths = await expretry(() => model.getfiles(model, taskid, input));
  if (!paths) {
    throw new Error('cannot get paths');
  }
  const cid58 = await expretry(() => pinFilesToIPFS(c, taskid, paths));
  log.debug(`Pinned files to ipfs: ${cid58}`);
  if (!cid58) {
    throw new Error('cannot pin files to retrieve cid');
  }
  const cid = '0x' + Buffer.from(base58.decode(cid58)).toString('hex');
  return cid;
};

export const Kandinsky2Model: Model = {
  id:       Config.models.kandinsky2.id,
  mineable: Config.models.kandinsky2.mineable,
  template: Kandinsky2Template,
  filters:  default__filters,
  getfiles: default__getfiles,
  getcid:   default__getcid,
};

export function getModelById(
  models: Model[],
  modelId: string,
): Model | null {
  return models.find((model) => model.id === modelId) || null;
}

export function checkModelFilter(
  models: Model[],
  params: {
    model: string;
    now: number;
    fee: BigNumber;
    blocktime: BigNumber;
    owner: string;
  },
): FilterResult {
  const model = getModelById(models, params.model);
  if (!model) {
    return {
      modelEnabled: false,
      filterPassed: false,
      modelTemplate: null,
    };
  }

  const filterPassed = model.filters.some((filter) => {
    if (filter.owner && params.owner !== filter.owner) {
      return false;
    }

    if (params.fee.lt(filter.minfee)) {
      return false;
    }

    const timeSinceBlocktime = params.now - params.blocktime.toNumber();
    if (filter.mintime > 0 && timeSinceBlocktime < filter.mintime) {
      return false;
    }

    return true;
  });

  return {
    modelEnabled: true,
    filterPassed,
    modelTemplate: model.template,
  };
}

function validateInputField(
  fieldValue: any,
  fieldTemplate: any,
): [boolean, string] {
  if (fieldTemplate.required && typeof fieldValue === 'undefined') {
    return [false, `input missing required field (${fieldTemplate.variable})`];
  }

  if (typeof fieldValue !== 'undefined') {
    switch (fieldTemplate.type) {
      case 'string':
      case 'string_enum':
        if (typeof fieldValue !== 'string') {
          return [false, `input wrong type (${fieldTemplate.variable})`];
        }
        break;
      case 'int':
      case 'int_enum':
        if (typeof fieldValue !== 'number' || fieldValue !== (fieldValue | 0)) {
          return [false, `input wrong type (${fieldTemplate.variable})`];
        }
        break;
      case 'decimal':
        if (typeof fieldValue !== 'number') {
          return [false, `input wrong type (${fieldTemplate.variable})`];
        }
        break;
    }

    if (['int', 'decimal'].includes(fieldTemplate.type)) {
      if (fieldValue < fieldTemplate.min || fieldValue > fieldTemplate.max) {
        return [false, `input out of bounds (${fieldTemplate.variable})`];
      }
    }

    if (['string_enum', 'int_enum'].includes(fieldTemplate.type)) {
      if (!fieldTemplate.choices.includes(fieldValue)) {
        return [false, `input not in enum (${fieldTemplate.variable})`];
      }
    }
  }

  return [true, ''];
}

export function hydrateInput(
  preprocessedInput: any,
  template: any,
): InputHydrationResult {
  const input: any = {};

  for (const fieldTemplate of template.input) {
    const fieldValue = preprocessedInput[fieldTemplate.variable];

    const [isValid, errorMessage] = validateInputField(fieldValue, fieldTemplate);
    if (!isValid) {
      return {
        input,
        err: true,
        errmsg: errorMessage,
      };
    }

    input[fieldTemplate.variable] = fieldValue ?? fieldTemplate.default;
  }

  return {
    input,
    err: false,
    errmsg: '',
  };
}