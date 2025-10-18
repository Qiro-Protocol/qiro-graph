import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WHValueFiledOnContract } from "../../generated/schema";

export function createWHValueFiledOnContract(params: WHValueFiledOnContractParams): void {
  let whValueFiledOnContract = new WHValueFiledOnContract(params.transactionHash.concatI32(params.logIndex.toI32()));
  whValueFiledOnContract.poolId = params.poolId;
  whValueFiledOnContract.poolType = params.poolType;
  whValueFiledOnContract.key = params.fieldName;
  whValueFiledOnContract.value = params.value;
  whValueFiledOnContract.contractAddress = params.contractAddress;
  whValueFiledOnContract.contractName = params.contractName;
  whValueFiledOnContract.blockNumber = params.block.number;
  whValueFiledOnContract.blockTimestamp = params.block.timestamp;
  whValueFiledOnContract.transactionHash = params.transactionHash;
  whValueFiledOnContract.save();
}

export class WHValueFiledOnContractParams {
  poolId: BigInt
  poolType: string
  fieldName: string
  value: BigInt
  contractAddress: Address;
  contractName: string;
  block: ethereum.Block;
  transactionHash: Bytes;
  logIndex: BigInt;
}