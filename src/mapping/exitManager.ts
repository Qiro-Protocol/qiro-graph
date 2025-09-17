import { QiroFactory } from "../../generated/schema";
import {
  OwnershipTransferred,
  ExitManager as ExitManagerContract,
} from "../../generated/templates/ExitManager/ExitManager";

export function handleExitManagerOwnershipTransferred(
  event: OwnershipTransferred
): void {
  // Find the factory via the ExitManager contract
  let exitManager = ExitManagerContract.bind(event.address);
  let factoryAddress = exitManager.qiroFactory();

  let factory = QiroFactory.load(factoryAddress);
  if (factory == null) {
    return;
  }

  factory.exitManagerOwnerRole = event.params.newOwner;
  factory.save();
}