import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHFundsWithdrawn } from "../../generated/schema";

export function createWHFundsWithdrawn(params: WHFundsWithdrawnParams): void {
  let whFundsWithdrawn = new WHFundsWithdrawn(params.transactionHash.concatI32(params.logIndex.toI32()));
  whFundsWithdrawn.currency = params.currency;
  whFundsWithdrawn.amount = params.amount;
  whFundsWithdrawn.recipient = params.recipient;
  whFundsWithdrawn.withdrawnBy = params.withdrawnBy;
  whFundsWithdrawn.contractAddress = params.contractAddress;
  whFundsWithdrawn.contractName = params.contractName;
  whFundsWithdrawn.blockNumber = params.block.number;
  whFundsWithdrawn.blockTimestamp = params.block.timestamp;
  whFundsWithdrawn.transactionHash = params.transactionHash;
  whFundsWithdrawn.save();
}

export class WHFundsWithdrawnParams {
  currency: Address;
  amount: BigInt;
  recipient: Address;
  withdrawnBy: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}