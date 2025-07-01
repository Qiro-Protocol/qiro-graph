import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";
import { crypto } from "@graphprotocol/graph-ts";

export function getPoolId(poolId: BigInt): Bytes {
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
}

export namespace PoolStatus {
  export const CAPITAL_FORMATION = "CAPITAL_FORMATION";
  export const PENDING = "PENDING";
  export const ACTIVE = "ACTIVE";
  export const REVOKED = "REVOKED";
  export const PARTIAL_REDEEM = "PARTIAL_REDEEM";
  export const REDEEM = "REDEEM";
  export const ENDED = "ENDED";
}

export namespace TrancheType {
  export const JUNIOR = "JUNIOR";
  export const SENIOR = "SENIOR";
}

export namespace SupplyRedeemActionType {
  export const SUPPLY = "SUPPLY";
  export const REDEEM = "REDEEM";
}

export namespace PoolType {
  export const LOAN = "LOAN";
  export const SECURITISATION = "SECURITISATION";
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

export const ONE = BigInt.fromI32(10).pow(27) as BigInt; // 1e27