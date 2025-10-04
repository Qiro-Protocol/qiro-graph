import {
  LoanStarted as LoanStartedEventSecuritisationShelf,
  LoanEnded as LoanEndedEventSecuritisationShelf,
  LoanWithdrawn as LoanWithdrawnEventSecuritisationShelf,
  LoanRepayed as LoanRepayedEventSecuritisationShelf,
  OriginatorFeePaid as OriginatorFeePaidSecuritisationShelf,
  FileCall as FileCallSecuritisationShelf,
  DependCall as DependCallSecuritisationShelf,
} from "../../generated/templates/SecuritisationShelf/SecuritisationShelf";
import { UpdateBorrowerAddressCall as UpdateBorrowerAddressCallSec } from "../../generated/templates/SecuritisationShelf/SecuritisationShelf";

import { SecuritisationShelf } from "../../generated/templates/SecuritisationShelf/SecuritisationShelf";
import { SecuritisationTranche } from "../../generated/QiroFactory/SecuritisationTranche";
import { Tranche as TrancheEntity } from "../../generated/schema";
import { getCurrencyFromPoolId } from "./operator";
import {
  LoanStarted,
  LoanEnded,
  LoanWithdrawn,
  LoanRepayed,
  Pool,
  PoolAddresses,
  Transaction,
} from "../../generated/schema";
import { BigInt, log, Address } from "@graphprotocol/graph-ts";
import { InvestmentOperator } from "../../generated/templates";
import {
  getPoolId,
  getPoolStatusString,
  PoolStatus,
  TrancheType,
  TrancheTypeWithPool,
  TransactionType,
} from "../util";
import { ERC20 } from "../../generated/QiroFactory/ERC20";
import { WhitelistOperator } from "../../generated/templates/WhitelistOperator/WhitelistOperator";
import { SecuritisationReserve } from "../../generated/QiroFactory/SecuritisationReserve";
import { getOrCreateBorrower, getOrCreateCurrency } from "../qiro-factory";

export function handleLoanStartedSecuritisationShelf(
  event: LoanStartedEventSecuritisationShelf
): void {
  let entity = new LoanStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

  let poolAddresses = getPoolAddresses(event.params.poolId);
  let securitisationShelfContract = SecuritisationShelf.bind(
    Address.fromBytes(poolAddresses!.shelf)
  );
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let poolObject = getPool(event.params.poolId);
  poolObject!.poolStatus = getPoolStatusString(operator.getState());
  poolObject!.originatorFeePaid =
    securitisationShelfContract.originatorFeePaidAmount();
  poolObject!.loanMaturityTimestamp = securitisationShelfContract
    .LOAN_START_TIMESTAMP()
    .plus(poolObject!.loanTerm);
  poolObject!.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.shelf)
  );
  poolObject!.shelfDebt = securitisationShelfContract.debt();
  poolObject!.totalBalance = securitisationShelfContract.balance();
  poolObject!.totalTrancheBalance = currencyContract
    .balanceOf(Address.fromBytes(poolAddresses!.seniorTranche))
    .plus(
      currencyContract.balanceOf(
        Address.fromBytes(poolAddresses!.juniorTranche)
      )
    );
  poolObject!.outstandingPrincipal =
    securitisationShelfContract.getOutstandingPrincipal();
  poolObject!.outstandingInterest =
    securitisationShelfContract.getOutstandingInterest();
  poolObject!.principalAmount = securitisationShelfContract.principalAmount();
  poolObject!.interestAmount =
    securitisationShelfContract.totalInterestForLoanTerm();
  poolObject!.nftTokenId = securitisationShelfContract.token().value1;

  // SecuritisationShelf-specific fields
  poolObject!.outstandingShortfallInterestAmount =
    securitisationShelfContract.outstandingShortfallInterestAmount();
  poolObject!.outstandingShortfallPrincipalAmount =
    securitisationShelfContract.outstandingShortfallPrincipalAmount();
  poolObject!.servicerFeePaid = securitisationShelfContract.servicerFeePaid();

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

export function handleLoanEndedSecuritisationShelf(
  event: LoanEndedEventSecuritisationShelf
): void {
  let entity = new LoanEnded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

  let poolAddresses = getPoolAddresses(event.params.poolId);
  let securitisationShelfContract = SecuritisationShelf.bind(
    Address.fromBytes(poolAddresses!.shelf)
  );
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  let pool = getPool(event.params.poolId);
  pool!.outstandingPrincipal =
    securitisationShelfContract.getOutstandingPrincipal();
  pool!.outstandingInterest =
    securitisationShelfContract.getOutstandingInterest();
  pool!.poolStatus = getPoolStatusString(operator.getState());
  pool!.shelfDebt = securitisationShelfContract.debt();
  pool!.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.shelf)
  );

  // SecuritisationShelf doesn't have totalWriteOffAmount, set to 0
  pool!.writeoffAmount = BigInt.fromI32(0);

  pool!.save();
}

export function handleLoanWithdrawnSecuritisationShelf(
  event: LoanWithdrawnEventSecuritisationShelf
): void {
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
  let securitisationShelfContract = SecuritisationShelf.bind(
    Address.fromBytes(poolAddresses!.shelf)
  );
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );

  let pool = getPool(event.params.poolId);
  pool!.totalBalance = securitisationShelfContract.balance();
  pool!.totalWithdrawn = pool!.totalWithdrawn.plus(event.params.currencyAmount);
  pool!.poolStatus = getPoolStatusString(operator.getState());
  pool!.shelfBalance = securitisationShelfContract.balance();
  pool!.outstandingPrincipal =
    securitisationShelfContract.getOutstandingPrincipal();
  pool!.outstandingInterest =
    securitisationShelfContract.getOutstandingInterest();
  pool!.shelfDebt = securitisationShelfContract.debt();
  pool!.save();

  createWithdrawTransaction(event);
}

export function handleLoanRepayedSecuritisationShelf(
  event: LoanRepayedEventSecuritisationShelf
): void {
  let poolAddresses = getPoolAddresses(event.params.poolId);
  let securitisationShelfContract = SecuritisationShelf.bind(
    Address.fromBytes(poolAddresses!.shelf)
  );
  let operator = WhitelistOperator.bind(
    Address.fromBytes(poolAddresses!.operator)
  );
  let currencyContract = ERC20.bind(Address.fromBytes(poolAddresses!.currency));

  // Use SecuritisationTranche for both senior and junior tranches
  let seniorContract = SecuritisationTranche.bind(
    Address.fromBytes(poolAddresses!.seniorTranche)
  );
  let juniorContract = SecuritisationTranche.bind(
    Address.fromBytes(poolAddresses!.juniorTranche)
  );

  let entity = new LoanRepayed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.borrower = event.params.borrower;
  entity.amountRepayed = event.params.currencyAmount;
  entity.principalRepayed = event.params.principalRepaidThisTx;
  entity.interestRepayed = event.params.interestRepaidThisTx;
  entity.lateFeeRepayed = event.params.lateFeeRepaidThisTx;
  // For SecuritisationTranche, totalRepaid is sum of principalRepaid + interestRepaid
  entity.seniorTotalRepaid = seniorContract
    .principalRepaid()
    .plus(seniorContract.interestRepaid());
  entity.juniorTotalRepaid = juniorContract
    .principalRepaid()
    .plus(juniorContract.interestRepaid());
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.blockNumber = event.block.number;
  entity.save();

  let pool = getPool(event.params.poolId);
  pool!.outstandingPrincipal =
    securitisationShelfContract.getOutstandingPrincipal();
  pool!.outstandingInterest =
    securitisationShelfContract.getOutstandingInterest();
  pool!.poolStatus = getPoolStatusString(operator.getState());
  pool!.shelfDebt = securitisationShelfContract.debt();
  pool!.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(poolAddresses!.shelf)
  );
  pool!.totalRepaid = securitisationShelfContract.totalRepayedAmount();
  pool!.principalRepaid = securitisationShelfContract.totalPrincipalRepayed();
  pool!.interestRepaid = securitisationShelfContract.totalInterestRepayed();
  pool!.lateFeeRepaid = securitisationShelfContract.totalLateFeePaid();
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
  pool!.prepaymentAbsorbedAmount =
    securitisationShelfContract.prepaymentAbsorbedAmount();

  // SecuritisationShelf-specific fields
  pool!.outstandingShortfallInterestAmount =
    securitisationShelfContract.outstandingShortfallInterestAmount();
  pool!.outstandingShortfallPrincipalAmount =
    securitisationShelfContract.outstandingShortfallPrincipalAmount();
  pool!.servicerFeePaid = securitisationShelfContract.servicerFeePaid();
  // Update reserve balance and EIS balance
  let reserveContract = SecuritisationReserve.bind(
    Address.fromBytes(poolAddresses!.reserve)
  );
  pool!.reserveBalance = reserveContract.balance();
  pool!.eisBalance = reserveContract.eisBalance();

  pool!.save();

  // Update Tranche entities with SecuritisationTranche-specific fields
  let seniorTranche = TrancheEntity.load(poolAddresses!.seniorTranche);
  let juniorTranche = TrancheEntity.load(poolAddresses!.juniorTranche);

  if (seniorTranche) {
    seniorTranche.principalRepaid = seniorContract.principalRepaid();
    seniorTranche.interestRepaid = seniorContract.interestRepaid();
    seniorTranche.overduePrincipalAmount =
      seniorContract.overduePrincipalAmount();
    seniorTranche.lastRepaidTimestamp = seniorContract.lastRepaidTimestamp();
    seniorTranche.totalDaysRepaid = seniorContract.totalDaysRepaid();
    seniorTranche.totalRepaid = seniorTranche.principalRepaid!.plus(
      seniorTranche.interestRepaid!
    );
    seniorTranche.save();
  }

  if (juniorTranche) {
    juniorTranche.principalRepaid = juniorContract.principalRepaid();
    juniorTranche.interestRepaid = juniorContract.interestRepaid();
    juniorTranche.overduePrincipalAmount =
      juniorContract.overduePrincipalAmount();
    juniorTranche.lastRepaidTimestamp = juniorContract.lastRepaidTimestamp();
    juniorTranche.totalDaysRepaid = juniorContract.totalDaysRepaid();
    juniorTranche.totalRepaid = juniorTranche.principalRepaid!.plus(
      juniorTranche.interestRepaid!
    );
    juniorTranche.save();
  }

  createRepayTransaction(event);
}

export function handleOriginatorFeePaidSecuritisationShelf(
  event: OriginatorFeePaidSecuritisationShelf
): void {
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

function createWithdrawTransaction(
  event: LoanWithdrawnEventSecuritisationShelf
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
  event: LoanRepayedEventSecuritisationShelf
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

export function handleShelfFile(call: FileCallSecuritisationShelf): void {
  let securitisationShelf = SecuritisationShelf.bind(call.to);
  let poolId = securitisationShelf.poolId();

  let pool = getPool(poolId);

  if (call.inputs.what.toString() == "poolInterest") {
    pool!.shelfDebt = securitisationShelf.debt();
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

export function handleSecuritisationShelfDepend(call: DependCallSecuritisationShelf): void {
  let securitisationShelf = SecuritisationShelf.bind(call.to);
  let poolId = securitisationShelf.poolId();

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

export function handleSecuritisationShelfUpdateBorrowerAddress(
  call: UpdateBorrowerAddressCallSec
): void {
  let shelf = SecuritisationShelf.bind(call.to);
  let poolId = shelf.poolId();

  let pool = getPool(poolId);
  if (pool != null) {
    // Ensure Borrower entity exists
    getOrCreateBorrower(call.inputs._borrower, call.block.timestamp);
    pool.borrower = call.inputs._borrower;
    pool.save();
  }
}


