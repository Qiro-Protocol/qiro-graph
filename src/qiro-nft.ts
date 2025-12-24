import {
  ConsumerContractUpdated as ConsumerContractUpdatedEvent,
  File as FileEvent,
  NFTMinted as NFTMintedEvent,
  Transfer as TransferEvent,
  UpdateNftData as UpdateNftDataEvent,
  IdentityDealAssetLayerMetadataSet as IdentityDealAssetLayerMetadataSetEvent,
  ControlLayerMetadataSet as ControlLayerMetadataSetEvent,
  LegalLinkLayerMetadataSet as LegalLinkLayerMetadataSetEvent,
  PerfectionAndRegistryMetadataSet as PerfectionAndRegistryMetadataSetEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  PoolAdminUpdated as PoolAdminUpdatedEvent,
  MetadataManagerUpdated as MetadataManagerUpdatedEvent,
  MinterUpdated as MinterUpdatedEvent,
  QiroNft,
} from "../generated/QiroNft/QiroNft";
import {
  ConsumerContractUpdated,
  File,
  NFTMinted,
  NftMetadata,
  Transfer,
  UpdateNftData,
} from "../generated/schema";
import { OwnershipTransferred as OwnershipTransferredEvent } from "../generated/QiroNft/QiroNft";
import { createWHOwnershipTransferStarted } from "./webhooks/ownershipTransfer.started";
import { createWHOwnershipTransferComplete } from "./webhooks/ownershipTransfer.complete";
import { createWHPoolAdminUpdated } from "./webhooks/poolAdminUpdated";
import { createWHMetadataManagerUpdated } from "./webhooks/metadataManagerUpdated";
import { createWHMinterUpdated } from "./webhooks/minterUpdated";
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

  entity.save();
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
  entity.to = event.params.to // recipient of the NFT
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
  entity.minter = event.transaction.from; // minter of the NFT

  entity.save();

  // initialize metadata placeholder linked to this NFT
  let metadata = new NftMetadata(id);
  metadata.nft = id;
  metadata.minter = event.transaction.from; // minter of the NFT
  metadata.save();
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
  metadata.transferRestrictions = metadataStruct.getTransferRestrictions();
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

export function handlePoolAdminUpdated(event: PoolAdminUpdatedEvent): void {
  // create webhook entity
  createWHPoolAdminUpdated({
    admin: event.params.admin,
    access: event.params.access,
    contractAddress: event.address,
    contractName: "QiroNFT",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleMetadataManagerUpdated(
  event: MetadataManagerUpdatedEvent
): void {
  // Link tokenId to metadataManager
  let nftId = _getNftId(event.params.tokenId);
  let nft = NFTMinted.load(nftId);
  if (nft != null) {
    nft.metadataManager = event.params.manager;
    nft.save();
  } else {
    log.warning(
      "NFTMinted entity not found for tokenId {} in handleMetadataManagerUpdated",
      [event.params.tokenId.toString()]
    );
  }

  // create webhook entity
  createWHMetadataManagerUpdated({
    tokenId: event.params.tokenId,
    manager: event.params.manager,
    contractAddress: event.address,
    contractName: "QiroNFT",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleMinterUpdated(event: MinterUpdatedEvent): void {
  // create webhook entity
  createWHMinterUpdated({
    minter: event.params.minter,
    isMinter: event.params.isMinter,
    contractAddress: event.address,
    contractName: "QiroNFT",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleQiroNftOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  // create webhook entity
  createWHOwnershipTransferStarted({
    currentOwner: event.params.previousOwner, // current owner
    proposedOwner: event.params.newOwner, // proposed owner
    roleName: "QiroNFT owner",
    contractAddress: event.address, // qiro nft address
    contractName: "QiroNFT",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleQiroNftOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  // create webhook entity
  createWHOwnershipTransferComplete({
    previousOwner: event.params.previousOwner, // previous owner
    newOwner: event.params.newOwner, // new owner
    roleName: "QiroNFT owner",
    contractAddress: event.address, // qiro nft address
    contractName: "QiroNFT",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}
