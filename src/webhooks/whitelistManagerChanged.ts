import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHWhitelistManagerChanged } from "../../generated/schema";

export function createWHWhitelistManagerChanged(params: WHWhitelistManagerChangedParams): void {
  let whWhitelistManagerChanged = new WHWhitelistManagerChanged(params.transactionHash.concatI32(params.logIndex.toI32()));
  whWhitelistManagerChanged.oldWhitelistManager = params.oldWhitelistManager;
  whWhitelistManagerChanged.newWhitelistManager = params.newWhitelistManager;
  whWhitelistManagerChanged.contractAddress = params.contractAddress;
  whWhitelistManagerChanged.contractName = params.contractName;
  whWhitelistManagerChanged.blockNumber = params.block.number;
  whWhitelistManagerChanged.blockTimestamp = params.block.timestamp;
  whWhitelistManagerChanged.transactionHash = params.transactionHash;
  whWhitelistManagerChanged.save();
}

export class WHWhitelistManagerChangedParams {
  oldWhitelistManager: Address;
  newWhitelistManager: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}