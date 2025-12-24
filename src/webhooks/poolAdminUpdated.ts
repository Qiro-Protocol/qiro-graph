import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHPoolAdminUpdated } from "../../generated/schema";

export function createWHPoolAdminUpdated(
  params: WHPoolAdminUpdatedParams
): void {
  let entity = new WHPoolAdminUpdated(
    params.transactionHash.concatI32(params.logIndex.toI32())
  );
  entity.admin = params.admin;
  entity.isAdmin = params.isAdmin;
  entity.contractAddress = params.contractAddress;
  entity.contractName = params.contractName;
  entity.blockNumber = params.block.number;
  entity.blockTimestamp = params.block.timestamp;
  entity.transactionHash = params.transactionHash;
  entity.save();
}

export class WHPoolAdminUpdatedParams {
  admin: Address;
  isAdmin: boolean;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}
