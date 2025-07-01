import {
  Supply as SupplyEvent,
  Redeem as RedeemEvent,
} from "../../generated/templates/Operator/TrustOperator";

import { SupplyRedeem, Pool, Tranche, Lender } from "../../generated/schema";
import { BigInt, ByteArray, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { crypto } from "@graphprotocol/graph-ts";
import { getPoolId, SupplyRedeemActionType } from "../util";

export function handleSupply(event: SupplyEvent): void {
  let entity = new SupplyRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.tranche = event.params.tranche;
  entity.supplierOrReciever = event.params.supplier;
  entity.currencyAmount = event.params.amount;
  entity.tokenAmount = event.params.amount;
  entity.price = BigInt.fromI32(1e27);
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

  // create lender entity if not exists
  createLenderEntity(
    event.params.supplier,
    event.params.tranche,
    event.params.poolId,
    event.block
  );
}

function createLenderEntity(lenderAddress: Bytes, trancheAddress: Bytes, poolId: BigInt, eventBlock: ethereum.Block): void {
  let lenderId = Bytes.fromHexString(lenderAddress.toHexString().concat(poolId.toHexString()).concat(trancheAddress.toHexString()));
  let lender = Lender.load(lenderId);
  if (lender == null) {
    lender = new Lender(lenderId);
    lender.address = lenderAddress;
    lender.tranche = trancheAddress;
    lender.pool = getPoolId(poolId);
    lender.blockTimestamp = eventBlock.timestamp;
    lender.blockNumber = eventBlock.number;
    lender.transactionHash = eventBlock.hash;
    lender.save();
  }
}

export function handleRedeem(event: RedeemEvent): void {
  let entity = new SupplyRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.tranche = event.params.tranche;
  entity.supplierOrReciever = event.params.receiver;
  entity.currencyAmount = event.params.currencyAmount;
  entity.tokenAmount = event.params.tokenAmount;
  entity.price = event.params.price;
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
