import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  ConsumerContractUpdated,
  Deny,
  File,
  NFTMinted,
  Rely,
  Transfer,
  UpdateNftData
} from "../generated//"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createConsumerContractUpdatedEvent(
  oldConsumer: Address,
  newConsumer: Address
): ConsumerContractUpdated {
  let consumerContractUpdatedEvent = changetype<ConsumerContractUpdated>(
    newMockEvent()
  )

  consumerContractUpdatedEvent.parameters = new Array()

  consumerContractUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldConsumer",
      ethereum.Value.fromAddress(oldConsumer)
    )
  )
  consumerContractUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newConsumer",
      ethereum.Value.fromAddress(newConsumer)
    )
  )

  return consumerContractUpdatedEvent
}

export function createDenyEvent(usr: Address): Deny {
  let denyEvent = changetype<Deny>(newMockEvent())

  denyEvent.parameters = new Array()

  denyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )

  return denyEvent
}

export function createFileEvent(
  what: Bytes,
  tokenId: BigInt,
  value: BigInt
): File {
  let fileEvent = changetype<File>(newMockEvent())

  fileEvent.parameters = new Array()

  fileEvent.parameters.push(
    new ethereum.EventParam("what", ethereum.Value.fromFixedBytes(what))
  )
  fileEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  fileEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return fileEvent
}

export function createNFTMintedEvent(
  to: Address,
  tokenId: BigInt,
  name: string,
  desc: string,
  imageURI: string,
  portfolioID: string,
  noOfLoans: BigInt,
  totalPrincipalAmount: BigInt,
  averageInterestRate: BigInt,
  portfolioTerm: string,
  portfolioStatus: string,
  writedown: BigInt,
  writeoff: BigInt,
  maturityDate: string
): NFTMinted {
  let nftMintedEvent = changetype<NFTMinted>(newMockEvent())

  nftMintedEvent.parameters = new Array()

  nftMintedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam("desc", ethereum.Value.fromString(desc))
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam("imageURI", ethereum.Value.fromString(imageURI))
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "portfolioID",
      ethereum.Value.fromString(portfolioID)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "noOfLoans",
      ethereum.Value.fromUnsignedBigInt(noOfLoans)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "totalPrincipalAmount",
      ethereum.Value.fromUnsignedBigInt(totalPrincipalAmount)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "averageInterestRate",
      ethereum.Value.fromUnsignedBigInt(averageInterestRate)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "portfolioTerm",
      ethereum.Value.fromString(portfolioTerm)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "portfolioStatus",
      ethereum.Value.fromString(portfolioStatus)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "writedown",
      ethereum.Value.fromUnsignedBigInt(writedown)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "writeoff",
      ethereum.Value.fromUnsignedBigInt(writeoff)
    )
  )
  nftMintedEvent.parameters.push(
    new ethereum.EventParam(
      "maturityDate",
      ethereum.Value.fromString(maturityDate)
    )
  )

  return nftMintedEvent
}

export function createRelyEvent(usr: Address): Rely {
  let relyEvent = changetype<Rely>(newMockEvent())

  relyEvent.parameters = new Array()

  relyEvent.parameters.push(
    new ethereum.EventParam("usr", ethereum.Value.fromAddress(usr))
  )

  return relyEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createUpdateNftDataEvent(
  tokenId: BigInt,
  prob_of_default: BigInt,
  loss_given_default: BigInt,
  risk_score: BigInt,
  exposure_at_default: BigInt
): UpdateNftData {
  let updateNftDataEvent = changetype<UpdateNftData>(newMockEvent())

  updateNftDataEvent.parameters = new Array()

  updateNftDataEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  updateNftDataEvent.parameters.push(
    new ethereum.EventParam(
      "prob_of_default",
      ethereum.Value.fromUnsignedBigInt(prob_of_default)
    )
  )
  updateNftDataEvent.parameters.push(
    new ethereum.EventParam(
      "loss_given_default",
      ethereum.Value.fromUnsignedBigInt(loss_given_default)
    )
  )
  updateNftDataEvent.parameters.push(
    new ethereum.EventParam(
      "risk_score",
      ethereum.Value.fromUnsignedBigInt(risk_score)
    )
  )
  updateNftDataEvent.parameters.push(
    new ethereum.EventParam(
      "exposure_at_default",
      ethereum.Value.fromUnsignedBigInt(exposure_at_default)
    )
  )

  return updateNftDataEvent
}
