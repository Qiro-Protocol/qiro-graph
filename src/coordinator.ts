import { Address, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import {
  SubscriptionCreated as SubscriptionCreatedEvent,
  SubscriptionFulfilled as SubscriptionFulfilledEvent,
} from "../generated/Coordinator/Coordinator";
import {
  ComputeSubscription,
  MonitoringSubscription,
  SubscriptionResponse,
  MonitoringResponse,
} from "../generated/schema";
import { crypto, ethereum } from "@graphprotocol/graph-ts";
import { Coordinator } from "../generated/Coordinator/Coordinator";

let coordinatorAddress = Address.fromString(
  "0xe053df33562600a21c5bd587892d01dc6a0e49d2"
);

export function handleSubscriptionCreated(
  event: SubscriptionCreatedEvent
): void {
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );

  let coordinator = Coordinator.bind(coordinatorAddress);
  let nameOfContainer = coordinator
    .subscriptions(event.params.id)
    .getContainerId();
  if (nameOfContainer == "qiro-policy") {
    let entity = new ComputeSubscription(cID);
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.subscriptionId = event.params.id;
    //   entity.subscriptionResponses = []
    entity.save();
  } else if (nameOfContainer == "qiro-monitoring-policy") {
    let entity = new MonitoringSubscription(cID);
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.subscriptionId = event.params.id;
    //   entity.subscriptionResponses = []
    entity.save();
  }
}

export function handleSubscriptionFulfilled(
  event: SubscriptionFulfilledEvent
): void {
  // Create a unique ID for the subscription
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );

  let coordinator = Coordinator.bind(coordinatorAddress);
  let nameOfContainer = coordinator
    .subscriptions(event.params.id)
    .getContainerId();
  if (nameOfContainer == "qiro-policy") {
    let entity = new SubscriptionResponse(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    // Load the subscription
    let sub = ComputeSubscription.load(cID);
    // Check if the subscription exists
    if (sub == null) {
      log.info("Subscription not found for id: {}", [cID.toHex()]);
      return;
    }
    entity.subscription = sub.id;
    entity.nodeAddress = event.params.node;
    decodeInputsCompute(event.transaction.input, entity);
    entity.save();
  } else if (nameOfContainer == "qiro-monitoring-policy") {
    let entity = new MonitoringResponse(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    let sub = MonitoringSubscription.load(cID);
    if (sub == null) {
      log.info("Subscription not found for id: {}", [cID.toHex()]);
      return;
    }

    // Assign the subscription ID to the subscription field
    entity.subscription = sub.id;
    entity.nodeAddress = event.params.node;
    decodeInputsMonitoring(event.transaction.input, entity);
    // entity.input = resultDecoded.input;
    // entity.output = resultDecoded.output;
    // entity.proof = resultDecoded.proof;
    // Assign values to entity fields
    entity.save();
  }
}

function decodeInputsMonitoring(
  input: Bytes,
  entity: MonitoringResponse
): void {
  // Assuming inputData is properly formatted, parse it
  // First 4 bytes are function selector, so we skip them
  const functionInput = input.subarray(4);
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
    let input = t[2].toBytes(); // Convert to Bytes
    let output = t[3].toBytes(); // Convert to Bytes
    let proof = t[4].toBytes(); // Convert to Bytes
    //   entity.input = Bytes.fromUint8Array(inputBytes); // Convert to Bytes
    //   entity.output = Bytes.fromUint8Array(outputBytes); // Convert to Bytes
    //   entity.proof = Bytes.fromUint8Array(proofBytes); // Convert to Bytes
    entity.input = input;
    entity.output = output;
    entity.proof = proof;
    entity.save();
  } else {
    entity.input = new Bytes(0);
    entity.output = new Bytes(0);
    entity.proof = new Bytes(0);
    entity.save();
  }
}
function decodeInputsCompute(input: Bytes, entity: SubscriptionResponse): void {
  // Assuming inputData is properly formatted, parse it
  // First 4 bytes are function selector, so we skip them
  const functionInput = input.subarray(4);
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
    let input = t[2].toBytes(); // Convert to Bytes
    let output = t[3].toBytes(); // Convert to Bytes
    let proof = t[4].toBytes(); // Convert to Bytes
    //   entity.input = Bytes.fromUint8Array(inputBytes); // Convert to Bytes
    //   entity.output = Bytes.fromUint8Array(outputBytes); // Convert to Bytes
    //   entity.proof = Bytes.fromUint8Array(proofBytes); // Convert to Bytes
    entity.input = input;
    entity.output = output;
    entity.proof = proof;
    entity.save();
  } else {
    entity.input = new Bytes(0);
    entity.output = new Bytes(0);
    entity.proof = new Bytes(0);
    entity.save();
  }
}
