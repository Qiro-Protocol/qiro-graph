import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHTimelockVaultDelayChanged } from "../../generated/schema";

export function createWHTimelockVaultDelayChanged(params: WHTimelockVaultDelayChangedParams): void {
  let whTimelockVaultDelayChanged = new WHTimelockVaultDelayChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whTimelockVaultDelayChanged.oldDelay = params.oldDelay;
  whTimelockVaultDelayChanged.newDelay = params.newDelay;
  whTimelockVaultDelayChanged.contractAddress = params.contractAddress;
  whTimelockVaultDelayChanged.contractName = params.contractName;
  whTimelockVaultDelayChanged.blockNumber = params.block.number;
  whTimelockVaultDelayChanged.blockTimestamp = params.block.timestamp;
  whTimelockVaultDelayChanged.transactionHash = params.transactionHash;
  whTimelockVaultDelayChanged.save();
}

export class WHTimelockVaultDelayChangedParams {
  oldDelay: BigInt; // uint256
  newDelay: BigInt; // uint256
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}