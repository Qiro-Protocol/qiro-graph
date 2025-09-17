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
    throw new Error("Factory not found for timelock address:" + event.address.toHexString());
  }

  factory.timelockManagerRole = event.params.newManager;
  factory.save();
}


