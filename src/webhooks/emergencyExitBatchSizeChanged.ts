import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHEmergencyExitBatchSizeChanged } from "../../generated/schema";

export function createWHEmergencyExitBatchSizeChanged(params: WHEmergencyExitBatchSizeChangedParams): void {
  let whEmergencyExitBatchSizeChanged = new WHEmergencyExitBatchSizeChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whEmergencyExitBatchSizeChanged.oldBatchSize = params.oldBatchSize;
  whEmergencyExitBatchSizeChanged.newBatchSize = params.newBatchSize;
  whEmergencyExitBatchSizeChanged.contractAddress = params.contractAddress;
  whEmergencyExitBatchSizeChanged.contractName = params.contractName;
  whEmergencyExitBatchSizeChanged.blockNumber = params.block.number;
  whEmergencyExitBatchSizeChanged.blockTimestamp = params.block.timestamp;
  whEmergencyExitBatchSizeChanged.transactionHash = params.transactionHash;
  whEmergencyExitBatchSizeChanged.save();
}

export class WHEmergencyExitBatchSizeChangedParams {
  oldBatchSize: BigInt;
  newBatchSize: BigInt;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}