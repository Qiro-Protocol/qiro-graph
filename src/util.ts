import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { crypto } from "@graphprotocol/graph-ts";

// create if not present
export function getUser(address: Bytes): User {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.address = address;
    user.transactionHistory = [];
    user.isBorrower = false;
    user.isLender = false;
    user.totalLended = new BigInt(0);
    user.totalBorrowed = new BigInt(0);
    user.totalRepayed = new BigInt(0);
    user.totalRedeemed = new BigInt(0);
    user.save();
  }
  return user;
}

export function getPoolId(poolId: BigInt): Bytes {
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
}

export enum PoolStatus {
  CAPITAL_FORMATION = "CAPITAL_FORMATION",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
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