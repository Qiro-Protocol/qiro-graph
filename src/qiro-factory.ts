import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import {
  Pool,
  PoolDeployed,
  Tranche,
  PoolAddresses,
  PoolCurrency,
  Borrower,
  FactoryOwnershipTransferred,
  KycUser,
  WhitelistedProtocol,
} from "../generated/schema";
import { Shelf } from "../generated/templates/Shelf/Shelf";
import {
  InvestmentOperator,
  Shelf as ShelfTemplate,
  WhitelistOperator as WhitelistOperatorTemplate,
  SecuritisationShelf as SecuritisationShelfTemplate,
  TimelockVault as TimelockVaultTemplate,
  ExitManager as ExitManagerTemplate,
  Reserve as ReserveTemplate,
} from "../generated/templates";
import { WhitelistOperator } from "../generated/templates/WhitelistOperator/WhitelistOperator";
import { Shelf as ShelfContract } from "../generated/templates/Shelf/Shelf";
import { SecuritisationShelf as SecuritisationShelfContract } from "../generated/templates/SecuritisationShelf/SecuritisationShelf";
import { Tranche as TrancheContract } from "../generated/QiroFactory/Tranche";
import { SecuritisationTranche as SecuritisationTrancheContract } from "../generated/QiroFactory/SecuritisationTranche";
import { ERC20 } from "../generated/QiroFactory/ERC20";
import { TimelockVault as TimelockVaultContract } from "../generated/templates/TimelockVault/TimelockVault";
import { ExitManager as ExitManagerContract } from "../generated/QiroFactory/ExitManager";
import {
  getPoolId,
  TrancheType,
  getPoolStatusString,
  getPoolTypeString,
  ONE,
  PoolType,
} from "./util";
import {
  FactoryCreated,
  QiroFactory as QiroFactoryContract,
  ContractFiled as FactoryFileEvent,
  OwnershipTransferred,
  PoolDeployed as PoolDeployedEvent,
  ProtocolPaused,
  ProtocolUnpaused,
  PoolsPaused,
  PoolsUnpaused,
  PauserUpdated,
  WhitelistManagerUpdated as WhitelistManagerUpdatedEvent,
  PoolAdminChanged as PoolAdminChangedEvent,
  UserKycUpdated as UserKycUpdatedEvent,
  ProtocolContractUpdated as ProtocolContractUpdatedEvent,
} from "../generated/QiroFactory/QiroFactory";
import { QiroFactory } from "../generated/schema";
import { createWHInvestorWhitelistedOrRevoked, WHInvestorWhitelistedParams } from "./webhooks/investorWhitelist";

// FACTORY
export function handleFactoryCreated(event: FactoryCreated): void {
  let entity = new QiroFactory(event.params.factory);

  let qiroFactory = QiroFactoryContract.bind(event.params.factory);

  entity.shelfFab = qiroFactory.shelfFab();
  entity.investmentOperatorFab = qiroFactory.investmentOperatorFab();
  entity.whitelistOperatorFab = qiroFactory.operatorFab();
  entity.defaultAssessorFab = qiroFactory.assessorFab();
  entity.distributorFab = qiroFactory.distributorFab();
  entity.seniorTrancheFab = qiroFactory.seniorTrancheFab();
  entity.juniorTrancheFab = qiroFactory.juniorTrancheFab();
  entity.qiroFeeCollector = qiroFactory.qiroFeeCollector();
  entity.owner = qiroFactory.owner();
  entity.whitelistManager = qiroFactory.whitelistManager();
  entity.poolCount = qiroFactory.poolCount();
  entity.nftContractAddress = qiroFactory.qiroAssetNFT();
  entity.currency = qiroFactory.currency();
  entity.protocolPaused = false; // Initialize as not paused
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.exitManagerContract = qiroFactory.exitManager();
  entity.timelockVaultContract = qiroFactory.getExitFundsRecipient();
  entity.pauserRole = qiroFactory.pauser();

  setupRolesAddresses(entity);
}

function setupRolesAddresses(entity: QiroFactory): void {
  // Initialize timelockManager from TimelockVault
  let timelockVaultAddress = Address.fromBytes(entity.timelockVaultContract);
  let timelockVault = TimelockVaultContract.bind(timelockVaultAddress);
  entity.timelockManagerRole = timelockVault.timelockManager();
  
  // Initialize exitManagerOwnerRole from ExitManager
  let exitManagerAddress = Address.fromBytes(entity.exitManagerContract);
  let exitManager = ExitManagerContract.bind(exitManagerAddress);
  entity.exitManagerOwnerRole = exitManager.owner();
  entity.save();

  // Start listening to TimelockVault events
  TimelockVaultTemplate.create(timelockVaultAddress);
  // Start listening to ExitManager events
  ExitManagerTemplate.create(exitManagerAddress);
}

export function handleFactoryFile(event: FactoryFileEvent): void {
  let factory = QiroFactory.load(event.address);
  if (factory == null) {
    log.error("Factory not found for address: {}", [event.address.toHexString()]);
    return;
  }

  let what = event.params.param.toString();
  let value = event.params.value;

  if (what == "qiroFeeCollector") {
    factory.qiroFeeCollector = value;
  } else if (what == "qiroAssetNFT") {
    factory.nftContractAddress = value;
  } else if (what == "currency") {
    factory.currency = value;
  } else {
    log.warning("Unknown parameter in factory file event: {}", [what]);
  }
  factory.save();
}

export function handleUpdateWhitelistManager(event: WhitelistManagerUpdatedEvent): void {
  let factory = QiroFactory.load(event.address);
  if (factory != null) {
    factory.whitelistManager = event.params.newManager;
    factory.save();
  }
}

export function handleChangePoolAdmin(event: PoolAdminChangedEvent): void {
  // Update PoolAddresses.admin for the given poolId
  let poolId = event.params.poolId;
  let poolEntityId = getPoolId(poolId);
  let poolAddresses = PoolAddresses.load(poolEntityId);
  if (poolAddresses != null) {
    poolAddresses.admin = event.params.newAdmin;
    poolAddresses.save();
  }
}
function getOrCreateKycUser(
  userAddress: Address,
  factoryAddress: Address,
  block: ethereum.Block
): KycUser {
  let kyc = KycUser.load(userAddress);
  if (kyc == null) {
    kyc = new KycUser(userAddress);
    kyc.address = userAddress;
    kyc.factory = factoryAddress;
    kyc.isKyc = false;
    kyc.blockTimestamp = block.timestamp;
    kyc.transactionHash = block.hash;
    kyc.blockNumber = block.number;
    kyc.save();
  }
  return kyc as KycUser;
}

export function handleUserKycUpdated(event: UserKycUpdatedEvent): void {
  // KYC user added
  let userId = event.params.user;
  let kyc = getOrCreateKycUser(userId, event.address, event.block);
  kyc.isKyc = event.params.isKycUser;
  kyc.blockTimestamp = event.block.timestamp;
  kyc.blockNumber = event.block.number;
  kyc.transactionHash = event.transaction.hash;
  kyc.save();

  // Create webhook parameters
  let params: WHInvestorWhitelistedParams = {
    investor: userId, // address
    trancheName: "NA",
    level: "FACTORY_KYC",
    whitelisted: event.params.isKycUser,
    poolId: BigInt.fromI32(0), // 0 for factory KYC
    contractAddress: event.address,
    contractName: "QiroFactory",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  };
  createWHInvestorWhitelistedOrRevoked(params);
}

export function handleProtocolContractUpdated(
  event: ProtocolContractUpdatedEvent
): void {
  let contractAddr = event.params.contract_;
  let wl = WhitelistedProtocol.load(contractAddr);
  if (wl == null) {
    wl = new WhitelistedProtocol(contractAddr);
    wl.address = contractAddr;
    wl.factory = event.address;
  }
  wl.isWhitelisted = event.params.isProtocolContract_;
  wl.blockTimestamp = event.block.timestamp;
  wl.transactionHash = event.transaction.hash;
  wl.save();
}

export function handleFactoryOwnershipTransferred(
  event: OwnershipTransferred
): void {
  let entity = new FactoryOwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // update factory owner
  let factory = QiroFactory.load(event.address);
  if (factory != null) {
    factory.owner = event.params.newOwner;
    factory.save();
  }
  log.info("Factory ownership transferred to: {}", [
    event.params.newOwner.toHexString(),
  ]);
}

export function getOrCreateCurrency(
  qiroFactoryCurrency: Address
): PoolCurrency {
  let poolCurrency = PoolCurrency.load(qiroFactoryCurrency);
  if (poolCurrency == null) {
    let qiroFactoryCurrencyBind = ERC20.bind(qiroFactoryCurrency);
    poolCurrency = new PoolCurrency(qiroFactoryCurrency);
    poolCurrency.address = qiroFactoryCurrency;
    poolCurrency.symbol = qiroFactoryCurrencyBind.symbol();
    poolCurrency.decimals = qiroFactoryCurrencyBind.decimals();
    poolCurrency.save();
  }
  return poolCurrency;
}

function updatePoolCountInFactory(qiroFactory: Address): void {
  let factory = QiroFactoryContract.bind(qiroFactory);
  let qiroFactoryEntity = QiroFactory.load(qiroFactory);
  if (qiroFactoryEntity) {
    qiroFactoryEntity.poolCount = factory.poolCount();
    qiroFactoryEntity.save();
  }
}

// POOL

export function handlePoolDeployed(event: PoolDeployedEvent): void {
  let entity = new PoolDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.poolId = event.params.poolId; // uint256
  entity.pool = getPoolId(event.params.poolId);
  entity.seniorRate = event.params.seniorRate;
  entity.interestRate = event.params.interestRate;
  entity.periodLength = event.params.periodLength;
  entity.periodCount = event.params.periodCount;
  entity.gracePeriod = event.params.gracePeriod;
  entity.operator = event.params.operator;
  entity.shelf = event.params.shelf;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let factory = QiroFactoryContract.bind(event.address);
  let factoryPool = factory.pools(event.params.poolId);

  let poolType = getPoolTypeString(factoryPool.getPoolType());

  handlePool(
    entity as PoolDeployed,
    event.params.poolId,
    event.address,
    poolType
  );

  updatePoolCountInFactory(event.address);

  if (getPoolTypeString(factoryPool.getPoolType()) == PoolType.SECURITISATION) {
    SecuritisationShelfTemplate.create(event.params.shelf);
  } else if (getPoolTypeString(factoryPool.getPoolType()) == PoolType.LOAN) {
    ShelfTemplate.create(event.params.shelf);
  } else {
    // revert if pool type is unknown
    log.error("Unknown pool type for pool ID: {}", [
      event.params.poolId.toString(),
    ]);
    return;
  }

  InvestmentOperator.create(
    WhitelistOperator.bind(event.params.operator).investmentOperator()
  );
  WhitelistOperatorTemplate.create(event.params.operator);
  // Start listening to Reserve events, get reserve address from shelf contract
  ReserveTemplate.create(Shelf.bind(event.params.shelf).reserve());
}

function handlePool(
  pool: PoolDeployed,
  poolId: BigInt,
  qiroFactory: Address,
  poolType: string
): void {
  // Start
  let entity = new Pool(pool.pool); // event.poolId in bytes
  let poolAddresses = new PoolAddresses(pool.pool);

  let operator = WhitelistOperator.bind(Address.fromBytes(pool.operator));

  // Dynamic contract binding based on pool type
  let shelfContract: ShelfContract | null = null;
  let securitisationShelfContract: SecuritisationShelfContract | null = null;

  if (poolType == PoolType.LOAN) {
    shelfContract = ShelfContract.bind(Address.fromBytes(pool.shelf));
  } else if (poolType == PoolType.SECURITISATION) {
    securitisationShelfContract = SecuritisationShelfContract.bind(
      Address.fromBytes(pool.shelf)
    );
  }

  let factory = QiroFactoryContract.bind(qiroFactory);
  let factoryPool = factory.pools(poolId);
  let qiroFactoryCurrency = factory.currency();
  let currencyContract = ERC20.bind(Address.fromBytes(qiroFactoryCurrency));
  let juniorTranch = operator.junior();
  let seniorTranch = operator.senior();

  // Common fields (same for both pool types)
  entity.poolId = poolId; // uint256
  entity.poolStatus = getPoolStatusString(operator.getState());
  entity.seniorInterestRate = pool.seniorRate;
  entity.juniorInterestRate = BigInt.fromI32(0); // Initialize to 0, will be updated for Securitisation pools
  entity.interestRate = pool.interestRate;
  entity.periodLength = pool.periodLength;
  entity.periodCount = pool.periodCount;
  entity.loanTerm = pool.periodLength.times(pool.periodCount);
  entity.gracePeriod = pool.gracePeriod;
  entity.totalWithdrawn = new BigInt(0);
  entity.startTimestamp = pool.blockTimestamp;
  entity.loanMaturityTimestamp = pool.blockTimestamp.plus(
    pool.periodLength.times(pool.periodCount)
  );
  entity.totalRepaid = new BigInt(0);
  entity.principalRepaid = new BigInt(0);
  entity.interestRepaid = new BigInt(0);
  entity.capitalFormationPeriod = operator.capitalFormationPeriod(); // 7 days
  entity.capitalFormationPeriodEnd = operator.capitalFormationEnd();

  // Contract-specific fields
  if (poolType == PoolType.LOAN) {
    entity.lateFeeInterestRate = shelfContract!.lateFeeInterestRateInBps();
    entity.performanceFeeRate = shelfContract!.performanceFee();
    entity.originatorFeeRate = BigInt.fromI32(
      shelfContract!.allFees(BigInt.fromI32(1)).value1
    ); // 1 is for originator fee
    entity.totalBalance = shelfContract!.balance();
    entity.principalAmount = shelfContract!.principalAmount();
    entity.interestAmount = shelfContract!.totalInterestForLoanTerm();
  } else if (poolType == PoolType.SECURITISATION) {
    entity.lateFeeInterestRate =
      securitisationShelfContract!.lateFeeInterestRateInBps();
    entity.performanceFeeRate = securitisationShelfContract!.performanceFee();
    entity.originatorFeeRate = BigInt.fromI32(
      securitisationShelfContract!.allFees(BigInt.fromI32(1)).value1
    ); // 1 is for originator fee
    entity.totalBalance = securitisationShelfContract!.balance();
    entity.principalAmount = securitisationShelfContract!.principalAmount();
    entity.interestAmount =
      securitisationShelfContract!.totalInterestForLoanTerm();
  }
  entity.writeoffAmount = new BigInt(0);
  entity.totalTrancheBalance = new BigInt(0);
  entity.trancheSupplyMaxBalance = new BigInt(0);
  entity.trancheTotalRedeemed = new BigInt(0);

  // Pool type specific fields
  if (poolType == PoolType.LOAN) {
    entity.writeoffTime = shelfContract!.writeOffTime();
    entity.outstandingPrincipal = shelfContract!.getOutstandingPrincipal();
    entity.outstandingInterest = shelfContract!
      .totalInterestForLoanTerm()
      .minus(shelfContract!.totalInterestRepayed());
    entity.isBullet = shelfContract!.isBulletRepay();
  } else if (poolType == PoolType.SECURITISATION) {
    entity.writeoffTime = BigInt.fromI32(0); // Securitisation does not have writeoff time
    entity.outstandingPrincipal =
      securitisationShelfContract!.getOutstandingPrincipal();
    entity.outstandingInterest = securitisationShelfContract!
      .totalInterestForLoanTerm()
      .minus(securitisationShelfContract!.totalInterestRepayed());
    entity.isBullet = false; // Securitisation does not have bullet repay
  }
  entity.poolType = getPoolTypeString(factoryPool.getPoolType());
  entity.isPaused = false; // Initialize as not paused
  entity.blockNumber = pool.blockNumber;
  entity.blockTimestamp = pool.blockTimestamp;
  entity.transactionHash = pool.transactionHash;
  entity.shelfBalance = currencyContract.balanceOf(
    Address.fromBytes(pool.shelf)
  );
  entity.shelfDebt = BigInt.fromI32(0);
  entity.maxServicerFeeAmount = BigInt.fromI32(0);
  entity.recoveryAmountPaid = BigInt.fromI32(0);
  entity.seniorTranche = seniorTranch;
  entity.juniorTranche = juniorTranch;

  // Contract-specific fields
  if (poolType == PoolType.LOAN) {
    entity.borrower = shelfContract!.borrower();
    entity.originatorFeePaid = shelfContract!.originatorFeePaidAmount();
    entity.pStartFrom = shelfContract!.pStartFrom();
    entity.pRepayFrequency = shelfContract!.pRepayFrequency();
    entity.prepaymentAbsorbedAmount = shelfContract!.prepaymentAbsorbedAmount();
    entity.postPrePaymentOSPrincipal = shelfContract!.postPrePaymentOSPrincipal();
    entity.prepaymentPeriod = shelfContract!.prePaymentPeriod();
    entity.lateFeeRepaid = shelfContract!.totalLateFeePaid();
    entity.nftTokenId = shelfContract!.token().value1;
    // SecuritisationShelf-specific fields - set to 0 for LOAN pools
    entity.outstandingShortfallInterestAmount = BigInt.fromI32(0);
    entity.outstandingShortfallPrincipalAmount = BigInt.fromI32(0);
    entity.servicerFeePaid = BigInt.fromI32(0);
  } else if (poolType == PoolType.SECURITISATION) {
    entity.borrower = securitisationShelfContract!.borrower();
    entity.originatorFeePaid =
      securitisationShelfContract!.originatorFeePaidAmount();
    entity.pStartFrom = securitisationShelfContract!.pStartFrom();
    entity.pRepayFrequency = securitisationShelfContract!.pRepayFrequency();
    entity.prepaymentAbsorbedAmount =
      securitisationShelfContract!.prepaymentAbsorbedAmount();
    entity.prepaymentPeriod = BigInt.fromI32(0);
    entity.postPrePaymentOSPrincipal = BigInt.fromI32(0);
    entity.lateFeeRepaid = securitisationShelfContract!.totalLateFeePaid();
    entity.nftTokenId = securitisationShelfContract!.token().value1;

    // SecuritisationShelf-specific fields
    entity.outstandingShortfallInterestAmount =
      securitisationShelfContract!.outstandingShortfallInterestAmount();
    entity.outstandingShortfallPrincipalAmount =
      securitisationShelfContract!.outstandingShortfallPrincipalAmount();
    entity.servicerFeePaid = securitisationShelfContract!.servicerFeePaid();
  }
  // Initialize reserve-related fields (will be updated when reserve is set via depend call)
  entity.reserveBalance = BigInt.fromI32(0);
  entity.eisBalance = BigInt.fromI32(0);
  entity.save();

  let currency = getOrCreateCurrency(qiroFactoryCurrency);

  poolAddresses.pool = pool.pool;
  poolAddresses.shelf = pool.shelf;
  poolAddresses.operator = pool.operator;
  poolAddresses.investmentOperator = operator.investmentOperator();
  poolAddresses.juniorTranche = juniorTranch;
  poolAddresses.seniorTranche = seniorTranch;
  poolAddresses.lenderDeployer = factoryPool.getLenderDeployer();
  poolAddresses.borrowerDeployer = factoryPool.getBorrowerDeployer();
  poolAddresses.admin = factoryPool.getPoolAdmin();
  poolAddresses.currency = currency.id;
  poolAddresses.seniorToken = operator.seniorToken();
  poolAddresses.juniorToken = operator.juniorToken();
  poolAddresses.root = factoryPool.getRoot();

  // Contract-specific fields
  if (poolType == PoolType.LOAN) {
    poolAddresses.nftContractAddress = shelfContract!.assetNFT();
    poolAddresses.reserve = shelfContract!.reserve();
  } else if (poolType == PoolType.SECURITISATION) {
    poolAddresses.nftContractAddress = securitisationShelfContract!.assetNFT();
    poolAddresses.reserve = securitisationShelfContract!.reserve();
  }

  poolAddresses.save();

  // Dynamic contract binding based on pool type
  let junTrancheContract: TrancheContract | null = null;
  let senTrancheContract: TrancheContract | null = null;
  let junSecTrancheContract: SecuritisationTrancheContract | null = null;
  let senSecTrancheContract: SecuritisationTrancheContract | null = null;

  if (poolType == PoolType.LOAN) {
    junTrancheContract = TrancheContract.bind(juniorTranch);
    senTrancheContract = TrancheContract.bind(seniorTranch);
  } else if (poolType == PoolType.SECURITISATION) {
    junSecTrancheContract = SecuritisationTrancheContract.bind(juniorTranch);
    senSecTrancheContract = SecuritisationTrancheContract.bind(seniorTranch);
  } else {
    // Default fallback (should not happen)
    log.error("Unknown pool type for pool ID: {}", [poolId.toString()]);
    return;
  }

  // Update interest rates for Securitisation pools
  if (poolType == PoolType.SECURITISATION) {
    entity.juniorInterestRate = junSecTrancheContract!.aprInBps();
    entity.save();
  }

  let seniorTranche = new Tranche(seniorTranch);
  let juniorTranche = new Tranche(juniorTranch);

  // Common fields for both tranche types
  juniorTranche.pool = pool.pool;
  juniorTranche.trancheType = TrancheType.JUNIOR;
  juniorTranche.totalInvested = operator.totalDepositCurrencyJunior();
  juniorTranche.totalRedeemed = operator.totalRedeemedCurrencyJunior();
  juniorTranche.ceiling = operator.juniorTrancheCeiling();
  juniorTranche.blockTimestamp = pool.blockTimestamp;
  juniorTranche.transactionHash = pool.transactionHash;

  // Contract-specific fields based on pool type
  if (poolType == PoolType.LOAN) {
    let junTokenContract = ERC20.bind(junTrancheContract!.token());
    juniorTranche.tokenAddress = junTrancheContract!.token();
    juniorTranche.balance = junTrancheContract!.balance();
    juniorTranche.totalTokenSupply = junTrancheContract!.tokenSupply();
    juniorTranche.tokenName = junTokenContract.name();
    juniorTranche.tokenSymbol = junTokenContract.symbol();
    juniorTranche.tokenDecimals = junTokenContract.decimals();
    juniorTranche.totalRepaid = junTrancheContract!.totalRepayedAmount();
    juniorTranche.interestRate = BigInt.fromI32(0); // for loan pools, this is not defined hence setting zero
  } else if (poolType == PoolType.SECURITISATION) {
    let junTokenContract = ERC20.bind(junSecTrancheContract!.token());
    juniorTranche.tokenAddress = junSecTrancheContract!.token();
    juniorTranche.balance = junSecTrancheContract!.balance();
    juniorTranche.totalTokenSupply = junSecTrancheContract!.tokenSupply();
    juniorTranche.tokenName = junTokenContract.name();
    juniorTranche.tokenSymbol = junTokenContract.symbol();
    juniorTranche.tokenDecimals = junTokenContract.decimals();
    // For SECURITISATION, totalRepaid is sum of principalRepaid + interestRepaid
    juniorTranche.principalRepaid = junSecTrancheContract!.principalRepaid();
    juniorTranche.interestRepaid = junSecTrancheContract!.interestRepaid();
    juniorTranche.overduePrincipalAmount =
      junSecTrancheContract!.overduePrincipalAmount();
    juniorTranche.lastRepaidTimestamp =
      junSecTrancheContract!.lastRepaidTimestamp();
    juniorTranche.totalDaysRepaid = junSecTrancheContract!.totalDaysRepaid();
    juniorTranche.interestRate = junSecTrancheContract!.aprInBps();
    juniorTranche.totalRepaid = juniorTranche.principalRepaid!.plus(
      juniorTranche.interestRepaid!
    );
  }

  juniorTranche.save();

  // Common fields for senior tranche
  seniorTranche.pool = pool.pool;
  seniorTranche.trancheType = TrancheType.SENIOR;
  seniorTranche.tokenAddress = operator.seniorToken();
  seniorTranche.totalInvested = operator.totalDepositCurrencySenior();
  seniorTranche.totalRedeemed = operator.totalRedeemedCurrencySenior();
  seniorTranche.ceiling = operator.seniorTrancheCeiling();
  seniorTranche.blockTimestamp = pool.blockTimestamp;
  seniorTranche.transactionHash = pool.transactionHash;

  // Contract-specific fields for senior tranche based on pool type
  if (poolType == PoolType.LOAN) {
    let senTokenContract = ERC20.bind(operator.seniorToken());
    seniorTranche.balance = senTrancheContract!.balance();
    seniorTranche.totalTokenSupply = senTrancheContract!.tokenSupply();
    seniorTranche.tokenName = senTokenContract.name();
    seniorTranche.tokenSymbol = senTokenContract.symbol();
    seniorTranche.tokenDecimals = senTokenContract.decimals();
    seniorTranche.totalRepaid = senTrancheContract!.totalRepayedAmount();
    seniorTranche.interestRate = senTrancheContract!.seniorAprInBps();
  } else if (poolType == PoolType.SECURITISATION) {
    let senTokenContract = ERC20.bind(operator.seniorToken());
    seniorTranche.balance = senSecTrancheContract!.balance();
    seniorTranche.totalTokenSupply = senSecTrancheContract!.tokenSupply();
    seniorTranche.tokenName = senTokenContract.name();
    seniorTranche.tokenSymbol = senTokenContract.symbol();
    seniorTranche.tokenDecimals = senTokenContract.decimals();
    // For SECURITISATION, totalRepaid is sum of principalRepaid + interestRepaid
    seniorTranche.principalRepaid = senSecTrancheContract!.principalRepaid();
    seniorTranche.interestRepaid = senSecTrancheContract!.interestRepaid();
    seniorTranche.overduePrincipalAmount =
      senSecTrancheContract!.overduePrincipalAmount();
    seniorTranche.lastRepaidTimestamp =
      senSecTrancheContract!.lastRepaidTimestamp();
    seniorTranche.totalDaysRepaid = senSecTrancheContract!.totalDaysRepaid();
    seniorTranche.interestRate = senSecTrancheContract!.aprInBps();
    seniorTranche.totalRepaid = seniorTranche.principalRepaid!.plus(
      seniorTranche.interestRepaid!
    );
  }

  seniorTranche.save();

  // creates the borrower entity if it does not exist
  getOrCreateBorrower(Address.fromBytes(entity.borrower), pool.blockTimestamp);
}

export function getOrCreateBorrower(
  borrowerAddress: Address,
  blockTimestamp: BigInt = BigInt.fromI32(0)
): Borrower {
  let borrower = Borrower.load(borrowerAddress);
  if (borrower == null) {
    borrower = new Borrower(borrowerAddress);
    borrower.blockTimestamp = blockTimestamp;
    borrower.save();
  }
  return borrower;
}

// PAUSE HANDLERS
export function handleProtocolPaused(event: ProtocolPaused): void {
  let factory = QiroFactory.load(event.address);
  if (factory != null) {
    factory.protocolPaused = true;
    factory.save();
  }
}

export function handleProtocolUnpaused(event: ProtocolUnpaused): void {
  let factory = QiroFactory.load(event.address);
  if (factory != null) {
    factory.protocolPaused = false;
    factory.save();
  }
}

export function handlePoolsPaused(event: PoolsPaused): void {
  let pool = Pool.load(getPoolId(event.params.poolId));
  if (pool != null) {
    pool.isPaused = true;
    pool.save();
  }
}

export function handlePoolsUnpaused(event: PoolsUnpaused): void {
  let pool = Pool.load(getPoolId(event.params.poolId));
  if (pool != null) {
    pool.isPaused = false;
    pool.save();
  }
}

export function handlePauserUpdated(event: PauserUpdated): void {
  let factory = QiroFactory.load(event.address);
  if (factory != null) {
    factory.pauserRole = event.params.newPauser;
    factory.save();
  }
}
