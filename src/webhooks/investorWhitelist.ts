import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { WHInvestorWhitelisted } from "../../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";

export function createWHInvestorWhitelistedOrRevoked(params: WHInvestorWhitelistedParams): void {
  let whInvestorWhitelisted = new WHInvestorWhitelisted(params.transactionHash.concatI32(params.logIndex.toI32()));
  whInvestorWhitelisted.investor = params.investor;
  whInvestorWhitelisted.trancheName = params.trancheName;
  whInvestorWhitelisted.level = params.level;
  whInvestorWhitelisted.whitelisted = params.whitelisted;
  whInvestorWhitelisted.poolId = params.poolId;
  whInvestorWhitelisted.contractAddress = params.contractAddress;
  whInvestorWhitelisted.contractName = params.contractName;
  whInvestorWhitelisted.blockNumber = params.block.number;
  whInvestorWhitelisted.blockTimestamp = params.block.timestamp;
  whInvestorWhitelisted.transactionHash = params.transactionHash;
  whInvestorWhitelisted.save();
}

export class WHInvestorWhitelistedParams {
  investor: Address;
  trancheName: string;
  level: string;
  whitelisted: boolean;
  poolId: BigInt;
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}