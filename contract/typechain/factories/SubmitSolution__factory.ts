/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  SubmitSolution,
  SubmitSolutionInterface,
} from "../SubmitSolution";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IArbius",
        name: "_arbius",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_commitment",
        type: "bytes32",
      },
    ],
    name: "signalCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskid",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_cid",
        type: "bytes",
      },
    ],
    name: "submitSolution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161033538038061033583398101604081905261002f91610054565b600080546001600160a01b0319166001600160a01b0392909216919091179055610084565b60006020828403121561006657600080fd5b81516001600160a01b038116811461007d57600080fd5b9392505050565b6102a2806100936000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063506ea7de1461003b57806356914caf14610050575b600080fd5b61004e61004936600461012c565b610063565b005b61004e61005e36600461015b565b6100c4565b60005460405163283753ef60e11b8152600481018390526001600160a01b039091169063506ea7de90602401600060405180830381600087803b1580156100a957600080fd5b505af11580156100bd573d6000803e3d6000fd5b5050505050565b6000546040516356914caf60e01b81526001600160a01b03909116906356914caf906100f69085908590600401610216565b600060405180830381600087803b15801561011057600080fd5b505af1158015610124573d6000803e3d6000fd5b505050505050565b60006020828403121561013e57600080fd5b5035919050565b634e487b7160e01b600052604160045260246000fd5b6000806040838503121561016e57600080fd5b82359150602083013567ffffffffffffffff8082111561018d57600080fd5b818501915085601f8301126101a157600080fd5b8135818111156101b3576101b3610145565b604051601f8201601f19908116603f011681019083821181831017156101db576101db610145565b816040528281528860208487010111156101f457600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b82815260006020604081840152835180604085015260005b8181101561024a5785810183015185820160600152820161022e565b506000606082860101526060601f19601f83011685010192505050939250505056fea26469706673582212209a1a0ad63d776b5d3817d8f94e9d74818f2a2127b196a0867915530a1fed1bae64736f6c63430008130033";

type SubmitSolutionConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SubmitSolutionConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SubmitSolution__factory extends ContractFactory {
  constructor(...args: SubmitSolutionConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _arbius: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SubmitSolution> {
    return super.deploy(_arbius, overrides || {}) as Promise<SubmitSolution>;
  }
  getDeployTransaction(
    _arbius: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_arbius, overrides || {});
  }
  attach(address: string): SubmitSolution {
    return super.attach(address) as SubmitSolution;
  }
  connect(signer: Signer): SubmitSolution__factory {
    return super.connect(signer) as SubmitSolution__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SubmitSolutionInterface {
    return new utils.Interface(_abi) as SubmitSolutionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SubmitSolution {
    return new Contract(address, _abi, signerOrProvider) as SubmitSolution;
  }
}
