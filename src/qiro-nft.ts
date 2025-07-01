import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  ConsumerContractUpdated as ConsumerContractUpdatedEvent,
  Deny as DenyEvent,
  File as FileEvent,
  NFTMinted as NFTMintedEvent,
  Rely as RelyEvent,
  Transfer as TransferEvent,
  UpdateNftData as UpdateNftDataEvent,
  QiroNft,
} from "../generated/QiroNFT/QiroNFT"
import {
  ConsumerContractUpdated,
  Deny,
  File,
  NFTMinted,
  Rely,
  Transfer,
  UpdateNftData,
} from "../generated/schema"

export function handleConsumerContractUpdated(
  event: ConsumerContractUpdatedEvent,
): void {
  let entity = new ConsumerContractUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.oldConsumer = event.params.oldConsumer
  entity.newConsumer = event.params.newConsumer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeny(event: DenyEvent): void {
  let entity = new Deny(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.usr = event.params.usr

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFile(event: FileEvent): void {
  let entity = new File(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.what = event.params.what
  entity.tokenId = event.params.tokenId
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNFTMinted(event: NFTMintedEvent): void {
  let entity = new NFTMinted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.name = event.params.name
  entity.desc = event.params.desc
  entity.imageURI = event.params.imageURI
  entity.portfolioID = event.params.portfolioID
  entity.noOfLoans = event.params.noOfLoans
  entity.totalPrincipalAmount = event.params.totalPrincipalAmount
  entity.averageInterestRate = event.params.averageInterestRate
  entity.portfolioTerm = event.params.portfolioTerm
  entity.portfolioStatus = event.params.portfolioStatus
  entity.writedown = event.params.writedown
  entity.writeoff = event.params.writeoff
  entity.maturityDate = event.params.maturityDate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // read from the contract
  let contract = QiroNft.bind(event.address)
  let arweaveData = contract.getArweave(event.params.tokenId)
  entity.arweaveId = arweaveData;
  entity.nftContractAddress = event.address;

  entity.save()
}

export function handleRely(event: RelyEvent): void {
  let entity = new Rely(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.usr = event.params.usr

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdateNftData(event: UpdateNftDataEvent): void {
  let entity = new UpdateNftData(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.tokenId = event.params.tokenId
  entity.prob_of_default = event.params.prob_of_default
  entity.loss_given_default = event.params.loss_given_default
  entity.risk_score = event.params.risk_score
  entity.exposure_at_default = event.params.exposure_at_default

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
