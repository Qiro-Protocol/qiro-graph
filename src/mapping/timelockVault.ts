import { QiroFactory } from "../../generated/schema";
import {
  TimelockDelayUpdated,
  TimelockManagerUpdated,
  TimelockVault as TimelockVaultContract,
} from "../../generated/templates/TimelockVault/TimelockVault";
import { createWHTimelockVaultManagerChanged } from "../webhooks/timelockVaultManagerChanged";
import { createWHTimelockVaultDelayChanged } from "../webhooks/timelockVaultDelayChanged";

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