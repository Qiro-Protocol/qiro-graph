import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHSetCreatePoolAccess } from "../../generated/schema";

export function createWHSetCreatePoolAccess(params: WHSetCreatePoolAccessParams): void {
  let whSetCreatePoolAccess = new WHSetCreatePoolAccess(params.transactionHash.concatI32(params.logIndex.toI32()));
  whSetCreatePoolAccess.address = params.address;
  whSetCreatePoolAccess.canCreatePool = params.canCreatePool;
  whSetCreatePoolAccess.manager = params.manager;
  whSetCreatePoolAccess.contractAddress = params.contractAddress;
  whSetCreatePoolAccess.contractName = params.contractName;
  whSetCreatePoolAccess.blockNumber = params.block.number;
  whSetCreatePoolAccess.blockTimestamp = params.block.timestamp;
  whSetCreatePoolAccess.transactionHash = params.transactionHash;
  whSetCreatePoolAccess.save();
}

export class WHSetCreatePoolAccessParams {
  address: Address;
  canCreatePool: boolean;
  manager: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}