import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";
import { crypto } from "@graphprotocol/graph-ts";

export function getPoolId(poolId: BigInt): Bytes {
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
}

export enum PoolStatus {
  CAPITAL_FORMATION = "CAPITAL_FORMATION",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
  PARTIAL_REDEEM = "PARTIAL_REDEEM",
  REDEEM = "REDEEM",
  ENDED = "ENDED",
}

export enum TrancheType {
  JUNIOR = "JUNIOR",
  SENIOR = "SENIOR"
}

export enum SupplyRedeemActionType {
  SUPPLY = "SUPPLY",
  REDEEM = "REDEEM",
}

export enum PoolType {
  LOAN = "LOAN",
  SECURITISATION = "SECURITISATION"
}

export function getPoolStatusString(state: BigInt): string {
  if (state == BigInt.fromI32(0)) {
    return PoolStatus.CAPITAL_FORMATION;
  } else if (state == BigInt.fromI32(1)) {
    return PoolStatus.PENDING;
  } else if (state == BigInt.fromI32(2)) {
    return PoolStatus.ACTIVE;
  } else if (state == BigInt.fromI32(3)) {
    return PoolStatus.REVOKED;
  } else if (state == BigInt.fromI32(4)) {
    return PoolStatus.PARTIAL_REDEEM;
  } else if (state == BigInt.fromI32(5)) {
    return PoolStatus.REDEEM;
  } else if (state == BigInt.fromI32(6)) {
    return PoolStatus.ENDED;
  }
  return "UNKNOWN";
}

export function getPoolTypeString(poolType: number): string {
  if (poolType == 0) {
    return PoolType.LOAN
  } else if (poolType == 1) {
    return PoolType.SECURITISATION;
  }
  return "UNKNOWN";
}