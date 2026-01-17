import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHTimelockVaultManagerChanged } from "../../generated/schema";

export function createWHTimelockVaultManagerChanged(params: WHTimelockVaultManagerChangedParams): void {
  let whTimelockVaultManagerChanged = new WHTimelockVaultManagerChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whTimelockVaultManagerChanged.oldManager = params.oldManager;
  whTimelockVaultManagerChanged.newManager = params.newManager;
  whTimelockVaultManagerChanged.contractAddress = params.contractAddress;
  whTimelockVaultManagerChanged.contractName = params.contractName;
  whTimelockVaultManagerChanged.blockNumber = params.block.number;
  whTimelockVaultManagerChanged.blockTimestamp = params.block.timestamp;
  whTimelockVaultManagerChanged.transactionHash = params.transactionHash;
  whTimelockVaultManagerChanged.save();
}

export class WHTimelockVaultManagerChangedParams {
  oldManager: Address;
  newManager: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}