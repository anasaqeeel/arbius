/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IL2GatewayRouter,
  IL2GatewayRouterInterface,
} from "../IL2GatewayRouter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_gateway",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_maxGas",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_gasPriceBid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxSubmissionCost",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_creditBackAddress",
        type: "address",
      },
    ],
    name: "setGateway",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

export class IL2GatewayRouter__factory {
  static readonly abi = _abi;
  static createInterface(): IL2GatewayRouterInterface {
    return new utils.Interface(_abi) as IL2GatewayRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IL2GatewayRouter {
    return new Contract(address, _abi, signerOrProvider) as IL2GatewayRouter;
  }
}
