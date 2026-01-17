import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHWriteoff } from "../../generated/schema";

export function createWHWriteoff(params: WHWriteoffParams): void {
  let whWriteoff = new WHWriteoff(params.transactionHash.concatI32(params.logIndex.toI32()));
  whWriteoff.poolId = params.poolId;
  whWriteoff.writeoffAmount = params.writeoffAmount;
  whWriteoff.writeoffTime = params.writeoffTime;
  whWriteoff.contractAddress = params.contractAddress;
  whWriteoff.contractName = params.contractName;
  whWriteoff.blockNumber = params.block.number;
  whWriteoff.blockTimestamp = params.block.timestamp;
  whWriteoff.transactionHash = params.transactionHash;
  whWriteoff.save();
}

export class WHWriteoffParams {
  poolId: BigInt;
  writeoffAmount: BigInt;
  writeoffTime: BigInt;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}