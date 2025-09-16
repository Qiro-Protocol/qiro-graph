import { QiroFactory } from "../../generated/schema";
import {
  TimelockManagerUpdated,
  TimelockVault as TimelockVaultContract,
} from "../../generated/templates/TimelockVault/TimelockVault";

export function handleTimelockManagerUpdated(
  event: TimelockManagerUpdated
): void {
  // Find the factory via the TimelockVault contract
  let vault = TimelockVaultContract.bind(event.address);
  let factoryAddress = vault.qiroFactory();

  let factory = QiroFactory.load(factoryAddress);
  if (factory == null) {
    return;
  }

  factory.timelockManager = event.params.newManager;
  factory.save();
}


