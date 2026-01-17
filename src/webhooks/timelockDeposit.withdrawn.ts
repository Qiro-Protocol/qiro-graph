import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHTimelockDepositWithdrawn } from "../../generated/schema";

export function createWHTimelockDepositWithdrawn(params: WHTimelockDepositWithdrawnParams): void {
  let whTimelockDepositWithdrawn = new WHTimelockDepositWithdrawn(params.transactionHash.concatI32(params.logIndex.toI32()));
  whTimelockDepositWithdrawn.depositId = params.depositId;
  whTimelockDepositWithdrawn.amount = params.amount;
  whTimelockDepositWithdrawn.contractAddress = params.contractAddress;
  whTimelockDepositWithdrawn.contractName = params.contractName;
  whTimelockDepositWithdrawn.blockNumber = params.block.number;
  whTimelockDepositWithdrawn.blockTimestamp = params.block.timestamp;
  whTimelockDepositWithdrawn.transactionHash = params.transactionHash;
  whTimelockDepositWithdrawn.save();
}

export class WHTimelockDepositWithdrawnParams {
  depositId: BigInt;
  amount: BigInt;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}