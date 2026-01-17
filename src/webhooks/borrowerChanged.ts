import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHBorrowerChanged } from "../../generated/schema";

export function createWHBorrowerChanged(params: WHBorrowerChangedParams): void {
  let whBorrowerChanged = new WHBorrowerChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whBorrowerChanged.poolId = params.poolId;
  whBorrowerChanged.oldBorrower = params.oldBorrower;
  whBorrowerChanged.newBorrower = params.newBorrower;
  whBorrowerChanged.contractAddress = params.contractAddress;
  whBorrowerChanged.contractName = params.contractName;
  whBorrowerChanged.blockNumber = params.block.number;
  whBorrowerChanged.blockTimestamp = params.block.timestamp;
  whBorrowerChanged.transactionHash = params.transactionHash;
  whBorrowerChanged.save();
}

export class WHBorrowerChangedParams {
  poolId: BigInt;
  oldBorrower: Address;
  newBorrower: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}