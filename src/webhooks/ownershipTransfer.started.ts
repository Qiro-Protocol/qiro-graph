import { Address, Bytes, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { WHOwnershipTransferStarted } from "../../generated/schema";

export function createWHOwnershipTransferStarted(params: WHOwnershipTransferStartedParams): void {
  let whOwnershipTransferStarted = new WHOwnershipTransferStarted(params.transactionHash.concatI32(params.logIndex.toI32()));
  whOwnershipTransferStarted.currentOwner = params.currentOwner;
  whOwnershipTransferStarted.proposedOwner = params.proposedOwner;
  whOwnershipTransferStarted.roleName = params.roleName;
  whOwnershipTransferStarted.contractAddress = params.contractAddress;
  whOwnershipTransferStarted.contractName = params.contractName;
  whOwnershipTransferStarted.blockNumber = params.block.number;
  whOwnershipTransferStarted.blockTimestamp = params.block.timestamp;
  whOwnershipTransferStarted.transactionHash = params.transactionHash;
  whOwnershipTransferStarted.save();
}

export class WHOwnershipTransferStartedParams {
  currentOwner: Address;
  proposedOwner: Address;
  roleName: string;
  contractAddress: Bytes
  contractName: string
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}