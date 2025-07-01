import {
  Address,
  BigInt,
  Bytes,
} from "@graphprotocol/graph-ts";
import {
  PoolDeployed as PoolDeployedEvent,
} from "../generated/QiroFactory/QiroFactory";
import {
  BorrowerPool,
  Pool,
  PoolDeployed,
  Transaction,
  Tranche,
  PoolAddresses,
  PoolCurrency,
} from "../generated/schema";
import { Operator, Shelf } from "../generated/templates";
import { WhitelistOperator } from "../generated/templates/Operator/WhitelistOperator";
import { Shelf as ShelfContract } from "../generated/templates/Shelf/Shelf";
import { Tranche as TrancheContract } from "../generated/QiroFactory/Tranche";
import { ERC20 } from "../generated/QiroFactory/ERC20";
import { getUser, getPoolId, PoolStatus, TrancheType } from "./util";
import { FactoryCreated, QiroFactory as QiroFactoryContract } from "../generated/QiroFactory/QiroFactory";
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

  createTxnAndUpdateUser(
    "POOL_CREATED",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    new BigInt(0)
  );
  handlePool(entity as PoolDeployed, event.params.poolId, event.address);

  Operator.create(event.params.operator);
  Shelf.create(event.params.shelf);
}

function handlePool(pool: PoolDeployed, poolId: BigInt, qiroFactory: Address): void {
  // Start
  let entity = new Pool(pool.pool); // event.poolId in bytes
  let poolAddresses = new PoolAddresses(pool.pool);

  let operator = WhitelistOperator.bind(Address.fromBytes(pool.operator));
  let shelfContract = ShelfContract.bind(Address.fromBytes(pool.shelf));
  let factory = QiroFactoryContract.bind(qiroFactory);

  entity.operator = pool.operator;
  entity.seniorInterestRate = pool.seniorRate;
  entity.interestRate = pool.interestRate;
  entity.periodLength = pool.periodLength;
  entity.periodCount = pool.periodCount;
  entity.gracePeriod = pool.gracePeriod;
  entity.totalBalance = new BigInt(0);
  entity.startTimestamp = pool.blockTimestamp;
  entity.loanMaturityTimestamp = pool.blockTimestamp.plus(
    pool.periodLength.times(pool.periodCount)
  );
  entity.totalRepaid = new BigInt(0);
  entity.nextExpectedRepayment = new BigInt(0);
  entity.principalRepaid = new BigInt(0);
  entity.interestRepaid = new BigInt(0);
  entity.loanTerm = pool.periodLength.times(pool.periodCount);
  entity.loanMaturityTimestamp = pool.blockTimestamp.plus(entity.loanTerm);
  entity.capitalFormationPeriod = operator.capitalFormationPeriod(); // 7 days
  entity.capitalFormationPeriodEnd = operator.capitalFormationEnd();
  entity.principalAmount = shelfContract.principalAmount();
  // @Todo
  entity.poolStatus = PoolStatus.CAPITAL_FORMATION; // enum

  entity.blockNumber = pool.blockNumber;
  entity.blockTimestamp = pool.blockTimestamp;
  entity.transactionHash = pool.transactionHash;
  entity.save();

  let qiroFactoryCurrency = factory.currency();
  let qiroFactoryCurrencyBind = ERC20.bind(qiroFactoryCurrency);
  let juniorTranch = operator.junior();
  let seniorTranch = operator.senior();
  let factoryPool = factory.pools(poolId);

  let poolCurrency = new PoolCurrency(qiroFactoryCurrency);
  poolCurrency.pool = pool.pool;
  poolCurrency.currencyAddress = qiroFactoryCurrency;
  poolCurrency.currencySymbol = qiroFactoryCurrencyBind.symbol();
  poolCurrency.currencyDecimals = qiroFactoryCurrencyBind.decimals();
  poolCurrency.save();

  poolAddresses.pool = pool.pool;
  poolAddresses.shelf = pool.shelf;
  poolAddresses.operator = pool.operator;
  poolAddresses.trustOperator = operator.trustOperator();
  poolAddresses.juniorTranche = juniorTranch;
  poolAddresses.seniorTranche = seniorTranch;
  poolAddresses.lenderDeployer = factoryPool.getLenderDeployer();
  poolAddresses.borrowerDeployer = factoryPool.getBorrowerDeployer();
  poolAddresses.admin = factoryPool.getPoolAdmin();
  poolAddresses.currency = qiroFactoryCurrency;
  poolAddresses.seniorToken = operator.seniorToken();
  poolAddresses.juniorToken = operator.juniorToken();
  poolAddresses.root = factoryPool.getRoot();
  poolAddresses.save();

  let junTrancheContract = TrancheContract.bind(Address.fromBytes(juniorTranch));
  let junTokenContract = ERC20.bind(junTrancheContract.token());
  let senTokenContract = ERC20.bind(operator.seniorToken());

  let seniorTranche = new Tranche(seniorTranch);
  let juniorTranche = new Tranche(juniorTranch);

  juniorTranche.pool = pool.pool;
  juniorTranche.trancheType = TrancheType.JUNIOR;
  juniorTranche.totalTokenSupply = new BigInt(0);
  juniorTranche.totalBalance = new BigInt(0);
  juniorTranche.trancheAddress = juniorTranch;
  juniorTranche.tokenAddress = junTrancheContract.token();
  juniorTranche.tokenPrice = new BigInt(1);
  juniorTranche.tokenName = junTokenContract.name();
  juniorTranche.tokenSymbol = junTokenContract.symbol();
  juniorTranche.blockTimestamp = pool.blockTimestamp;
  juniorTranche.save();

  seniorTranche.pool = pool.pool;
  seniorTranche.trancheType = TrancheType.SENIOR;
  seniorTranche.totalTokenSupply = new BigInt(0);
  seniorTranche.totalBalance = new BigInt(0);
  seniorTranche.trancheAddress = seniorTranch;
  seniorTranche.tokenAddress = operator.seniorToken();
  seniorTranche.tokenPrice = new BigInt(1);
  seniorTranche.tokenName = senTokenContract.name();
  seniorTranche.tokenSymbol = senTokenContract.symbol();
  seniorTranche.blockTimestamp = pool.blockTimestamp;
  seniorTranche.save();

  let user = getUser(shelfContract.borrower());
  user.isBorrower = true;
  user.save();
  // map pool and borrower, for user to
  let userPool = new BorrowerPool(pool.pool.concat(shelfContract.borrower()));
  userPool.borrowedPool = pool.pool;
  userPool.user = shelfContract.borrower();
  userPool.save();
}

export function createNewTransaction(
  name: string,
  from: Address,
  hash: Bytes,
  timestamp: BigInt,
  amount: BigInt,
  amountUSDC: BigInt
): Transaction {
  const Txn = new Transaction(hash);
  Txn.amountUSDC = amountUSDC;
  Txn.amount = amount;
  Txn.timestamp = timestamp;
  Txn.from = from;
  Txn.name = name;
  Txn.hash = hash;
  Txn.save();
  return Txn;
}

export function createTxnAndUpdateUser(
  name: string,
  from: Address,
  hash: Bytes,
  timestamp: BigInt,
  amount: BigInt,
  amountUSDC: BigInt
): void {
  const txn = createNewTransaction(
    name,
    from,
    hash,
    timestamp,
    amount,
    amountUSDC
  );
  const user = getUser(from);
  user.transactionHistory.push(hash);
  user.save();
}
