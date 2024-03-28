import {
  Deny as DenyEvent,
  PoolCreated as PoolCreatedEvent,
  PoolDeployed as PoolDeployedEvent,
  Rely as RelyEvent
} from "../generated/QiroFactory/QiroFactory"
import { Deny, PoolCreated, PoolDeployed, Rely } from "../generated/schema"

export function handleDeny(event: DenyEvent): void {
  let entity = new Deny(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.usr = event.params.usr

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePoolCreated(event: PoolCreatedEvent): void {
  let entity = new PoolCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.QiroFactory_id = event.params.id
  entity.deployer = event.params.deployer
  entity.root = event.params.root
  entity.LenderDeployer = event.params.LenderDeployer
  entity.borrowerDeployer = event.params.borrowerDeployer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePoolDeployed(event: PoolDeployedEvent): void {
  let entity = new PoolDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.QiroFactory_id = event.params.id
  entity.seniorRate = event.params.seniorRate
  entity.interestRate = event.params.interestRate
  entity.periodLength = event.params.periodLength
  entity.periodCount = event.params.periodCount
  entity.gracePeriod = event.params.gracePeriod
  entity.operator = event.params.operator
  entity.shelf = event.params.shelf

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRely(event: RelyEvent): void {
  let entity = new Rely(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.usr = event.params.usr

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
