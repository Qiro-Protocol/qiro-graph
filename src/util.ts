import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";

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
    user.totalInterestEarned = new BigInt(0);
    user.save();
  }
  return user;
}
