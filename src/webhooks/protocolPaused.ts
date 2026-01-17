import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHProtocolPausedUnpaused } from "../../generated/schema";

export function createWHProtocolPausedUnpaused(params: WHProtocolPausedUnpausedParams): void {
  let whProtocolPausedUnpaused = new WHProtocolPausedUnpaused(params.transactionHash.concatI32(params.logIndex.toI32()));
  whProtocolPausedUnpaused.protocolPaused = params.protocolPaused;
  whProtocolPausedUnpaused.pausedBy = params.pausedBy;
  whProtocolPausedUnpaused.contractAddress = params.contractAddress;
  whProtocolPausedUnpaused.contractName = params.contractName;
  whProtocolPausedUnpaused.blockNumber = params.block.number;
  whProtocolPausedUnpaused.blockTimestamp = params.block.timestamp;
  whProtocolPausedUnpaused.transactionHash = params.transactionHash;
  whProtocolPausedUnpaused.save();
}

export class WHProtocolPausedUnpausedParams {
  protocolPaused: boolean;
  pausedBy: Address;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}