import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Deny,
  PoolCreated,
  PoolDeployed,
  Rely
} from "../generated/QiroFactory/QiroFactory"

export function createDenyEvent(usr: Address): Deny {
  let denyEvent = changetype<Deny>(newMockEvent())

  denyEvent.parameters = new Array()

  denyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )

  return denyEvent
}

export function createPoolCreatedEvent(
  id: BigInt,
  deployer: Address,
  root: Address,
  LenderDeployer: Address,
  borrowerDeployer: Address
): PoolCreated {
  let poolCreatedEvent = changetype<PoolCreated>(newMockEvent())

  poolCreatedEvent.parameters = new Array()

  poolCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  poolCreatedEvent.parameters.push(
    new ethereum.EventParam("deployer", ethereum.Value.fromAddress(deployer))
  )
  poolCreatedEvent.parameters.push(
    new ethereum.EventParam("root", ethereum.Value.fromAddress(root))
  )
  poolCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "LenderDeployer",
      ethereum.Value.fromAddress(LenderDeployer)
    )
  )
  poolCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "borrowerDeployer",
      ethereum.Value.fromAddress(borrowerDeployer)
    )
  )

  return poolCreatedEvent
}

export function createPoolDeployedEvent(
  id: BigInt,
  seniorRate: BigInt,
  interestRate: BigInt,
  periodLength: BigInt,
  periodCount: BigInt,
  gracePeriod: BigInt,
  operator: Address,
  shelf: Address
): PoolDeployed {
  let poolDeployedEvent = changetype<PoolDeployed>(newMockEvent())

  poolDeployedEvent.parameters = new Array()

  poolDeployedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "seniorRate",
      ethereum.Value.fromUnsignedBigInt(seniorRate)
    )
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "interestRate",
      ethereum.Value.fromUnsignedBigInt(interestRate)
    )
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "periodLength",
      ethereum.Value.fromUnsignedBigInt(periodLength)
    )
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "periodCount",
      ethereum.Value.fromUnsignedBigInt(periodCount)
    )
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "gracePeriod",
      ethereum.Value.fromUnsignedBigInt(gracePeriod)
    )
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  poolDeployedEvent.parameters.push(
    new ethereum.EventParam("shelf", ethereum.Value.fromAddress(shelf))
  )

  return poolDeployedEvent
}

export function createRelyEvent(usr: Address): Rely {
  let relyEvent = changetype<Rely>(newMockEvent())

  relyEvent.parameters = new Array()

  relyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )

  return relyEvent
}
