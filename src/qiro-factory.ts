import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  PoolCreated as PoolCreatedEvent,
  PoolDeployed as PoolDeployedEvent,
} from "../generated/QiroFactory/QiroFactory";
import { Pool, PoolCreated, PoolDeployed, Tranche } from "../generated/schema";
import { Operator } from "../generated/templates";
import { WhitelistOperator } from "../generated/templates/Operator/WhitelistOperator";
import { crypto, store } from "@graphprotocol/graph-ts";

export function handlePoolCreated(event: PoolCreatedEvent): void {
  let entity = new PoolCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.id;
  entity.deployer = event.params.deployer;
  entity.root = event.params.root;
  entity.LenderDeployer = event.params.LenderDeployer;
  entity.borrowerDeployer = event.params.borrowerDeployer;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

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
  handlePool(entity as PoolDeployed);
  // todo - index the and shelf
  Operator.create(event.params.operator);
}

function handlePool(pool: PoolDeployed): void {
  // Start
  let pID = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(pool.poolId)));
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
  // @Todo
  entity.poolStatus = "CAPITAL_FORMATION";

  entity.blockNumber = pool.blockNumber;
  entity.blockTimestamp = pool.blockTimestamp;
  entity.transactionHash = pool.transactionHash;
  entity.save();

  juniorTranche.poolId = pool.poolId;
  juniorTranche.trancheType = "JUNIOR";
  juniorTranche.totalTokenSupply = new BigInt(0);
  juniorTranche.totalBalance = new BigInt(0);
  juniorTranche.trancheAddress = pool.shelf;
  juniorTranche.tokenAddress = pool.shelf;
  juniorTranche.tokenPrice = new BigInt(1);
  juniorTranche.blockTimestamp = pool.blockTimestamp;
  juniorTranche.save();

  seniorTranche.poolId = pool.poolId;
  seniorTranche.trancheType = "SENIOR";
  seniorTranche.totalTokenSupply = new BigInt(0);
  seniorTranche.totalBalance = new BigInt(0);
  seniorTranche.trancheAddress = pool.shelf;
  seniorTranche.tokenAddress = pool.shelf;
  seniorTranche.tokenPrice = new BigInt(1);
  seniorTranche.blockTimestamp = pool.blockTimestamp;
  seniorTranche.save();
}
