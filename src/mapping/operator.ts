import {
  Supply as SupplyEvent,
  Redeem as RedeemEvent,
} from "../../generated/templates/Operator/TrustOperator";
import { Tranche as TrancheContract } from "../../generated/QiroFactory/Tranche";
import { WhitelistOperator as WhitelistOperatorContract } from "../../generated/QiroFactory/WhitelistOperator";
import { SupplyRedeem, Pool, Tranche, Lender, PoolAddresses, Transaction } from "../../generated/schema";
import { Address, BigInt, ByteArray, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { crypto } from "@graphprotocol/graph-ts";
import { getPoolId, SupplyRedeemActionType, TrancheType, TransactionType, TrancheTypeWithPool } from "../util";
import { WhitelistOperator } from "../../generated/templates/Operator/WhitelistOperator";
import { ONE } from "../util";
import { ERC20 } from "../../generated/QiroFactory/ERC20";

export function handleSupply(event: SupplyEvent): void {
  log.info("Handling supply event for pool: {}", [event.params.poolId.toString()]);
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

  updatePoolAndTranche(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );

  // create lender entity if not exists
  createOrUpdateLenderEntity(
    Address.fromBytes(event.params.supplier),
    event.params.tranche,
    event.params.poolId,
    event.block
  );

  createSupplyTransaction(event);
  log.info("Supply event handled for pool: {}", [event.params.poolId.toString()]);
}

function createOrUpdateLenderEntity(lenderAddress: Address, trancheAddress: Bytes, poolId: BigInt, eventBlock: ethereum.Block): void {
  log.warning("Creating or updating lender entity for address: {}, tranche: {}, poolId: {}", [
    lenderAddress.toHexString(),
    trancheAddress.toHexString(),
    poolId.toString()
  ]);
  let lenderId = getLenderId(lenderAddress, trancheAddress, poolId);
  log.warning("Lender ID: {}", [lenderId.toHexString()]);
  let lender = Lender.load(lenderId);
  if (lender == null) {
    log.warning("Creating new lender entity: {}", [lenderId.toHexString()]);
    lender = new Lender(lenderId);
    lender.address = lenderAddress;
    lender.tranche = trancheAddress;
    lender.pool = getPoolId(poolId);
    lender.blockTimestamp = eventBlock.timestamp;
    lender.blockNumber = eventBlock.number;
    lender.transactionHash = eventBlock.hash;
    lender.save();
    log.info("Created new lender entity: {}", [lender.id.toHexString()]);
  }
  updateLenderStats(Address.fromBytes(lenderAddress), Address.fromBytes(trancheAddress), poolId);
}

function updateLenderStats(lenderAddress: Address, trancheAddress: Address, poolId: BigInt): void {
  log.info("Updating lender stats for address: {}, tranche: {}, poolId: {}", [
    lenderAddress.toHexString(),
    trancheAddress.toHexString(),
    poolId.toString()
  ]);
  let lender = Lender.load(getLenderId(lenderAddress, trancheAddress, poolId));
  log.info("Lender entity: {}", [lender ? lender.id.toHexString() : "null"]);
  let poolAddresses = PoolAddresses.load(getPoolId(poolId));
  let operator = WhitelistOperator.bind(Address.fromBytes(poolAddresses!.operator));
  // get tranche and figure out it's type
  let tranche = Tranche.load(trancheAddress);
  if (tranche!.trancheType == TrancheType.JUNIOR) {
    let trancheTokenContract = ERC20.bind(Address.fromBytes(poolAddresses!.juniorToken))
    lender!.currencySupplied = operator.tokenReceivedJunior(lenderAddress);
    lender!.tokensRedeem = operator.tokenRedeemedJunior(lenderAddress);
    lender!.currencyRedeemed = operator.currencyRedeemedJunior(lenderAddress);
    lender!.trancheTokenBalance = trancheTokenContract.balanceOf(lenderAddress);
  } else if (tranche!.trancheType == TrancheType.SENIOR) {
    let trancheTokenContract = ERC20.bind(Address.fromBytes(poolAddresses!.seniorToken))
    lender!.currencySupplied = operator.tokenReceivedSenior(lenderAddress);
    lender!.tokensRedeem = operator.tokenRedeemedSenior(lenderAddress);
    lender!.currencyRedeemed = operator.currencyRedeemedSenior(lenderAddress);
    lender!.trancheTokenBalance = trancheTokenContract.balanceOf(lenderAddress);
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

  updatePoolAndTranche(
    event.params.poolId,
    event.params.totalPoolBalance,
    event.params.juniorPoolBalance,
    event.params.seniorPoolBalance
  );

  updateLenderStats(
    event.params.receiver,
    event.params.tranche,
    event.params.poolId
  );

  createRedeemTransaction(event);
  log.info("Redeem event handled for pool: {}", [event.params.poolId.toString()]);
}

function updatePoolAndTranche(
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

  let whitelistOperatorContract = WhitelistOperatorContract.bind(Address.fromBytes(pool.operator));

  pool.totalBalance = total;
  pool.trancheSupplyMaxBalance = whitelistOperatorContract.totalDepositCurrencyJunior().plus(
    whitelistOperatorContract.totalDepositCurrencySenior()
  );

  let seniorTranche = Tranche.load(pool.seniorTranche);
  let juniorTranche = Tranche.load(pool.juniorTranche);
  if (seniorTranche == null || juniorTranche == null) {
    log.info("Message to be displayed: {}", [poolId.toHexString()]);
    return;
  }
  // senior
  let seniorContract = TrancheContract.bind(Address.fromBytes(pool.seniorTranche));
  seniorTranche.balance = senior;
  seniorTranche.totalTokenSupply = seniorContract.tokenSupply();
  seniorTranche.totalInvested = whitelistOperatorContract.totalDepositCurrencySenior();
  seniorTranche.totalRedeemed = whitelistOperatorContract.totalRedeemedCurrencySenior();
  seniorTranche.totalRepaid = seniorContract.totalRepayedAmount();

  // junior
  let juniorContract = TrancheContract.bind(Address.fromBytes(pool.juniorTranche));
  juniorTranche.balance = junior;
  juniorTranche.totalTokenSupply = juniorContract.tokenSupply();
  juniorTranche.totalInvested = whitelistOperatorContract.totalDepositCurrencyJunior();
  juniorTranche.totalRedeemed = whitelistOperatorContract.totalRedeemedCurrencyJunior();
  juniorTranche.totalRepaid = juniorContract.totalRepayedAmount();

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
  return Bytes.fromByteArray(crypto.keccak256(Bytes.fromHexString(
    lenderAddress.toHexString().concat(poolId.toHexString()).concat("-").concat(trancheAddress.toHexString())
  )));
}

function createSupplyTransaction(event: SupplyEvent): void {
  let entity = new Transaction(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.pool = getPoolId(event.params.poolId);
  entity.lenderOrBorrower = event.params.supplier;
  entity.amount = event.params.amount;
  entity.type = TransactionType.SUPPLY;
  entity.trancheType = getTrancheTypeFromAddress(event.params.tranche);
  entity.currency = getCurrencyFromPoolId(event.params.poolId);
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

function createRedeemTransaction(event: RedeemEvent): void {
  let entity = new Transaction(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.pool = getPoolId(event.params.poolId);
  entity.lenderOrBorrower = event.params.receiver;
  entity.amount = event.params.currencyAmount;
  entity.type = TransactionType.REDEEM;
  entity.trancheType = getTrancheTypeFromAddress(event.params.tranche);
  entity.currency = getCurrencyFromPoolId(event.params.poolId);
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function getCurrencyFromPoolId(poolId: BigInt): Bytes {
  let poolAddresses = PoolAddresses.load(getPoolId(poolId));
  if (poolAddresses == null) {
    log.error("Pool addresses not found for poolId: {}", [poolId.toString()]);
    return Bytes.empty();
  }
  return poolAddresses.currency;
}

function getTrancheTypeFromAddress(
  trancheAddress: Bytes
): string {
  let trancheContract = Tranche.load(trancheAddress);
  if (trancheContract == null) {
    log.error("Tranche contract not found for address: {}", [trancheAddress.toHexString()]);
    return "UNKNOWN";
  }
  if (trancheContract.trancheType == TrancheType.JUNIOR) {
    return TrancheTypeWithPool.JUNIOR;
  } else if (trancheContract.trancheType == TrancheType.SENIOR) {
    return TrancheTypeWithPool.SENIOR;
  }
  return TrancheTypeWithPool.POOL;
}