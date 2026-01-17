import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHPoolPausedUnpaused } from "../../generated/schema";
import { getPoolId } from "../util";

export function createWHPoolPausedUnpaused(params: WHPoolPausedUnpausedParams): void {
  let whPoolPausedUnpaused = new WHPoolPausedUnpaused(params.transactionHash.concatI32(params.logIndex.toI32()));
  whPoolPausedUnpaused.poolId = params.poolId;
  whPoolPausedUnpaused.pool = getPoolId(params.poolId);
  whPoolPausedUnpaused.pausedBy = params.pausedBy;
  whPoolPausedUnpaused.isPaused = params.isPaused;
  whPoolPausedUnpaused.contractAddress = params.contractAddress;
  whPoolPausedUnpaused.contractName = params.contractName;
  whPoolPausedUnpaused.blockNumber = params.block.number;
  whPoolPausedUnpaused.blockTimestamp = params.block.timestamp;
  whPoolPausedUnpaused.transactionHash = params.transactionHash;
  whPoolPausedUnpaused.save();
}

export class WHPoolPausedUnpausedParams {
  poolId: BigInt;
  pausedBy: Address;
  isPaused: boolean;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}