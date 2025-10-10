import { Reserve, Withdraw as WithdrawEvent, Supply as SupplyEvent, DepositEIS as DepositEISEvent } from "../../generated/QiroFactory/Reserve";
import { PoolType } from "../util";
import { getPool } from "./shelf";
import { BigInt, Address } from "@graphprotocol/graph-ts";

export function updateEisAndReserveBalance(poolId: BigInt, reserve: Address): void {
  updateEisBalance(poolId, reserve);
  updateReserveBalance(poolId, reserve);
}

export function updateEisBalance(poolId: BigInt, reserve: Address): void {
  let reserveContract = Reserve.bind(reserve);
  let pool = getPool(poolId);
  if (pool!.poolType == PoolType.SECURITISATION) {
    pool!.eisBalance = reserveContract.eisBalance();
    pool!.save();
  }
}

export function updateReserveBalance(poolId: BigInt, reserve: Address): void {
  let reserveContract = Reserve.bind(reserve);
  let pool = getPool(poolId);
  // note: this will reflect new borrower balance incase borrower changes
  pool!.reserveBalance = reserveContract.balances(Address.fromBytes(pool!.borrower));
  pool!.save();
}

export function handleReserveEisDeposit(event: DepositEISEvent): void {
  // update pool reserve and eis balance
  updateEisBalance(event.params.poolId, event.address);
}

export function handleReserveWithdraw(event: WithdrawEvent): void {
  // update pool reserve and eis balance
  updateEisAndReserveBalance(event.params.poolId, event.address);
}

export function handleReserveSupply(event: SupplyEvent): void {
  // update pool reserve and eis balance
  updateReserveBalance(event.params.poolId, event.address);
}