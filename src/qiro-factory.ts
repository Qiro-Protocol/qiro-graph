import {
  Address,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import {
  PoolDeployed as PoolDeployedEvent,
} from "../generated/QiroFactory/QiroFactory";
import {
  Pool,
  PoolDeployed,
  Tranche,
  PoolAddresses,
  PoolCurrency,
  Borrower,
} from "../generated/schema";
import { TrustOperator, Shelf } from "../generated/templates";
import { WhitelistOperator } from "../generated/templates/Operator/WhitelistOperator";
import { Shelf as ShelfContract } from "../generated/templates/Shelf/Shelf";
import { Tranche as TrancheContract } from "../generated/QiroFactory/Tranche";
import { ERC20 } from "../generated/QiroFactory/ERC20";
import { getPoolId, TrancheType, getPoolStatusString, getPoolTypeString, ONE } from "./util";
import { FactoryCreated, QiroFactory as QiroFactoryContract, FileCall } from "../generated/QiroFactory/QiroFactory";
import { QiroFactory } from "../generated/schema";

export function handleFactoryCreated(event: FactoryCreated): void {
  let entity = new QiroFactory(event.params.factory);

  let qiroFactory = QiroFactoryContract.bind(event.params.factory);

  entity.shelfFab = qiroFactory.shelfFab();
  entity.trustOperatorFab = qiroFactory.trustOperatorFab();
  entity.whitelistOperatorFab = qiroFactory.operatorFab();
  entity.defaultAssessorFab = qiroFactory.assessorFab();
  entity.distributorFab = qiroFactory.distributorFab();
  entity.seniorTrancheFab = qiroFactory.seniorTrancheFab();
  entity.juniorTrancheFab = qiroFactory.juniorTrancheFab();
  entity.qiroFeeCollector = qiroFactory.qiroFeeCollector();
  entity.owner = qiroFactory.owner();
  entity.whitelistManager = qiroFactory.whitelistManager();
  entity.poolCount = qiroFactory.poolCount();
  entity.nftContractAddress = qiroFactory.qiroAssetNFT();
  entity.currency = qiroFactory.currency();
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handlePoolDeployed(event: PoolDeployedEvent): void {
  let entity = new PoolDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.poolId; // uint256
  entity.pool = getPoolId(event.params.poolId);
  entity.seniorRate = event.params.seniorRate;
  entity.interestRate = event.params.interestRate;
  entity.periodLength = event.params.periodLength;
  entity.periodCount = event.params.periodCount;
  entity.gracePeriod = event.params.gracePeriod;
  entity.operator = event.params.operator;
  entity.shelf = event.params.shelf;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  handlePool(entity as PoolDeployed, event.params.poolId, event.address);

  updatePoolCountInFactory(event.address);

  Shelf.create(event.params.shelf);
  TrustOperator.create(
    WhitelistOperator.bind(event.params.operator).trustOperator()
  );
}

function handlePool(pool: PoolDeployed, poolId: BigInt, qiroFactory: Address): void {
  // Start
  let entity = new Pool(pool.pool); // event.poolId in bytes
  let poolAddresses = new PoolAddresses(pool.pool);

  let operator = WhitelistOperator.bind(Address.fromBytes(pool.operator));
  let shelfContract = ShelfContract.bind(Address.fromBytes(pool.shelf));
  let factory = QiroFactoryContract.bind(qiroFactory);
  let factoryPool = factory.pools(poolId);
  let qiroFactoryCurrency = factory.currency();
  let currencyContract = ERC20.bind(Address.fromBytes(qiroFactoryCurrency));
  let juniorTranch = operator.junior();
  let seniorTranch = operator.senior();

  entity.poolId = poolId; // uint256
  entity.poolStatus = getPoolStatusString(operator.getState());
  entity.operator = pool.operator;
  entity.seniorInterestRate = pool.seniorRate;
  entity.interestRate = pool.interestRate;
  entity.periodLength = pool.periodLength;
  entity.periodCount = pool.periodCount;
  entity.loanTerm = pool.periodLength.times(pool.periodCount);
  entity.gracePeriod = pool.gracePeriod;
  entity.totalBalance = shelfContract.balance();
  entity.startTimestamp = pool.blockTimestamp;
  entity.loanMaturityTimestamp = pool.blockTimestamp.plus(
    pool.periodLength.times(pool.periodCount)
  );
  entity.totalRepaid = new BigInt(0);
  entity.principalRepaid = new BigInt(0);
  entity.interestRepaid = new BigInt(0);
  entity.capitalFormationPeriod = operator.capitalFormationPeriod(); // 7 days
  entity.capitalFormationPeriodEnd = operator.capitalFormationEnd();
  entity.principalAmount = shelfContract.principalAmount();
  entity.interestAmount = shelfContract.totalInterestForLoanTerm();
  entity.writeoffAmount = new BigInt(0);
  entity.totalTrancheBalance = new BigInt(0);
  entity.trancheSupplyMaxBalance = new BigInt(0);
  entity.outstandingPrincipal = shelfContract.getOutstandingPrincipal();
  entity.outstandingInterest = shelfContract.totalInterestForLoanTerm().minus(
    shelfContract.totalInterestRepayed()
  );
  entity.isBullet = shelfContract.isBulletRepay();
  entity.poolType = getPoolTypeString(factoryPool.getPoolType());
  entity.isPaused = shelfContract.paused();
  entity.blockNumber = pool.blockNumber;
  entity.blockTimestamp = pool.blockTimestamp;
  entity.transactionHash = pool.transactionHash;
  entity.borrower = shelfContract.borrower();
  entity.originatorFeePaid = shelfContract.originatorFeePaidAmount();
  entity.pStartFrom = shelfContract.pStartFrom();
  entity.pRepayFrequency = shelfContract.pRepayFrequency();
  entity.shelfBalance = currencyContract.balanceOf(Address.fromBytes(pool.shelf));
  entity.shelfDebt = BigInt.fromI32(0);
  entity.prepaymentAbsorbedAmount = shelfContract.prepaymentAbsorbedAmount();
  entity.lateFeeRepaid = shelfContract.totalLateFeePaid();
  entity.seniorTranche = seniorTranch;
  entity.juniorTranche = juniorTranch;
  entity.nftTokenId = shelfContract.token().value1;
  entity.save();

  let currency = getOrCreateCurrency(qiroFactoryCurrency);

  poolAddresses.pool = pool.pool;
  poolAddresses.shelf = pool.shelf;
  poolAddresses.operator = pool.operator;
  poolAddresses.trustOperator = operator.trustOperator();
  poolAddresses.juniorTranche = juniorTranch;
  poolAddresses.seniorTranche = seniorTranch;
  poolAddresses.lenderDeployer = factoryPool.getLenderDeployer();
  poolAddresses.borrowerDeployer = factoryPool.getBorrowerDeployer();
  poolAddresses.admin = factoryPool.getPoolAdmin();
  poolAddresses.currency = currency.id;
  poolAddresses.seniorToken = operator.seniorToken();
  poolAddresses.juniorToken = operator.juniorToken();
  poolAddresses.root = factoryPool.getRoot();
  poolAddresses.nftContractAddress = factory.qiroAssetNFT();
  poolAddresses.save();

  let junTrancheContract = TrancheContract.bind(juniorTranch);
  let senTrancheContract = TrancheContract.bind(seniorTranch);
  let junTokenContract = ERC20.bind(junTrancheContract.token());
  let senTokenContract = ERC20.bind(operator.seniorToken());

  let seniorTranche = new Tranche(seniorTranch);
  let juniorTranche = new Tranche(juniorTranch);

  juniorTranche.pool = pool.pool;
  juniorTranche.trancheType = TrancheType.JUNIOR;
  juniorTranche.tokenAddress = junTrancheContract.token();
  juniorTranche.totalBalance = junTrancheContract.balance();
  juniorTranche.totalTokenSupply = junTrancheContract.tokenSupply();
  juniorTranche.tokenPrice = ONE; // scaled by 1e27
  juniorTranche.tokenName = junTokenContract.name();
  juniorTranche.tokenSymbol = junTokenContract.symbol();
  juniorTranche.totalInvested = operator.totalDepositCurrencyJunior();
  juniorTranche.totalRedeemed = operator.totalRedeemedCurrencyJunior();
  juniorTranche.totalRepaid = junTrancheContract.totalRepayedAmount();
  juniorTranche.ceiling = operator.juniorTrancheCeiling();
  juniorTranche.blockTimestamp = pool.blockTimestamp;
  juniorTranche.transactionHash = pool.transactionHash;
  juniorTranche.save();

  seniorTranche.pool = pool.pool;
  seniorTranche.trancheType = TrancheType.SENIOR;
  seniorTranche.tokenAddress = operator.seniorToken();
  seniorTranche.totalBalance = senTrancheContract.balance();
  seniorTranche.totalTokenSupply = senTrancheContract.tokenSupply();
  seniorTranche.tokenPrice = ONE;
  seniorTranche.tokenName = senTokenContract.name();
  seniorTranche.tokenSymbol = senTokenContract.symbol();
  seniorTranche.totalInvested = operator.totalDepositCurrencySenior();
  seniorTranche.totalRedeemed = operator.totalRedeemedCurrencySenior();
  seniorTranche.totalRepaid = senTrancheContract.totalRepayedAmount();
  seniorTranche.ceiling = operator.seniorTrancheCeiling();
  seniorTranche.blockTimestamp = pool.blockTimestamp;
  seniorTranche.transactionHash = pool.transactionHash;
  seniorTranche.save();

  // creates the borrower entity if it does not exist
  getOrCreateBorrower(Address.fromBytes(entity.borrower), pool.blockTimestamp);
}

export function handleFactoryFile(call: FileCall): void {
  let factory = QiroFactory.load(call.to);
  if (factory == null) {
    log.error("Factory not found for address: {}", [call.to.toHexString()]);
    return;
  }

  let what = call.inputs.what.toString();
  let value = call.inputs._value;

  if (what == "qiroFeeCollector") {
    factory.qiroFeeCollector = value;
  } else if (what == "qiroAssetNFT") {
    factory.nftContractAddress = value;
  } else if (what == "currency") {
    factory.currency = value;
  } else {
    log.warning("Unknown parameter in factory file call: {}", [what]);
  }
  factory.save();
}

function getOrCreateBorrower(
  borrowerAddress: Address,
  blockTimestamp: BigInt = BigInt.fromI32(0)
): Borrower {
  let borrower = Borrower.load(borrowerAddress);
  if (borrower == null) {
    borrower = new Borrower(borrowerAddress);
    borrower.blockTimestamp = blockTimestamp;
    borrower.save();
  }
  return borrower;
}

export function getOrCreateCurrency(qiroFactoryCurrency: Address): PoolCurrency {
  let poolCurrency = PoolCurrency.load(qiroFactoryCurrency);
  if (poolCurrency == null) {
    let qiroFactoryCurrencyBind = ERC20.bind(qiroFactoryCurrency);
    poolCurrency = new PoolCurrency(qiroFactoryCurrency);
    poolCurrency.address = qiroFactoryCurrency;
    poolCurrency.symbol = qiroFactoryCurrencyBind.symbol();
    poolCurrency.decimals = qiroFactoryCurrencyBind.decimals();
    poolCurrency.save();
  }
  return poolCurrency;
}

function updatePoolCountInFactory(qiroFactory: Address): void {
  let factory = QiroFactoryContract.bind(qiroFactory);
  let qiroFactoryEntity = QiroFactory.load(qiroFactory);
  if (qiroFactoryEntity) {
    qiroFactoryEntity.poolCount = factory.poolCount();
    qiroFactoryEntity.save();
  }
}