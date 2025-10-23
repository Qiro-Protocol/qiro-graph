import { QiroFactory } from "../../generated/schema";
import {
  OwnershipTransferred,
  ExitManager as ExitManagerContract,
  OwnershipTransferStarted,
  EmergencyExitExecuted,
  BatchSizeUpdated,
} from "../../generated/templates/ExitManager/ExitManager";
import { createWHOwnershipTransferStarted } from "../webhooks/ownershipTransfer.started";
import { createWHOwnershipTransferComplete } from "../webhooks/ownershipTransfer.complete";
import { createWHEmergencyExitExecuted } from "../webhooks/emergencyExitExecuted";
import { createWHEmergencyExitBatchSizeChanged } from "../webhooks/emergencyExitBatchSizeChanged";

export function handleExitManagerOwnershipTransferred(
  event: OwnershipTransferred
): void {
  // Find the factory via the ExitManager contract
  let exitManager = ExitManagerContract.bind(event.address);
  let factoryAddress = exitManager.qiroFactory();

  let factory = QiroFactory.load(factoryAddress);
  if (factory == null) {
    throw new Error("Factory not found for exit manager address:" + event.address.toHexString());
  }

  factory.exitManagerOwnerRole = event.params.newOwner;
  factory.save();

  // create webhook entity
  createWHOwnershipTransferComplete({
    previousOwner: event.params.previousOwner, // previous owner
    newOwner: event.params.newOwner, // new owner
    roleName: "Exit manager owner",
    contractAddress: event.address, // exit manager address
    contractName: "ExitManager",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleExitManagerOwnershipTransferStarted(
  event: OwnershipTransferStarted
): void {
  // create webhook entity
  createWHOwnershipTransferStarted({
    currentOwner: event.params.previousOwner, // current owner
    proposedOwner: event.params.newOwner, // proposed owner
    roleName: "Exit manager owner",
    contractAddress: event.address, // exit manager address
    contractName: "ExitManager",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleEmergencyExitExecuted(
  event: EmergencyExitExecuted
): void {
  // create webhook entity
  createWHEmergencyExitExecuted({
    poolIds: event.params.poolIds,
    contractAddress: event.address,
    contractName: "ExitManager",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}

export function handleBatchSizeUpdated(
  event: BatchSizeUpdated
): void {
  // create webhook entity
  createWHEmergencyExitBatchSizeChanged({
    oldBatchSize: event.params.oldBatchSize,
    newBatchSize: event.params.newBatchSize,
    contractAddress: event.address,
    contractName: "ExitManager",
    block: event.block,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
}