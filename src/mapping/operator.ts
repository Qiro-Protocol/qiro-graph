import {
  Supply1 as SupplyOperatorEvent,
  Redeem1 as RedeemOperatorEvent,
  UpdatedPoolState as UpdatedPoolStateEvent,
} from "../../generated/templates/Operator/WhitelistOperator";

import { Supply, Redeem, Pool, Tranche, User, UserPool, WhitelistOperatorToPoolIdMapping } from "../../generated/schema";
import { BigInt, bigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import { crypto, store } from "@graphprotocol/graph-ts";
import { createTxnAndUpdateUser } from "../qiro-factory";

export function handleSupply(event: SupplyOperatorEvent): void {
  let entity = new Supply(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.supplier = event.params.supplier;
  entity.currencyAmount = event.params.amount;
  entity.totalPoolBalance = event.params.totalPoolBalance;
  entity.juniorPoolBalance = event.params.juniorPoolBalance;
  entity.seniorPoolBalance = event.params.seniorPoolBalance;
  entity.poolId = event.params.poolId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.save();

  updatePoolBalance(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );
  let type =
    event.params.tranche == "senior" ? "SENIOR_DEPOSIT" : "JUNIOR_DEPOSIT";
  createTxnAndUpdateUser(
    type,
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.amount
  );

  let pID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.poolId))
  );
  let pool = Pool.load(pID);
  let user = User.load(event.transaction.from);
  user!.isLender = true;

  let uPool = UserPool.load(pID.concat(event.transaction.from));
  if (uPool == null) {
    let userPool = new UserPool(pID.concat(event.transaction.from));
    userPool.lendedPool = pID;
    userPool.user = event.transaction.from;
    userPool.save();
  }
  // uPool.amountLended += event.params.amount;

  user!.totalLended = user!.totalLended.plus(event.params.amount);
  user!.save();
}

export function handleRedeem(event: RedeemOperatorEvent): void {
  let entity = new Redeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tranche = event.params.tranche;
  entity.receiver = event.params.receiver;
  entity.tokenAmount = event.params.tokenAmount;
  entity.currencyAmount = event.params.currencyAmount;
  entity.totalPoolBalance = event.params.totalPoolBalance;
  entity.juniorPoolBalance = event.params.juniorPoolBalance;
  entity.seniorPoolBalance = event.params.seniorPoolBalance;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.poolId = event.params.poolId;
  entity.save();

  updatePoolBalance(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );

  createTxnAndUpdateUser(
    event.params.tranche == "senior" ? "SENIOR_REDEEM" : "JUNIOR_REDEEM",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.currencyAmount
  );

  let user = User.load(event.transaction.from);
  user!.totalLended = user!.totalLended.minus(event.params.currencyAmount);
  user!.save();
}

function updatePoolBalance(
  poolId: BigInt,
  total: BigInt,
  junior: BigInt,
  senior: BigInt
): void {
  // todo - update pool entity
  let pID = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromBigInt(poolId)));
  let pool = Pool.load(pID);
  if (pool == null) {
    log.error("unable to get pool to update pool balane: {}", [poolId.toHexString()]);
    return;
  }
  pool.totalBalance = total;
  let seniorTranche = Tranche.load(pool.seniorTranche);
  let juniorTranche = Tranche.load(pool.juniorTranche);
  if (seniorTranche == null || juniorTranche == null) {
    log.error("unable to get either junior or senior tranche: {}", [poolId.toHexString()]);
    return;
  }
  seniorTranche.totalBalance = senior;
  juniorTranche.totalBalance = junior;

  // @Todo totalTokenSupply and tokenPrice change too
  pool.save();
  seniorTranche.save();
  juniorTranche.save();
}

export function handleUpdatedPoolState(event: UpdatedPoolStateEvent): void {
  // get pool id from WhitelistOperatorToPoolIdMapping
  let mapping = WhitelistOperatorToPoolIdMapping.load(event.address);
  if (mapping == null) {
    log.error("missing WhitelistOperatorToPoolIdMapping for operator: {}", [event.address.toHexString()]);
    return;
  }

  let pool = Pool.load(mapping.poolId);
  if (pool == null) {
    log.error("missing pool for poll status update: {}", [mapping.poolId.toHexString()]);
    return;
  }
  pool.poolStatus = getPoolStatusString(event.params.state);
  pool.save();
}

function getPoolStatusString(poolStatus: i32): string {
  switch (poolStatus) {
    case 0:
      return "CAPITAL_FORMATION";
    case 1:
      return "PENDING";
    case 2:
      return "ACTIVE";
    case 3:
      return "REVOKED";
    case 4:
      return "PARTIAL_REDEEM";
    case 5:
      return "REDEEM";
    case 6:
      return "ENDED";
    default:
      return "UNKNOWN";
  }
}