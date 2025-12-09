import {
  ConsumerContractUpdated as ConsumerContractUpdatedEvent,
  Deny as DenyEvent,
  File as FileEvent,
  NFTMinted as NFTMintedEvent,
  Rely as RelyEvent,
  Transfer as TransferEvent,
  UpdateNftData as UpdateNftDataEvent,
  IdentityDealAssetLayerMetadataSet as IdentityDealAssetLayerMetadataSetEvent,
  ControlLayerMetadataSet as ControlLayerMetadataSetEvent,
  LegalLinkLayerMetadataSet as LegalLinkLayerMetadataSetEvent,
  PerfectionAndRegistryMetadataSet as PerfectionAndRegistryMetadataSetEvent,
  QiroNft,
} from "../generated/QiroNft/QiroNft";
import {
  ConsumerContractUpdated,
  Deny,
  File,
  NFTMinted,
  Rely,
  Transfer,
  UpdateNftData,
} from "../generated/schema";
import {
  ByteArray,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";

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
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.tokenId))
  )
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.name = event.params.name
  entity.desc = event.params.desc
  entity.imageURI = event.params.imageURI

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
  let nft = QiroNft.bind(event.address)
  let nftData = nft.tokenIdToData(event.params.tokenId);
  entity.tokenId = event.params.tokenId;
  entity.prob_of_default = nftData.value0;
  entity.loss_given_default = nftData.value1;
  entity.risk_score = nftData.value2;
  entity.exposure_at_default = nftData.value3;
  entity.interest_rate = nftData.value4;
  entity.nav = nftData.value5;
  entity.isUnderwritten = nftData.value6;

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save();
}

export function handleIdentityDealAssetLayerMetadataSet(
  event: IdentityDealAssetLayerMetadataSetEvent
): void {
  let nftMinted = NFTMinted.load(Bytes.fromByteArray(ByteArray.fromBigInt(event.params.tokenId)));
  if (nftMinted == null) {
    log.error("NFTMinted entity not found for tokenId {}", [
      event.params.tokenId.toString()
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToIdentityDealAssetLayerMetadata(
    event.params.tokenId
  );

  nftMinted.issuerName = metadataStruct.getIssuerName();
  nftMinted.issuerRegistrationNumber = metadataStruct.getIssuerRegistrationNumber();
  nftMinted.issuerJurisdiction = metadataStruct.getIssuerJurisdiction();
  nftMinted.governingLaw = metadataStruct.getGoverningLaw();
  nftMinted.enforcementJurisdiction = metadataStruct.getEnforcementJurisdiction();
  nftMinted.dateOfIssuance = metadataStruct.getDateOfIssuance();
  nftMinted.metadataPrincipalAmount = metadataStruct.getPrincipalAmount();
  nftMinted.yieldOrRate = metadataStruct.getYieldOrRate();
  nftMinted.assetClass = metadataStruct.getAssetClass();
  nftMinted.metadataMaturityDate = metadataStruct.getMaturityDate();
  nftMinted.lienStatus = metadataStruct.getLienStatus();
  nftMinted.collateralDescription = metadataStruct.getCollateralDescription();
  nftMinted.underlyingAssetIdentifier = metadataStruct.getUnderlyingAssetIdentifier();
  nftMinted.rightsEntitlementDescription = metadataStruct.getRightsEntitlementDescription();
  nftMinted.lifecycleEventLogic = metadataStruct.getLifecycleEventLogic();

  nftMinted.save();
}

export function handleControlLayerMetadataSet(
  event: ControlLayerMetadataSetEvent
): void {
  let nftMinted = NFTMinted.load(Bytes.fromByteArray(ByteArray.fromBigInt(event.params.tokenId)));
  if (nftMinted == null) {
    log.error("NFTMinted entity not found for tokenId {}", [
      event.params.tokenId.toString()
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToControlLayerMetadata(
    event.params.tokenId
  );

  nftMinted.controlMechanismDescription = metadataStruct.getControlMechanismDescription();
  nftMinted.controlLogicHash = metadataStruct.getControlLogicHash();
  nftMinted.governanceKeysOrRoleMap = metadataStruct.getGovernanceKeysOrRoleMap();
  nftMinted.transferRestrictions = metadataStruct.getTransferRestrictions();

  nftMinted.save();
}

export function handleLegalLinkLayerMetadataSet(
  event: LegalLinkLayerMetadataSetEvent
): void {
  let nftMinted = NFTMinted.load(Bytes.fromByteArray(ByteArray.fromBigInt(event.params.tokenId)));
  if (nftMinted == null) {
    log.error("NFTMinted entity not found for tokenId {}", [
      event.params.tokenId.toString()
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToLegalLinkLayerMetadata(
    event.params.tokenId
  );

  nftMinted.legalAgreementRefHash = metadataStruct.getLegalAgreementRefHash();
  nftMinted.agreementType = metadataStruct.getAgreementType();
  nftMinted.securedPartyName = metadataStruct.getSecuredPartyName();
  nftMinted.securedPartyWalletAddress = metadataStruct.getSecuredPartyWalletAddress();
  nftMinted.controlAgreementRefHash = metadataStruct.getControlAgreementRefHash();

  nftMinted.save();
}

export function handlePerfectionAndRegistryMetadataSet(
  event: PerfectionAndRegistryMetadataSetEvent
): void {
  let nftMinted = NFTMinted.load(Bytes.fromByteArray(ByteArray.fromBigInt(event.params.tokenId)));
  if (nftMinted == null) {
    log.error("NFTMinted entity not found for tokenId {}", [
      event.params.tokenId.toString()
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToPerfectionAndRegistryMetadata(
    event.params.tokenId
  );

  nftMinted.uccFilingReferenceNumber = metadataStruct.getUccFilingReferenceNumber();
  nftMinted.filingJurisdiction = metadataStruct.getFilingJurisdiction();
  nftMinted.perfectionMethod = metadataStruct.getPerfectionMethod();
  nftMinted.perfectionStatus = metadataStruct.getPerfectionStatus();

  nftMinted.save();
}
