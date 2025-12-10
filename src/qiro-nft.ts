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
  NftMetadata,
  Rely,
  Transfer,
  UpdateNftData,
} from "../generated/schema";
import { ByteArray, Bytes, BigInt, log } from "@graphprotocol/graph-ts";

function _getNftId(tokenId: BigInt): Bytes {
  return Bytes.fromByteArray(ByteArray.fromBigInt(tokenId));
}

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
  let id = _getNftId(event.params.tokenId);
  let entity = new NFTMinted(id);
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

  entity.save();

  // initialize metadata placeholder linked to this NFT
  let metadata = new NftMetadata(id);
  metadata.nft = id;
  metadata.save();
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
  let metadataId = _getNftId(event.params.tokenId);
  let metadata = NftMetadata.load(metadataId);
  if (metadata == null) {
    log.error("NftMetadata entity not found for tokenId {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToIdentityDealAssetLayerMetadata(
    event.params.tokenId
  );

  metadata.issuerName = metadataStruct.getIssuerName();
  metadata.issuerRegistrationNumber =
    metadataStruct.getIssuerRegistrationNumber();
  metadata.issuerJurisdiction = metadataStruct.getIssuerJurisdiction();
  metadata.governingLaw = metadataStruct.getGoverningLaw();
  metadata.enforcementJurisdiction =
    metadataStruct.getEnforcementJurisdiction();
  metadata.dateOfIssuance = metadataStruct.getDateOfIssuance();
  metadata.principalAmount = metadataStruct.getPrincipalAmount();
  metadata.yieldOrRate = metadataStruct.getYieldOrRate();
  metadata.assetClass = metadataStruct.getAssetClass();
  metadata.maturityDate = metadataStruct.getMaturityDate();
  metadata.lienStatus = metadataStruct.getLienStatus();
  metadata.collateralDescription = metadataStruct.getCollateralDescription();
  metadata.underlyingAssetIdentifier =
    metadataStruct.getUnderlyingAssetIdentifier();
  metadata.rightsEntitlementDescription =
    metadataStruct.getRightsEntitlementDescription();
  metadata.lifecycleEventLogic = metadataStruct.getLifecycleEventLogic();

  metadata.save();
}

export function handleControlLayerMetadataSet(
  event: ControlLayerMetadataSetEvent
): void {
  let metadataId = _getNftId(event.params.tokenId);
  let metadata = NftMetadata.load(metadataId);
  if (metadata == null) {
    log.error("NftMetadata entity not found for tokenId {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToControlLayerMetadata(
    event.params.tokenId
  );

  metadata.controlMechanismDescription =
    metadataStruct.getControlMechanismDescription();
  metadata.controlLogicHash = metadataStruct.getControlLogicHash();
  metadata.governanceKeysOrRoleMap =
    metadataStruct.getGovernanceKeysOrRoleMap();
  metadata.save();
}

export function handleLegalLinkLayerMetadataSet(
  event: LegalLinkLayerMetadataSetEvent
): void {
  let metadataId = _getNftId(event.params.tokenId);
  let metadata = NftMetadata.load(metadataId);
  if (metadata == null) {
    log.error("NftMetadata entity not found for tokenId {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToLegalLinkLayerMetadata(
    event.params.tokenId
  );

  metadata.legalAgreementRefHash = metadataStruct.getLegalAgreementRefHash();
  metadata.agreementType = metadataStruct.getAgreementType();
  metadata.securedPartyName = metadataStruct.getSecuredPartyName();
  metadata.securedPartyWalletAddress =
    metadataStruct.getSecuredPartyWalletAddress();
  metadata.controlAgreementRefHash =
    metadataStruct.getControlAgreementRefHash();

  metadata.save();
}

export function handlePerfectionAndRegistryMetadataSet(
  event: PerfectionAndRegistryMetadataSetEvent
): void {
  let metadataId = _getNftId(event.params.tokenId);
  let metadata = NftMetadata.load(metadataId);
  if (metadata == null) {
    log.error("NftMetadata entity not found for tokenId {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  let contract = QiroNft.bind(event.address);
  let metadataStruct = contract.tokenIdToPerfectionAndRegistryMetadata(
    event.params.tokenId
  );

  metadata.uccFilingReferenceNumber =
    metadataStruct.getUccFilingReferenceNumber();
  metadata.filingJurisdiction = metadataStruct.getFilingJurisdiction();
  metadata.perfectionMethod = metadataStruct.getPerfectionMethod();
  metadata.perfectionStatus = metadataStruct.getPerfectionStatus();

  metadata.save();
}
