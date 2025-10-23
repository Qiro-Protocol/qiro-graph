import { Address, Bytes, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { WHOwnershipTransferComplete } from "../../generated/schema";

export function createWHOwnershipTransferComplete(params: WHOwnershipTransferCompleteParams): void {
  let whOwnershipTransferComplete = new WHOwnershipTransferComplete(params.transactionHash.concatI32(params.logIndex.toI32()));
  whOwnershipTransferComplete.previousOwner = params.previousOwner;
  whOwnershipTransferComplete.newOwner = params.newOwner;
  whOwnershipTransferComplete.roleName = params.roleName;
  whOwnershipTransferComplete.contractAddress = params.contractAddress;
  whOwnershipTransferComplete.contractName = params.contractName;
  whOwnershipTransferComplete.blockNumber = params.block.number;
  whOwnershipTransferComplete.blockTimestamp = params.block.timestamp;
  whOwnershipTransferComplete.transactionHash = params.transactionHash;
  whOwnershipTransferComplete.save();
}

export class WHOwnershipTransferCompleteParams {
  previousOwner: Address;
  newOwner: Address;
  roleName: string;
  contractAddress: Bytes
  contractName: string
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}