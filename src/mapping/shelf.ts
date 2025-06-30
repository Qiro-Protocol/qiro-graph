import {
  LoanStarted as LoanStartedEvent,
  LoanEnded as LoanEndedEvent,
  LoanWithdrawn as LoanWithdrawnEvent,
  LoanRepayed as LoanRepayedEvent,
} from "../../generated/templates/Shelf/Shelf";

import {
  LoanStarted,
  LoanEnded,
  LoanWithdrawn,
  LoanRepayed,
  Pool,
  Tranche,
  User,
  BorrowerPool,
} from "../../generated/schema";
import {
  Address,
  BigInt,
  bigInt,
  ByteArray,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import { crypto, store } from "@graphprotocol/graph-ts";
import { createTxnAndUpdateUser } from "../qiro-factory";
import { Shelf } from "../../generated/templates/Shelf/Shelf";
import { getPoolId, PoolStatus } from "../util";

export function handleLoanStarted(event: LoanStartedEvent): void {
  let entity = new LoanStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  updatePoolStatus(event.params.poolId, PoolStatus.ACTIVE);

  createTxnAndUpdateUser(
    "POOL_INITIALED",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    new BigInt(0)
  );

  let user = User.load(event.transaction.from);
  user!.isBorrower = true;
  user!.totalBorrowed = user!.totalBorrowed.plus(event.params.principalAmount);
  user!.save();
  let pID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.poolId))
  );
  // map pool and borrower, for user to
  let userPool = new BorrowerPool(pID.concat(event.transaction.from));
  userPool.borrowedPool = pID;
  userPool.user = event.transaction.from;
  userPool.save();

  let pool = Pool.load(pID);
  let shelf = Shelf.bind(Address.fromBytes(pool!.shelf));
  let str = shelf.expectedRepaymentAmount().value0;
  pool!.nextExpectedRepayment = str;
  pool!.save()
}

export function handleLoanEnded(event: LoanEndedEvent): void {
  let entity = new LoanEnded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.poolId;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  updatePoolStatus(event.params.poolId, "ENDED");
}

export function handleLoanWithdrawn(event: LoanWithdrawnEvent): void {
  let entity = new LoanWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.poolId;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.amountWithdrawn = event.params.currencyAmount;
  entity.save();

  let pID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.poolId))
  );
  let pool = Pool.load(pID);
  if (pool == null) {
    log.info("Message to be displayed: {}", [
      event.params.poolId.toHexString(),
    ]);
    return;
  }
  pool.save();
  updatePoolBalance(
    event.params.poolId,
    pool.totalBalance.minus(event.params.currencyAmount)
  );

  createTxnAndUpdateUser(
    "BORROWER_WITHDRAW",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.currencyAmount
  );
}

export function handleLoanRepayed(event: LoanRepayedEvent): void {
  let entity = new LoanRepayed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.poolId;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.amountRepayed = event.params.currencyAmount;
  entity.save();

  let pID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.poolId))
  );
  let pool = Pool.load(pID);

  if (pool == null) {
    log.info("Message to be displayed: {}", [
      event.params.poolId.toHexString(),
    ]);
    return;
  }
  pool.nextExpectedRepayment = event.params.nextExpectedRepaymentAmount;
  pool.totalBalance = pool.totalBalance.plus(event.params.currencyAmount);
  pool.totalRepaid = pool.totalRepaid.plus(event.params.currencyAmount);
  // @Todo totalTokenSupply and tokenPrice change too
  pool.save();

  createTxnAndUpdateUser(
    "BORROWER_REPAY",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.currencyAmount
  );

  let user = User.load(event.transaction.from);
  user!.totalRepayed = event.params.totalRepayedAmount;
  user!.save();
}

function updatePoolBalance(poolId: BigInt, total: BigInt): void {
  // todo - update pool entity
  let pID = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
  let pool = Pool.load(pID);
  if (pool == null) {
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  pool.totalBalance = total;
  // @Todo totalTokenSupply and tokenPrice change too
  pool.save();
}

export function updatePoolStatus(poolId: BigInt, status: string): void {
  // todo - update pool entity
  let pID = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
  let pool = Pool.load(pID);
  if (pool == null) {
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  pool.poolStatus = status;
  pool.save();
}
