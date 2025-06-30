import {
  Supply as SupplyEvent,
  Redeem as RedeemEvent,
} from "../../generated/templates/Operator/TrustOperator";

import { SupplyRedeem, Pool, Tranche, User, UserPool } from "../../generated/schema";
import { BigInt, bigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import { crypto, store } from "@graphprotocol/graph-ts";
import { createTxnAndUpdateUser } from "../qiro-factory";
import { getPoolId, SupplyRedeemActionType } from "../util";

export function handleSupply(event: SupplyEvent): void {
  let entity = new SupplyRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.tranche = event.params.tranche;
  entity.supplierOrReciever = event.params.supplier;
  entity.tokenAmount = event.params.amount;
  entity.currencyAmount = event.params.amount;
  entity.totalPoolBalance = event.params.totalPoolBalance;
  entity.juniorPoolBalance = event.params.juniorPoolBalance;
  entity.seniorPoolBalance = event.params.seniorPoolBalance;
  entity.actionType = SupplyRedeemActionType.SUPPLY;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  updatePoolBalance(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );

  createTxnAndUpdateUser(
    entity.actionType,
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.transaction.value,
    event.params.amount
  );

  let pID = getPoolId(event.params.poolId);
  let user = User.load(event.transaction.from);
  user!.isLender = true;

  let uPool = UserPool.load(pID.concat(event.transaction.from));
  if (uPool == null) {
    let userPool = new UserPool(pID.concat(event.transaction.from));
    userPool.lendedPool = pID;
    userPool.user = event.transaction.from;
    userPool.save();
  }

  user!.totalLended = user!.totalLended.plus(event.params.amount);
  user!.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let entity = new SupplyRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.tranche = event.params.tranche;
  entity.supplierOrReciever = event.params.receiver;
  entity.tokenAmount = event.params.tokenAmount;
  entity.currencyAmount = event.params.currencyAmount;
  entity.totalPoolBalance = event.params.totalPoolBalance;
  entity.juniorPoolBalance = event.params.juniorPoolBalance;
  entity.seniorPoolBalance = event.params.seniorPoolBalance;
  entity.actionType = SupplyRedeemActionType.REDEEM;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  updatePoolBalance(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );

  createTxnAndUpdateUser(
    entity.actionType,
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
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  pool.totalBalance = total;
  let seniorTranche = Tranche.load(Bytes.fromHexString(pool.seniorTranche._id));
  let juniorTranche = Tranche.load(Bytes.fromHexString(pool.juniorTranche._id));
  if (seniorTranche == null || juniorTranche == null) {
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  seniorTranche.totalBalance = senior;
  juniorTranche.totalBalance = junior;

  // @Todo totalTokenSupply and tokenPrice change too
  pool.save();
  seniorTranche.save();
  juniorTranche.save();
}
