import { QiroFactory, WHTimelockDepositCreated } from "../../generated/schema";
import {
  TimelockDelayUpdated,
  TimelockManagerUpdated,
  TimelockVault as TimelockVaultContract,
  DepositCreated as TimelockDepositCreatedEvent,
  DepositWithdrawn as TimelockDepositWithdrawnEvent,
  FundsWithdrawn as TimelockFundsWithdrawnEvent,
} from "../../generated/templates/TimelockVault/TimelockVault";
import { createWHTimelockVaultManagerChanged } from "../webhooks/timelockVaultManagerChanged";
import { createWHTimelockVaultDelayChanged } from "../webhooks/timelockVaultDelayChanged";
import { createWHTimelockDepositCreated, getDepositIdBytes } from "../webhooks/timelockDeposit.created";
import { createWHTimelockDepositWithdrawn } from "../webhooks/timelockDeposit.withdrawn";
import { createWHFundsWithdrawn } from "../webhooks/timelockFunds.withdraw";

export function handleTimelockManagerUpdated(
  event: TimelockManagerUpdated
): void {
  // Find the factory via the TimelockVault contract
  let vault = TimelockVaultContract.bind(event.address);
  let factoryAddress = vault.qiroFactory();

  let factory = QiroFactory.load(factoryAddress);
  if (factory == null) {
    throw new Error("Factory not found for timelock address:" + event.address.toHexString());
  }

  factory.timelockManagerRole = event.params.newManager;
  factory.save();

  // create webhook entity
  createWHTimelockVaultManagerChanged({
    oldManager: event.params.oldManager,
    newManager: event.params.newManager,
    contractAddress: event.address,
    contractName: "TimelockVault",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleTimelockDelayUpdated(
  event: TimelockDelayUpdated
): void {
  // create webhook entity
  createWHTimelockVaultDelayChanged({
    oldDelay: event.params.oldDelay,
    newDelay: event.params.newDelay,
    contractAddress: event.address,
    contractName: "TimelockVault",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleTimelockDepositCreated(
  event: TimelockDepositCreatedEvent
): void {
  // create webhook entity
  createWHTimelockDepositCreated({
    currency: event.params.currency,
    amount: event.params.amount,
    poolId: event.params.poolId,
    unlockAt: event.params.unlockAt,
    depositId: event.params.depositId,
    depositor: event.params.depositor,
    contractAddress: event.address,
    contractName: "TimelockVault",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleTimelockDepositWithdrawn(
  event: TimelockDepositWithdrawnEvent
): void {
  // get deposit from timelock vault
  let deposit = WHTimelockDepositCreated.load(getDepositIdBytes(event.params.depositId));

  if (deposit == null) {
    throw new Error("Deposit not found for deposit id:" + event.params.depositId.toHexString());
  }

  // create webhook entity
  createWHTimelockDepositWithdrawn({
    depositId: event.params.depositId,
    amount: deposit.amount,
    contractAddress: event.address,
    contractName: "TimelockVault",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleTimelockFundsWithdrawn(
  event: TimelockFundsWithdrawnEvent
): void {
  // create webhook entity
  createWHFundsWithdrawn({
    currency: event.params.currency,
    amount: event.params.amount,
    recipient: event.params.recipient,
    withdrawnBy: event.transaction.from,
    contractAddress: event.address,
    contractName: "TimelockVault",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}