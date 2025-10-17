import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHOriginatorFeePaid } from "../../generated/schema";

export function createWHOriginatorFeePaid(params: WHOriginatorFeePaidParams): void {
  let whOriginatorFeePaid = new WHOriginatorFeePaid(params.transactionHash.concatI32(params.logIndex.toI32()));
  whOriginatorFeePaid.poolId = params.poolId;
  whOriginatorFeePaid.amount = params.amount;
  whOriginatorFeePaid.feeRateBps = params.feeRateBps;
  whOriginatorFeePaid.principalAmount = params.principalAmount;
  whOriginatorFeePaid.contractAddress = params.contractAddress;
  whOriginatorFeePaid.contractName = params.contractName;
  whOriginatorFeePaid.blockNumber = params.block.number;
  whOriginatorFeePaid.blockTimestamp = params.block.timestamp;
  whOriginatorFeePaid.transactionHash = params.transactionHash;
  whOriginatorFeePaid.save();
}

export class WHOriginatorFeePaidParams {
  poolId: BigInt;
  amount: BigInt;
  feeRateBps: BigInt;
  principalAmount: BigInt;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}