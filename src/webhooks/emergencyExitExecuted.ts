import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHEmergencyExitExecuted } from "../../generated/schema";

export function createWHEmergencyExitExecuted(params: WHEmergencyExitExecutedParams): void {
  let whEmergencyExitExecuted = new WHEmergencyExitExecuted(params.transactionHash.concatI32(params.logIndex.toI32()));
  whEmergencyExitExecuted.poolIds = params.poolIds;
  whEmergencyExitExecuted.contractAddress = params.contractAddress;
  whEmergencyExitExecuted.contractName = params.contractName;
  whEmergencyExitExecuted.blockNumber = params.block.number;
  whEmergencyExitExecuted.blockTimestamp = params.block.timestamp;
  whEmergencyExitExecuted.transactionHash = params.transactionHash;
  whEmergencyExitExecuted.save();
}

export class WHEmergencyExitExecutedParams {
  poolIds: BigInt[];
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}