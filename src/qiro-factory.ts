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
  Pool,
  PoolDeployed,
  Tranche,
  Transaction,
  User,
} from "../generated/schema";
import { Operator } from "../generated/templates";
import { WhitelistOperator } from "../generated/templates/Operator/WhitelistOperator";
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
  // todo - index the and shelf
  Operator.create(event.params.operator);
}

function handlePool(pool: PoolDeployed): void {
  // Start
  let pID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(pool.poolId))
  );
  let entity = new Pool(pID);
  let seniorTranche = new Tranche(pool.shelf);
  let juniorTranche = new Tranche(pool.operator);

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
  entity.principalRepaid = new BigInt(0);
  entity.interestRepaid = new BigInt(0);
  entity.loanTerm = pool.periodLength.times(pool.periodCount);
  entity.loanMaturityTimestamp = pool.blockTimestamp.plus(entity.loanTerm);
  entity.capitalFormationPeriod = new BigInt(60 * 60 * 24 * 10); // 7 days
  entity.capitalFormationPeriodEnd = pool.blockTimestamp.plus(
    entity.capitalFormationPeriod
  );
  entity.lenders = []
  entity.borrowers = []
  // @Todo
  entity.poolStatus = "CAPITAL_FORMATION";

  entity.blockNumber = pool.blockNumber;
  entity.blockTimestamp = pool.blockTimestamp;
  entity.transactionHash = pool.transactionHash;
  entity.save();

  // let operator =  WhitelistOperator.bind(pool.operator)
  // let juniorTranch = operator.junior();
  // let seniorTranch = operator.senior();

  juniorTranche.poolId = pool.poolId;
  juniorTranche.trancheType = "JUNIOR";
  juniorTranche.totalTokenSupply = new BigInt(0);
  juniorTranche.totalBalance = new BigInt(0);
  juniorTranche.trancheAddress = new Address(0);
  juniorTranche.tokenAddress = new Address(0);
  juniorTranche.tokenPrice = new BigInt(1);
  juniorTranche.blockTimestamp = pool.blockTimestamp;
  juniorTranche.save();

  seniorTranche.poolId = pool.poolId;
  seniorTranche.trancheType = "SENIOR";
  seniorTranche.totalTokenSupply = new BigInt(0);
  seniorTranche.totalBalance = new BigInt(0);
  seniorTranche.trancheAddress = new Address(0);
  seniorTranche.tokenAddress = new Address(0);
  seniorTranche.tokenPrice = new BigInt(1);
  seniorTranche.blockTimestamp = pool.blockTimestamp;
  seniorTranche.save();
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
