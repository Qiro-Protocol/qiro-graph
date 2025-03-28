import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  PoolCreated as PoolCreatedEvent,
  PoolDeployed as PoolDeployedEvent,
} from "../generated/QiroFactory/QiroFactory";
import {
  BorrowerPool,
  Pool,
  PoolDeployed,
  Transaction,
  Tranche,
  User,
} from "../generated/schema";
import { Operator, Shelf } from "../generated/templates";
import { WhitelistOperator } from "../generated/templates/Operator/WhitelistOperator";
import { Shelf as ShelfContract } from "../generated/templates/Shelf/Shelf";
import { Tranche as TrancheContract } from "../generated/QiroFactory/Tranche";
import { ERC20 } from "../generated/QiroFactory/ERC20";
import { crypto, store } from "@graphprotocol/graph-ts";
import { getUser } from "./util";

export function handlePoolDeployed(event: PoolDeployedEvent): void {
  let entity = new PoolDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.id;
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
  handlePool(entity as PoolDeployed);

  Operator.create(event.params.operator);
  Shelf.create(event.params.shelf);
}

function handlePool(pool: PoolDeployed): void {
  // Start
  let pID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(pool.poolId))
  );
  let entity = new Pool(pID);
  let seniorTranche = new Tranche(pool.shelf);
  let juniorTranche = new Tranche(pool.operator);

  let operator = WhitelistOperator.bind(Address.fromBytes(pool.operator));
  let shelfContract = ShelfContract.bind(Address.fromBytes(pool.shelf));
  entity.poolId = pool.poolId;
  entity.operator = pool.operator;
  entity.shelf = pool.shelf;
  entity.seniorTranche = seniorTranche.id;
  entity.juniorTranche = juniorTranche.id;
  entity.seniorRate = pool.seniorRate;
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
  // @Todo
  entity.poolStatus = "CAPITAL_FORMATION";

  entity.blockNumber = pool.blockNumber;
  entity.blockTimestamp = pool.blockTimestamp;
  entity.transactionHash = pool.transactionHash;
  entity.save();


  let juniorTranch = operator.junior();
  let seniorTranch = operator.senior();
  let junTrancheContract = TrancheContract.bind(Address.fromBytes(juniorTranch));
  let junTokenContract = ERC20.bind(junTrancheContract.token());
  let senTokenContract = ERC20.bind(operator.seniorToken());

  juniorTranche.poolId = pool.poolId;
  juniorTranche.trancheType = "JUNIOR";
  juniorTranche.totalTokenSupply = new BigInt(0);
  juniorTranche.totalBalance = new BigInt(0);
  juniorTranche.trancheAddress = juniorTranch;
  juniorTranche.tokenAddress = junTrancheContract.token();
  juniorTranche.tokenPrice = new BigInt(1);
  juniorTranche.tokenName = junTokenContract.name();
  juniorTranche.tokenSymbol = junTokenContract.symbol();
  juniorTranche.blockTimestamp = pool.blockTimestamp;
  juniorTranche.save();

  seniorTranche.poolId = pool.poolId;
  seniorTranche.trancheType = "SENIOR";
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
  let userPool = new BorrowerPool(pID.concat(shelfContract.borrower()));
  userPool.borrowedPool = pID;
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
