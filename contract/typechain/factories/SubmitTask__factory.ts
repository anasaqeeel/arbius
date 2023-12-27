/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  Overrides,
  BytesLike,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SubmitTask, SubmitTaskInterface } from "../SubmitTask";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IArbius",
        name: "_arbius",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "_arbiusToken",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_model",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_input",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "submitTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161058538038061058583398101604081905261002f916100a8565b600080546001600160a01b038087166001600160a01b031992831617909255600180549286169290911691909117905560028290556003610070828261022b565b50505050506102ea565b6001600160a01b038116811461008f57600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b600080600080608085870312156100be57600080fd5b84516100c98161007a565b809450506020808601516100dc8161007a565b6040870151606088015191955093506001600160401b038082111561010057600080fd5b818801915088601f83011261011457600080fd5b81518181111561012657610126610092565b604051601f8201601f19908116603f0116810190838211818310171561014e5761014e610092565b816040528281528b8684870101111561016657600080fd5b600093505b82841015610188578484018601518185018701529285019261016b565b600086848301015280965050505050505092959194509250565b600181811c908216806101b657607f821691505b6020821081036101d657634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561022657600081815260208120601f850160051c810160208610156102035750805b601f850160051c820191505b818110156102225782815560010161020f565b5050505b505050565b81516001600160401b0381111561024457610244610092565b6102588161025284546101a2565b846101dc565b602080601f83116001811461028d57600084156102755750858301515b600019600386901b1c1916600185901b178555610222565b600085815260208120601f198616915b828110156102bc5788860151825594840194600190910190840161029d565b50858210156102da5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61028c806102f96000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80634abbef9b14610030575b600080fd5b61003861003a565b005b60015460005460405163095ea7b360e01b81526001600160a01b039182166004820152600019602482015291169063095ea7b3906044016020604051808303816000875af1158015610090573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100b4919061013f565b50600080546002546040516308745dd160e01b81526001600160a01b03909216916308745dd1916100f8918591309167016345785d8a000090600390600401610168565b6020604051808303816000875af1158015610117573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013b919061023d565b5050565b60006020828403121561015157600080fd5b8151801515811461016157600080fd5b9392505050565b60ff861681526000602060018060a01b0387168184015285604084015284606084015260a060808401526000845481600182811c9150808316806101ad57607f831692505b85831081036101ca57634e487b7160e01b85526022600452602485fd5b60a0880183905260c088018180156101e957600181146101ff5761022a565b60ff198616825284151560051b8201965061022a565b60008b81526020902060005b868110156102245781548482015290850190890161020b565b83019750505b50949d9c50505050505050505050505050565b60006020828403121561024f57600080fd5b505191905056fea2646970667358221220a720484574667abf74ea4e96829b406ade69ed79a06cd2fc05e433604cad8e3364736f6c63430008130033";

type SubmitTaskConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SubmitTaskConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SubmitTask__factory extends ContractFactory {
  constructor(...args: SubmitTaskConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _arbius: string,
    _arbiusToken: string,
    _model: BytesLike,
    _input: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SubmitTask> {
    return super.deploy(
      _arbius,
      _arbiusToken,
      _model,
      _input,
      overrides || {}
    ) as Promise<SubmitTask>;
  }
  getDeployTransaction(
    _arbius: string,
    _arbiusToken: string,
    _model: BytesLike,
    _input: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _arbius,
      _arbiusToken,
      _model,
      _input,
      overrides || {}
    );
  }
  attach(address: string): SubmitTask {
    return super.attach(address) as SubmitTask;
  }
  connect(signer: Signer): SubmitTask__factory {
    return super.connect(signer) as SubmitTask__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SubmitTaskInterface {
    return new utils.Interface(_abi) as SubmitTaskInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SubmitTask {
    return new Contract(address, _abi, signerOrProvider) as SubmitTask;
  }
}
