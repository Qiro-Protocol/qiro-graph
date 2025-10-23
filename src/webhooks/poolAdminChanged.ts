import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHPoolAdminChanged } from "../../generated/schema";

export function createWHPoolAdminChanged(params: WHPoolAdminChangedParams): void {
  let whPoolAdminChanged = new WHPoolAdminChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whPoolAdminChanged.poolId = params.poolId;
  whPoolAdminChanged.oldAdmin = params.oldAdmin;
  whPoolAdminChanged.newAdmin = params.newAdmin;
  whPoolAdminChanged.contractAddress = params.contractAddress;
  whPoolAdminChanged.contractName = params.contractName;
  whPoolAdminChanged.blockNumber = params.block.number;
  whPoolAdminChanged.blockTimestamp = params.block.timestamp;
  whPoolAdminChanged.transactionHash = params.transactionHash;
  whPoolAdminChanged.save();
}

export class WHPoolAdminChangedParams {
  poolId: BigInt;
  oldAdmin: Address;
  newAdmin: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}