import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Borrow,
  Deny,
  Depend,
  Erc20Transfer,
  Filed,
  Mint,
  Redeem,
  Rely,
  Repay,
  Supply
} from "../generated//"

export function createBorrowEvent(
  usr: Address,
  currencyAmount: BigInt
): Borrow {
  let borrowEvent = changetype<Borrow>(newMockEvent())

  borrowEvent.parameters = new Array()

  borrowEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )
  borrowEvent.parameters.push(
    new ethereum.EventParam(
      "currencyAmount",
      ethereum.Value.fromUnsignedBigInt(currencyAmount)
    )
  )

  return borrowEvent
}

export function createDenyEvent(usr: Address): Deny {
  let denyEvent = changetype<Deny>(newMockEvent())

  denyEvent.parameters = new Array()

  denyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )

  return denyEvent
}

export function createDependEvent(contractName: Bytes, addr: Address): Depend {
  let dependEvent = changetype<Depend>(newMockEvent())

  dependEvent.parameters = new Array()

  dependEvent.parameters.push(
    new ethereum.EventParam(
      "contractName",
      ethereum.Value.fromFixedBytes(contractName)
    )
  )
  dependEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )

  return dependEvent
}

export function createErc20TransferEvent(
  erc20: Address,
  usr: Address,
  amount: BigInt
): Erc20Transfer {
  let erc20TransferEvent = changetype<Erc20Transfer>(newMockEvent())

  erc20TransferEvent.parameters = new Array()

  erc20TransferEvent.parameters.push(
    new ethereum.EventParam("erc20", ethereum.Value.fromAddress(erc20))
  )
  erc20TransferEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )
  erc20TransferEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return erc20TransferEvent
}

export function createFiledEvent(what: Bytes, value: BigInt): Filed {
  let filedEvent = changetype<Filed>(newMockEvent())

  filedEvent.parameters = new Array()

  filedEvent.parameters.push(
    new ethereum.EventParam("what", ethereum.Value.fromFixedBytes(what))
  )
  filedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return filedEvent
}

export function createMintEvent(usr: Address, amount: BigInt): Mint {
  let mintEvent = changetype<Mint>(newMockEvent())

  mintEvent.parameters = new Array()

  mintEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )
  mintEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return mintEvent
}

export function createRedeemEvent(
  usr: Address,
  currencyAmount: BigInt,
  tokenAmount: BigInt
): Redeem {
  let redeemEvent = changetype<Redeem>(newMockEvent())

  redeemEvent.parameters = new Array()

  redeemEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )
  redeemEvent.parameters.push(
    new ethereum.EventParam(
      "currencyAmount",
      ethereum.Value.fromUnsignedBigInt(currencyAmount)
    )
  )
  redeemEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmount",
      ethereum.Value.fromUnsignedBigInt(tokenAmount)
    )
  )

  return redeemEvent
}

export function createRelyEvent(usr: Address): Rely {
  let relyEvent = changetype<Rely>(newMockEvent())

  relyEvent.parameters = new Array()

  relyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )

  return relyEvent
}

export function createRepayEvent(usr: Address, currencyAmount: BigInt): Repay {
  let repayEvent = changetype<Repay>(newMockEvent())

  repayEvent.parameters = new Array()

  repayEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )
  repayEvent.parameters.push(
    new ethereum.EventParam(
      "currencyAmount",
      ethereum.Value.fromUnsignedBigInt(currencyAmount)
    )
  )

  return repayEvent
}

export function createSupplyEvent(
  usr: Address,
  currencyAmount: BigInt,
  tokenAmount: BigInt
): Supply {
  let supplyEvent = changetype<Supply>(newMockEvent())

  supplyEvent.parameters = new Array()

  supplyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )
  supplyEvent.parameters.push(
    new ethereum.EventParam(
      "currencyAmount",
      ethereum.Value.fromUnsignedBigInt(currencyAmount)
    )
  )
  supplyEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmount",
      ethereum.Value.fromUnsignedBigInt(tokenAmount)
    )
  )

  return supplyEvent
}
