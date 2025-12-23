import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHMinterUpdated } from "../../generated/schema";

export function createWHMinterUpdated(params: WHMinterUpdatedParams): void {
  let entity = new WHMinterUpdated(
    params.transactionHash.concatI32(params.logIndex.toI32())
  );
  entity.minter = params.minter;
  entity.isMinter = params.isMinter;
  entity.contractAddress = params.contractAddress;
  entity.contractName = params.contractName;
  entity.blockNumber = params.block.number;
  entity.blockTimestamp = params.block.timestamp;
  entity.transactionHash = params.transactionHash;
  entity.save();
}

export class WHMinterUpdatedParams {
  minter: Address;
  isMinter: boolean;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}
