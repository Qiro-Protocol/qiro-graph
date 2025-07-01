import {
  Supply as SupplyEvent,
  Redeem as RedeemEvent,
} from "../../generated/templates/Operator/TrustOperator";
import { Tranche as TrancheContract } from "../../generated/QiroFactory/Tranche";
import { SupplyRedeem, Pool, Tranche, Lender, PoolAddresses } from "../../generated/schema";
import { Address, BigInt, ByteArray, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { crypto } from "@graphprotocol/graph-ts";
import { getPoolId, SupplyRedeemActionType, TrancheType } from "../util";
import { WhitelistOperator } from "../../generated/templates/Operator/WhitelistOperator";
import { ONE } from "../util";

export function handleSupply(event: SupplyEvent): void {
  let entity = new SupplyRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pool = getPoolId(event.params.poolId);
  entity.tranche = event.params.tranche;
  entity.supplierOrReciever = event.params.supplier;
  entity.currencyAmount = event.params.amount;
  entity.tokenAmount = event.params.amount;
  entity.price = ONE;
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
  let lenderId = getLenderId(lenderAddress, trancheAddress, poolId);
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
  updateLenderStats(Address.fromBytes(lenderAddress), Address.fromBytes(trancheAddress), poolId);
}

function updateLenderStats(lenderAddress: Address, trancheAddress: Address, poolId: BigInt): void {
  let lender = Lender.load(getLenderId(lenderAddress, trancheAddress, poolId));
  let poolAddresses = PoolAddresses.load(getPoolId(poolId));
  let operator = WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator));
  // get tranche and figure out it's type
  let tranche = Tranche.load(trancheAddress);
  if (tranche!.trancheType == TrancheType.JUNIOR) {
    lender!.currencySupplied = operator.tokenReceivedJunior(lenderAddress);
    lender!.tokensRedeem = operator.tokenRedeemedJunior(lenderAddress);
    lender!.currencyRedeemed = operator.currencyRedeemedJunior(lenderAddress);
  } else if (tranche!.trancheType == TrancheType.SENIOR) {
    lender!.currencySupplied = operator.tokenReceivedSenior(lenderAddress);
    lender!.tokensRedeem = operator.tokenRedeemedSenior(lenderAddress);
    lender!.currencyRedeemed = operator.currencyRedeemedSenior(lenderAddress);
  }
  lender!.save();
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

  updateLenderStats(
    event.params.receiver,
    event.params.tranche,
    event.params.poolId
  )
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

function getLenderId(
  lenderAddress: Bytes,
  trancheAddress: Bytes,
  poolId: BigInt
): Bytes {
  return Bytes.fromHexString(
    lenderAddress.toHexString().concat(poolId.toHexString()).concat(trancheAddress.toHexString())
  );
}