import { ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import {
  SubscriptionCreated as SubscriptionCreatedEvent,
  SubscriptionFulfilled as SubscriptionFulfilledEvent,
} from "../generated/Coordinator/Coordinator";
import { ComputeSubscription, SubscriptionResponse } from "../generated/schema";
import { crypto, ethereum } from "@graphprotocol/graph-ts";

function bytesToUint32(bytes: Bytes, start: i32): u32 {
  let value: u32 = 0;
  for (let i = 0; i < 4; i++) {
    value = value << 8;
    value = value | bytes[start + i];
  }
  return value;
}

export function handleSubscriptionCreated(
  event: SubscriptionCreatedEvent
): void {
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );
  let entity = new ComputeSubscription(cID);

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

  // Create a unique ID for the subscription
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );

  // Load the subscription
  let sub = ComputeSubscription.load(cID);

  // Check if the subscription exists
  if (sub == null) {
    log.info("Subscription not found for id: {}", [cID.toHex()]);
    return;
  }

  // Assign the subscription ID to the subscription field
  entity.subscription = sub.id;

  // Assuming inputData is properly formatted, parse it
  // First 4 bytes are function selector, so we skip them
  const functionInput = event.transaction.input.subarray(4);
  //prepend a "tuple" prefix (function params are arrays, not tuples)
  const tuplePrefix = ByteArray.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000020"
  );
  const functionInputAsTuple = new Uint8Array(
    tuplePrefix.length + functionInput.length
  );

  //concat prefix & original input
  functionInputAsTuple.set(tuplePrefix, 0);
  functionInputAsTuple.set(functionInput, tuplePrefix.length);

  const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);
  const decoded = ethereum.decode(
    "(uint32,uint32,bytes,bytes,bytes)",
    tupleInputBytes
  );
  if (decoded != null) {
    const t = decoded.toTuple();
    entity.input = t[2].toBytes(); // Convert to Bytes
    entity.output = t[3].toBytes(); // Convert to Bytes
    entity.proof = t[4].toBytes(); // Convert to Bytes
    //   entity.input = Bytes.fromUint8Array(inputBytes); // Convert to Bytes
    //   entity.output = Bytes.fromUint8Array(outputBytes); // Convert to Bytes
    //   entity.proof = Bytes.fromUint8Array(proofBytes); // Convert to Bytes
  }

  // Assign values to entity fields
  entity.nodeAddress = event.params.node;
  entity.save();
}
