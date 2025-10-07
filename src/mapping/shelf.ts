import {
  LoanStarted as LoanStartedEvent,
  LoanEnded as LoanEndedEvent,
  LoanWithdrawn as LoanWithdrawnEvent,
  LoanRepayed as LoanRepayedEvent,
  OriginatorFeePaid,
  FileCall,
  DependCall,
  UpdateBorrowerAddressCall,
  Shelf,
  RecoveryPaid,
  PrepaymentApplied as PrepaymentAppliedEvent,
} from "../../generated/templates/Shelf/Shelf";
import { getCurrencyFromPoolId } from "./operator";
import {
  LoanStarted,
  LoanEnded,
  LoanWithdrawn,
  LoanRepayed,
  Pool,
  PoolAddresses,
  Transaction,
  Tranche as TrancheEntity,
  PrepaymentApplied,
} from "../../generated/schema";
import { BigInt, log, Address } from "@graphprotocol/graph-ts";
import { InvestmentOperator } from "../../generated/templates";
import {
  getPoolId,
  getPoolStatusString,
  TrancheTypeWithPool,
  TransactionType,
} from "../util";
import { ERC20 } from "../../generated/QiroFactory/ERC20";
import { WhitelistOperator } from "../../generated/templates/WhitelistOperator/WhitelistOperator";
import { Tranche } from "../../generated/QiroFactory/Tranche";
import { getOrCreateBorrower, getOrCreateCurrency } from "../qiro-factory";
import { updateReserveBalance } from "./reserve";

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
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let poolObject = getPool(event.params.poolId);
  poolObject!.poolStatus = getPoolStatusString(operator.getState());
  poolObject!.originatorFeePaid = shelfContract.originatorFeePaidAmount();
  poolObject!.loanMaturityTimestamp = shelfContract
    .LOAN_START_TIMESTAMP()
    .plus(poolObject!.loanTerm);
  poolObject!.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.shelf)
  );
  poolObject!.shelfDebt = shelfContract.debt();
  poolObject!.totalBalance = shelfContract.balance();
  poolObject!.totalTrancheBalance = currencyContract
    .balanceOf(Address.fromBytes(poolAddresses!.seniorTranche))
    .plus(
      currencyContract.balanceOf(
        Address.fromBytes(poolAddresses!.juniorTranche)
      )
    );
  poolObject!.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  poolObject!.outstandingInterest = shelfContract.getOutstandingInterest();
  poolObject!.principalAmount = shelfContract.principalAmount();
  poolObject!.interestAmount = shelfContract.totalInterestForLoanTerm();
  poolObject!.nftTokenId = shelfContract.token().value1;
  poolObject!.save();

  let seniorTranche = TrancheEntity.load(poolAddresses!.seniorTranche);
  let juniorTranche = TrancheEntity.load(poolAddresses!.juniorTranche);
  if (seniorTranche) {
    seniorTranche.balance = currencyContract.balanceOf(
      Address.fromBytes(poolAddresses!.seniorTranche)
    );
    seniorTranche.save();
  } else {
    // fail
    log.error("Senior tranche not found for pool: {}", [
      poolObject!.id.toString(),
    ]);
  }
  if (juniorTranche) {
    juniorTranche.balance = currencyContract.balanceOf(
      Address.fromBytes(poolAddresses!.juniorTranche)
    );
    juniorTranche.save();
  } else {
    // fail
    log.error("Junior tranche not found for pool: {}", [
      poolObject!.id.toString(),
    ]);
  }
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
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let pool = getPool(event.params.poolId);
  pool!.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  pool!.outstandingInterest = shelfContract.getOutstandingInterest();
  pool!.poolStatus = getPoolStatusString(operator.getState());
  pool!.shelfDebt = shelfContract.debt();
  pool!.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.shelf)
  );

  // Shelf has totalWriteOffAmount
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
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );

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
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));
  let seniorContract = Tranche.bind(
    Address.fromBytes(poolAddresses!.seniorTranche)
  );
  let juniorContract = Tranche.bind(
    Address.fromBytes(poolAddresses!.juniorTranche)
  );

  let entity = new LoanRepayed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.borrower = event.params.borrower;
  entity.amountRepayed = event.params.currencyAmount;
  entity.prePaymentPrincipal = event.params.prepaymentAbsorbedAmountThisTx;
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
  pool!.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.shelf)
  );
  pool!.totalRepaid = shelfContract.totalRepayedAmount();
  pool!.principalRepaid = shelfContract.totalPrincipalRepayed();
  pool!.interestRepaid = shelfContract.totalInterestRepayed();
  pool!.lateFeeRepaid = shelfContract.totalLateFeePaid();
  pool!.totalTrancheBalance = currencyContract
    .balanceOf(Address.fromBytes(poolAddresses!.seniorTranche))
    .plus(
      currencyContract.balanceOf(
        Address.fromBytes(poolAddresses!.juniorTranche)
      )
    );
  pool!.trancheSupplyMaxBalance = operator
    .totalDepositCurrencyJunior()
    .plus(operator.totalDepositCurrencySenior());
  pool!.prepaymentAbsorbedAmount = shelfContract.prepaymentAbsorbedAmount();
  pool!.prepaymentPeriod = shelfContract.prePaymentPeriod();
  pool!.postPrePaymentOSPrincipal = shelfContract.postPrePaymentOSPrincipal();
  // For regular Reserve, get balance from currency contract
  pool!.reserveBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.reserve)
  );
  // Regular Reserve doesn't have eisBalance, set to 0
  pool!.eisBalance = BigInt.fromI32(0);

  pool!.save();

  createRepayTransaction(event);

  updateReserveBalance(event.params.poolId, Address.fromBytes(poolAddresses!.reserve));
}

export function handleOriginatorFeePaid(event: OriginatorFeePaid): void {
  let pool = getPool(event.params.poolId);
  pool!.originatorFeePaid = event.params.amount;
  pool!.save();
}

export function getPool(poolId: BigInt): Pool | null {
  let pool = Pool.load(getPoolId(poolId));
  if (pool == null) {
    log.error("Pool not found for ID: {}", [poolId.toString()]);
    return null;
  }
  return pool;
}

export function getPoolAddresses(poolId: BigInt): PoolAddresses | null {
  let poolAddresses = PoolAddresses.load(getPoolId(poolId));
  if (poolAddresses == null) {
    log.error("Pool not found for ID: {}", [poolId.toString()]);
    return null;
  }
  return poolAddresses;
}

function createWithdrawTransaction(event: LoanWithdrawnEvent): void {
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

function createRepayTransaction(event: LoanRepayedEvent): void {
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

  if (call.inputs.what.toString() == "gracePeriod") { 
    pool!.gracePeriod = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "writeOffTime") {
    pool!.writeoffTime = BigInt.fromI32(call.inputs.data.toI32());
  } else if (call.inputs.what.toString() == "lateFeeInterestRateInBps") {
    pool!.lateFeeInterestRate = BigInt.fromI32(call.inputs.data.toI32());
  } else{
    throw new Error("Invalid what attempted to file: " + call.inputs.what.toString());
  }

  pool!.save();

  log.info("Updated pool {} with what: {}, data: {}", [
    poolId.toString(),
    call.inputs.what.toString(),
    call.inputs.data.toString(),
  ]);
}

export function handleRecoveryPaid(event: RecoveryPaid): void {
  let shelf = Shelf.bind(event.address);
  let pool = getPool(event.params.poolId);
  pool!.recoveryAmountPaid = shelf.recoveryAmountPaid();
  pool!.save();
}

export function handleShelfDepend(call: DependCall): void {
  let shelf = Shelf.bind(call.to);
  let poolId = shelf.poolId();

  let poolAddresses = getPoolAddresses(poolId);

  if (call.inputs.contractName.toString() == "lender") {
    // whitelist operator
    poolAddresses!.operator = call.inputs.addr;
    // create listener for investment operator
    InvestmentOperator.create(
      WhitelistOperator.bind(
        Address.fromBytes(poolAddresses!.operator)
      ).investmentOperator()
    );
  } else if (call.inputs.contractName.toString() == "token") {
    // currency
    // create new currency entity
    getOrCreateCurrency(call.inputs.addr);
    poolAddresses!.currency = call.inputs.addr;
  } else if (call.inputs.contractName.toString() == "reserve") {
    // reserve
    poolAddresses!.reserve = call.inputs.addr;
  } else if (call.inputs.contractName.toString() == "nft") {
    poolAddresses!.nftContractAddress = call.inputs.addr;
  } else if (call.inputs.contractName.toString() == "distributor") {
    // distributor
    // do nothing as distributor is not stored in the subgraph
  }

  poolAddresses!.save();
}

export function handleShelfUpdateBorrowerAddress(
  call: UpdateBorrowerAddressCall
): void {
  let shelf = Shelf.bind(call.to);
  let poolId = shelf.poolId();

  let pool = getPool(poolId);
  if (pool != null) {
    // Ensure Borrower entity exists
    getOrCreateBorrower(call.inputs._borrower, call.block.timestamp);
    pool.borrower = call.inputs._borrower;
    pool.save();
  }
}

export function handlePrepaymentApplied(event: PrepaymentAppliedEvent): void {
  createPrepaymentAppliedTransaction(event);
}

function createPrepaymentAppliedTransaction(event: PrepaymentAppliedEvent): void {
  let entity = new PrepaymentApplied(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params._poolId);
  entity.prepaymentPeriod = event.params._prepaymentPeriod;
  entity.prepaymentAbsorbedAmount = event.params._prepaymentAbsorbedAmount;
  entity.postPrePaymentOSPrincipal = event.params._postPrePaymentOSPrincipal;
  entity.totalInterestForLoanTerm = event.params._totalInterestForLoanTerm;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}