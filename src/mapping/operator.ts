import {
  Supply as SupplyEvent,
  Redeem as RedeemEvent,
} from "../../generated/templates/Operator/WhitelistOperator";

import { Supply, Redeem, Pool, Tranche, User } from "../../generated/schema";
import { BigInt, bigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import { crypto, store } from "@graphprotocol/graph-ts";
import { createTxnAndUpdateUser } from "../qiro-factory";

export function handleSupply(event: SupplyEvent): void {
  let entity = new Supply(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.supplier = event.params.supplier;
  entity.currencyAmount = event.params.amount;
  entity.totalPoolBalance = event.params.totalPoolBalance;
  entity.juniorPoolBalance = event.params.juniorPoolBalance;
  entity.seniorPoolBalance = event.params.seniorPoolBalance;
  entity.poolId = event.params.poolId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.save();

  updatePoolBalance(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );
  let type =
    event.params.tranche == "senior" ? "SENIOR_DEPOSIT" : "JUNIOR_DEPOSIT";
  createTxnAndUpdateUser(
    type,
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.amount
  );

  let user = User.load(event.transaction.from);
  user!.isLender = true;
  if (user!.poolsBorrowedFromIDs.includes(event.params.poolId)) {
    let pID = Bytes.fromByteArray(
      crypto.keccak256(ByteArray.fromBigInt(event.params.poolId))
    );

    user!.poolsBorrowedFromIDs.push(event.params.poolId);
    user!.poolsBorrowedFrom.push(pID);
  }
  user!.totalLended = user!.totalLended.plus(event.params.amount);
  user!.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let entity = new Redeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tranche = event.params.tranche;
  entity.receiver = event.params.receiver;
  entity.tokenAmount = event.params.tokenAmount;
  entity.currencyAmount = event.params.currencyAmount;
  entity.totalPoolBalance = event.params.totalPoolBalance;
  entity.juniorPoolBalance = event.params.juniorPoolBalance;
  entity.seniorPoolBalance = event.params.seniorPoolBalance;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.poolId = event.params.poolId;
  entity.save();

  updatePoolBalance(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );

  createTxnAndUpdateUser(
    event.params.tranche == "senior" ? "SENIOR_REDEEM" : "JUNIOR_REDEEM",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.currencyAmount
  );

  let user = User.load(event.transaction.from);
  user!.totalLended = user!.totalLended.minus(event.params.currencyAmount);
  user!.save();
}

function updatePoolBalance(
  poolId: BigInt,
  total: BigInt,
  junior: BigInt,
  senior: BigInt
): void {
  // todo - update pool entity
  let pID = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
  let pool = Pool.load(pID);
  if (pool == null) {
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  pool.totalBalance = total;
  let seniorTranche = Tranche.load(pool.seniorTranche);
  let juniorTranche = Tranche.load(pool.juniorTranche);
  if (seniorTranche == null || juniorTranche == null) {
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  seniorTranche.totalBalance = senior;
  juniorTranche.totalBalance = junior;

  // @Todo totalTokenSupply and tokenPrice change too
  pool.save();
  seniorTranche.save();
  juniorTranche.save();
}
