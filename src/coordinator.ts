import {
  ByteArray,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import {
  SubscriptionCreated as SubscriptionCreatedEvent,
  SubscriptionFulfilled as SubscriptionFulfilledEvent,
} from "../generated/Coordinator/Coordinator";
import { Subscription, SubscriptionResponse } from "../generated/schema";
import { crypto } from "@graphprotocol/graph-ts";

export function handleSubscriptionCreated(
  event: SubscriptionCreatedEvent
): void {
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );
  let entity = new Subscription(cID);

  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.subscriptionId = event.params.id;
  //   entity.subscriptionResponses = []
  entity.save();
}

export function handleSubscriptionFulfilled(
  event: SubscriptionFulfilledEvent
): void {
  let entity = new SubscriptionResponse(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );
  let sub = Subscription.load(cID);
  if (sub == null) {
    log.info("Message to be displayed", 1);
    return;
  }
  entity.subscription = sub.id;
  entity.save();
}
