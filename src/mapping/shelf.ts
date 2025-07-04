import {
  LoanStarted as LoanStartedEvent,
  LoanEnded as LoanEndedEvent,
  LoanWithdrawn as LoanWithdrawnEvent,
  LoanRepayed as LoanRepayedEvent,
  OriginatorFeePaid,
} from "../../generated/templates/Shelf/Shelf";

import {
  LoanStarted,
  LoanEnded,
  LoanWithdrawn,
  LoanRepayed,
  Pool,
  PoolAddresses,
} from "../../generated/schema";
import {
  BigInt,
  log,
  Address,
} from "@graphprotocol/graph-ts";
import { Shelf } from "../../generated/templates/Shelf/Shelf";
import { getPoolId, getPoolStatusString, PoolStatus } from "../util";
import { ERC20 } from "../../generated/QiroFactory/ERC20";
import { WhitelistOperator } from "../../generated/templates/Operator/WhitelistOperator";

export function handleLoanStarted(event: LoanStartedEvent): void {
  let entity = new LoanStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

  let poolAddresses = getPoolAddresses(event.params.poolId);
  let shelfContract = Shelf.bind(Address.fromBytes(poolAddresses!.shelf));
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let poolObject = getPool(event.params.poolId);
  poolObject!.poolStatus = PoolStatus.ACTIVE;
  poolObject!.originatorFeePaid = shelfContract.originatorFeePaidAmount();
  poolObject!.loanMaturityTimestamp = shelfContract.LOAN_START_TIMESTAMP().plus(poolObject!.loanTerm);
  poolObject!.shelfBalance = currencyContract.balanceOf(Address.fromBytes(poolAddresses!.shelf));
  poolObject!.shelfDebt = shelfContract.debt();
  poolObject!.totalTrancheBalance = currencyContract.balanceOf(Address.fromBytes(poolAddresses!.seniorTranche)).plus(
    currencyContract.balanceOf(Address.fromBytes(poolAddresses!.juniorTranche))
  );
  poolObject!.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  poolObject!.outstandingInterest = shelfContract.getOutstandingInterest();
  poolObject!.save();
}

export function handleLoanEnded(event: LoanEndedEvent): void {
  let entity = new LoanEnded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

  updatePoolStatus(event.params.poolId, PoolStatus.ENDED);
}

export function handleLoanWithdrawn(event: LoanWithdrawnEvent): void {
  let entity = new LoanWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.borrower = event.params.borrower;
  entity.withdrawTo = event.params.withdrawTo;
  entity.amount = event.params.currencyAmount;
  entity.blockTimestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let poolAddresses = getPoolAddresses(event.params.poolId);
  let shelfContract = Shelf.bind(Address.fromBytes(poolAddresses!.shelf));

  updatePoolBalance(
    event.params.poolId,
    shelfContract.balance()
  );
}

export function handleLoanRepayed(event: LoanRepayedEvent): void {
  let entity = new LoanRepayed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.borrower = event.params.borrower;
  entity.amountRepayed = event.params.currencyAmount;
  entity.principalRepayed = event.params.principalRepaidThisTx;
  entity.interestRepayed = event.params.interestRepaidThisTx;
  entity.lateFeeRepayed = event.params.lateFeeRepaidThisTx;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

  let poolAddresses = getPoolAddresses(event.params.poolId);
  let shelfContract = Shelf.bind(Address.fromBytes(poolAddresses!.shelf));
  let operator = WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator));
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let pool = getPool(event.params.poolId);
  pool!.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  pool!.outstandingInterest = shelfContract.getOutstandingInterest();
  pool!.poolStatus = getPoolStatusString(operator.getState());
  pool!.shelfDebt = shelfContract.debt();
  pool!.shelfBalance = currencyContract.balanceOf(Address.fromBytes(poolAddresses!.shelf));
  pool!.totalRepaid = shelfContract.totalRepayedAmount();
  pool!.principalRepaid = shelfContract.totalPrincipalRepayed();
  pool!.interestRepaid = shelfContract.totalInterestRepayed();
  pool!.lateFeeRepaid = shelfContract.totalLateFeePaid();
  pool!.totalTrancheBalance = currencyContract.balanceOf(Address.fromBytes(poolAddresses!.seniorTranche)).plus(
    currencyContract.balanceOf(Address.fromBytes(poolAddresses!.juniorTranche))
  );
  pool!.trancheSupplyMaxBalance = operator.totalDepositCurrencyJunior().plus(
    operator.totalDepositCurrencySenior()
  );
  pool!.prepaymentAbsorbedAmount = shelfContract.prepaymentAbsorbedAmount();
  pool!.save();
}

export function handleOriginatorFeePaid(event: OriginatorFeePaid): void {
  let pool = getPool(event.params.poolId);
  pool!.originatorFeePaid = event.params.amount;
  pool!.save();
}

function updatePoolBalance(poolId: BigInt, total: BigInt): void {
  // todo - update pool entity
  let pool = Pool.load(getPoolId(poolId));
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
  let pool = Pool.load(getPoolId(poolId));
  if (pool == null) {
    log.error("Pool not found for ID: {}", [poolId.toHexString()]);
    return;
  }
  pool.poolStatus = status;
  pool.save();
}

export function getPool(poolId: BigInt): Pool | null {
  let pool = Pool.load(getPoolId(poolId));
  if (pool == null) {
    log.error("Pool not found for ID: {}", [poolId.toHexString()]);
    return null;
  }
  return pool;
}

export function getPoolAddresses(poolId: BigInt): PoolAddresses | null {
  let poolAddresses = PoolAddresses.load(getPoolId(poolId));
  if (poolAddresses == null) {
    log.error("Pool not found for ID: {}", [poolId.toHexString()]);
    return null;
  }
  return poolAddresses;
}