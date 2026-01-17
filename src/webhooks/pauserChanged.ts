import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHPauserChanged } from "../../generated/schema";

export function createWHPauserChanged(params: WHPauserChangedParams): void {
  let whPauserChanged = new WHPauserChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whPauserChanged.oldPauser = params.oldPauser;
  whPauserChanged.newPauser = params.newPauser;
  whPauserChanged.contractAddress = params.contractAddress;
  whPauserChanged.contractName = params.contractName;
  whPauserChanged.blockNumber = params.block.number;
  whPauserChanged.blockTimestamp = params.block.timestamp;
  whPauserChanged.transactionHash = params.transactionHash;
  whPauserChanged.save();
}

export class WHPauserChangedParams {
  oldPauser: Address;
  newPauser: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}