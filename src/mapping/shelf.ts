import {
  LoanStarted as LoanStartedEvent,
  LoanEnded as LoanEndedEvent,
  LoanWithdrawn as LoanWithdrawnEvent,
  LoanRepayed as LoanRepayedEvent,
  OriginatorFeePaid,
  FileCall,
  DependCall,
  PauseCall,
  UnpauseCall,
} from "../../generated/templates/Shelf/Shelf";
import { getCurrencyFromPoolId } from "./operator"
import {
  LoanStarted,
  LoanEnded,
  LoanWithdrawn,
  LoanRepayed,
  Pool,
  PoolAddresses,
  Transaction,
} from "../../generated/schema";
import {
  BigInt,
  log,
  Address,
} from "@graphprotocol/graph-ts";
import { InvestmentOperator } from "../../generated/templates";
import { Shelf } from "../../generated/templates/Shelf/Shelf";
import { getPoolId, getPoolStatusString, PoolStatus, TrancheType, TrancheTypeWithPool, TransactionType } from "../util";
import { ERC20 } from "../../generated/QiroFactory/ERC20";
import { WhitelistOperator } from "../../generated/templates/WhitelistOperator/WhitelistOperator";
import { Tranche } from "../../generated/QiroFactory/Tranche";
import { getOrCreateCurrency } from "../qiro-factory";

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
  let operator = WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator));
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let poolObject = getPool(event.params.poolId);
  poolObject!.poolStatus = getPoolStatusString(operator.getState());
  poolObject!.originatorFeePaid = shelfContract.originatorFeePaidAmount();
  poolObject!.loanMaturityTimestamp = shelfContract.LOAN_START_TIMESTAMP().plus(poolObject!.loanTerm);
  poolObject!.shelfBalance = currencyContract.balanceOf(Address.fromBytes(poolAddresses!.shelf));
  poolObject!.shelfDebt = shelfContract.debt();
  poolObject!.totalBalance = shelfContract.balance();
  poolObject!.totalTrancheBalance = currencyContract.balanceOf(Address.fromBytes(poolAddresses!.seniorTranche)).plus(
    currencyContract.balanceOf(Address.fromBytes(poolAddresses!.juniorTranche))
  );
  poolObject!.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  poolObject!.outstandingInterest = shelfContract.getOutstandingInterest();
  poolObject!.principalAmount = shelfContract.principalAmount();
  poolObject!.interestAmount = shelfContract.totalInterestForLoanTerm();
  poolObject!.nftTokenId = shelfContract.token().value1;
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
  pool!.writeoffAmount = shelfContract.totalWriteOffAmount();
  pool!.save();
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
  let operator = WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator));

  let pool = getPool(event.params.poolId);
  pool!.totalBalance = shelfContract.balance();
  pool!.totalWithdrawn = pool!.totalWithdrawn.plus(event.params.currencyAmount);
  pool!.poolStatus = getPoolStatusString(operator.getState());
  pool!.shelfBalance = shelfContract.balance();
  pool!.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  pool!.outstandingInterest = shelfContract.getOutstandingInterest();
  pool!.shelfDebt = shelfContract.debt();
  pool!.save();

  createWithdrawTransaction(event);
}

export function handleLoanRepayed(event: LoanRepayedEvent): void {
  let poolAddresses = getPoolAddresses(event.params.poolId);
  let shelfContract = Shelf.bind(Address.fromBytes(poolAddresses!.shelf));
  let operator = WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator));
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));
  let seniorContract = Tranche.bind(Address.fromBytes(poolAddresses!.seniorTranche));
  let juniorContract = Tranche.bind(Address.fromBytes(poolAddresses!.juniorTranche));

  let entity = new LoanRepayed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.borrower = event.params.borrower;
  entity.amountRepayed = event.params.currencyAmount;
  entity.principalRepayed = event.params.principalRepaidThisTx;
  entity.interestRepayed = event.params.interestRepaidThisTx;
  entity.lateFeeRepayed = event.params.lateFeeRepaidThisTx;
  entity.seniorTotalRepaid = seniorContract.totalRepayedAmount();
  entity.juniorTotalRepaid = juniorContract.totalRepayedAmount();
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

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

  createRepayTransaction(event);
}

export function handleOriginatorFeePaid(event: OriginatorFeePaid): void {
  let pool = getPool(event.params.poolId);
  pool!.originatorFeePaid = event.params.amount;
  pool!.save();
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

function createWithdrawTransaction(
  event: LoanWithdrawnEvent
): void {
  let entity = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.lenderOrBorrower = event.params.borrower;
  entity.amount = event.params.currencyAmount;
  entity.type = TransactionType.WITHDRAW;
  entity.trancheType = TrancheTypeWithPool.POOL;
  entity.currency = getCurrencyFromPoolId(event.params.poolId);
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

function createRepayTransaction(
  event: LoanRepayedEvent
): void {
  let entity = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.lenderOrBorrower = event.params.borrower;
  entity.amount = event.params.currencyAmount;
  entity.type = TransactionType.REPAY;
  entity.trancheType = TrancheTypeWithPool.POOL;
  entity.currency = getCurrencyFromPoolId(event.params.poolId);
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleShelfFile(call: FileCall): void {
  let shelf = Shelf.bind(call.to);
  let poolId = shelf.poolId();

  let pool = getPool(poolId);

  if (call.inputs.what.toString() == "pStartFrom") {
    pool!.pStartFrom = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "periodLength") {
    pool!.periodLength = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "periodCount") {
    pool!.periodCount = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "isBulletRepay") {
    pool!.isBullet = call.inputs.data.toI32() == 1 ? true : false;
  } else if (call.inputs.what.toString() == "gracePeriod") {
    pool!.gracePeriod = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "writeOffTime") {
    pool!.writeoffTime = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "lateFeeInterestRate") {
    pool!.lateFeeInterestRate = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "annualInterestRateInBps") {
    pool!.interestRate = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "writeOffOriginatorFee") {
    pool!.originatorFeeRate = BigInt.fromI32(0); // hardcoded to 0 on contract too
  }

  pool!.save();

  log.info("Updated pool {} with what: {}, data: {}", [
    poolId.toHexString(),
    call.inputs.what.toString(),
    call.inputs.data.toString(),
  ]);
}

export function handleShelfDepend(call: DependCall): void {
  let shelf = Shelf.bind(call.to);
  let poolId = shelf.poolId();

  let poolAddresses = PoolAddresses.load(getPoolId(poolId));

  if (call.inputs.contractName.toString() == "lender") {
    // whitelist operator
    poolAddresses!.operator = call.inputs.addr;
    // create listener for investment operator
    InvestmentOperator.create(WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator)).investmentOperator());
  } else if (call.inputs.contractName.toString() == "token") {
    // currency
    // create new currency entity
    getOrCreateCurrency(call.inputs.addr);
    poolAddresses!.currency = call.inputs.addr;
  } else if (call.inputs.contractName.toString() == "reserve") {
    // reserve
    // do nothing as reserve is not stored in the subgraph
  } else if (call.inputs.contractName.toString() == "nft") {
    poolAddresses!.nftContractAddress = call.inputs.addr;
  } else if (call.inputs.contractName.toString() == "distributor") {
    // distributor
    // do nothing as distributor is not stored in the subgraph
  }

  poolAddresses!.save();
}

export function handleShelfPaused(call: PauseCall): void {
  let poolId = Shelf.bind(call.to).poolId();
  let pool = getPool(poolId);
  if (pool) {
    pool.isShelfPaused = true;
    pool.save();
  } else {
    log.warning("Pool not found for ID: {}", [poolId.toHexString()]);
  }
}

export function handleShelfUnpaused(call: UnpauseCall): void {
  let poolId = Shelf.bind(call.to).poolId();
  let pool = getPool(poolId);
  if (pool) {
    pool.isShelfPaused = false;
    pool.save();
  } else {
    log.warning("Pool not found for ID: {}", [poolId.toHexString()]);
  }
}