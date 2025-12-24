import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHMetadataManagerUpdated } from "../../generated/schema";

export function createWHMetadataManagerUpdated(
  params: WHMetadataManagerUpdatedParams
): void {
  let entity = new WHMetadataManagerUpdated(
    params.transactionHash.concatI32(params.logIndex.toI32())
  );
  entity.tokenId = params.tokenId;
  entity.manager = params.manager;
  entity.contractAddress = params.contractAddress;
  entity.contractName = params.contractName;
  entity.blockNumber = params.block.number;
  entity.blockTimestamp = params.block.timestamp;
  entity.transactionHash = params.transactionHash;
  entity.save();
}

export class WHMetadataManagerUpdatedParams {
  tokenId: BigInt;
  manager: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}
