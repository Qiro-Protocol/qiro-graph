import {
  Borrow as BorrowEvent,
  Filed as FiledEvent,
  Redeem as RedeemEvent,
  Repay as RepayEvent,
  Supply as SupplyEvent,
} from "../../generated/SeniorTranche/SeniorTranche"
import {
  UserBorrow,
  Filed,
  UserRedeem,
  UserRepay,
  UserSupply,
} from "../../generated/schema"

export function handleUserBorrow(event: BorrowEvent): void {
  let entity = new UserBorrow(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.usr = event.params.usr
  entity.currencyAmount = event.params.currencyAmount
  entity.tranche = event.address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFiled(event: FiledEvent): void {
  let entity = new Filed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.what = event.params.what
  entity.value = event.params.value
  entity.tranche = event.address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserRedeem(event: RedeemEvent): void {
  let entity = new UserRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.usr = event.params.usr
  entity.currencyAmount = event.params.currencyAmount
  entity.tokenAmount = event.params.tokenAmount
  entity.tranche = event.address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserRepay(event: RepayEvent): void {
  let entity = new UserRepay(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.usr = event.params.usr
  entity.currencyAmount = event.params.currencyAmount
  entity.tranche = event.address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserSupply(event: SupplyEvent): void {
  let entity = new UserSupply(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.usr = event.params.usr
  entity.currencyAmount = event.params.currencyAmount
  entity.tokenAmount = event.params.tokenAmount
  entity.tranche = event.address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
