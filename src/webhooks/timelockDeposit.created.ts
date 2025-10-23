import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHTimelockDepositCreated } from "../../generated/schema";

export function getDepositIdBytes(depositId: BigInt): Bytes {
  return Bytes.fromByteArray(Bytes.fromBigInt(depositId));
}

export function createWHTimelockDepositCreated(params: WHTimelockDepositCreatedParams): void {
  let whTimelockDepositCreated = new WHTimelockDepositCreated(getDepositIdBytes(params.depositId));
  whTimelockDepositCreated.currency = params.currency;
  whTimelockDepositCreated.amount = params.amount;
  whTimelockDepositCreated.poolId = params.poolId;
  whTimelockDepositCreated.unlockAt = params.unlockAt;
  whTimelockDepositCreated.depositId = params.depositId;
  whTimelockDepositCreated.depositor = params.depositor;
  whTimelockDepositCreated.contractAddress = params.contractAddress;
  whTimelockDepositCreated.contractName = params.contractName;
  whTimelockDepositCreated.blockNumber = params.block.number;
  whTimelockDepositCreated.blockTimestamp = params.block.timestamp;
  whTimelockDepositCreated.transactionHash = params.transactionHash;
  whTimelockDepositCreated.save();
}

export class WHTimelockDepositCreatedParams {
  currency: Address;
  amount: BigInt;
  poolId: BigInt;
  unlockAt: BigInt;
  depositId: BigInt;
  depositor: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}