import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import {
  SubscriptionCreated as SubscriptionCreatedEvent,
  SubscriptionFulfilled as SubscriptionFulfilledEvent,
} from "../generated/Coordinator/Coordinator";
import {
  Rely,
  RitualConsumer,
} from "../generated/RitualConsumer/RitualConsumer";
import {
  ComputeSubscription,
  MonitoringSubscription,
  SubscriptionResponse,
  MonitoringResponse,
} from "../generated/schema";
import { crypto, ethereum } from "@graphprotocol/graph-ts";
import { Coordinator } from "../generated/Coordinator/Coordinator";

// Coordinator addresses
const COORDINATOR_1 = "0xC758A17CD1ff3d1B2F6aa1325c038Ba28B70B9e6";
const COORDINATOR_2 = "0x5DA21CCf3c0b6B8bB0941a801deEEf53f971bb67";

// Consumer addresses
const CONSUMER_1 = "0x6C983f59841613AD46F8EF6596A621F43b29D81a";
const CONSUMER_2 = "0x9Ee14216A0ab80BB3F1b97cfE9F725B543138CD4";

export function handleSubscriptionCreated(
  event: SubscriptionCreatedEvent
): void {
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );

  let coordinator = Coordinator.bind(event.address);

  let consumerAddress: Address;

  if (event.address.toHexString() == COORDINATOR_1) {
    consumerAddress = Address.fromString(CONSUMER_1);
  } else {
    consumerAddress = Address.fromString(CONSUMER_2);
  }

  let consumer = RitualConsumer.bind(consumerAddress);
  let isComputeSub = consumer.try_subIdToAggregatedResult(event.params.id);
  // let avg = consumer.try_subIdToAggregatedResult(event.params.id).value;
  log.info("isComputeSub {}", [
    isComputeSub.value.getPushInferenceAvgToNftContract.toString(),
  ]);
  if (
    !isComputeSub.reverted &&
    isComputeSub.value.getPushInferenceAvgToNftContract() == true
  ) {
    let entity = new ComputeSubscription(cID);
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.subscriptionId = event.params.id;
    entity.coordinatorAddress = event.address;
    // try {
    // entity.tokenId = consumer.subIdToTokenId(event.params.id);
    // } catch (error) {
    const tokenId = consumer.try_subIdToTokenId(event.params.id);
    if (!tokenId.reverted && tokenId.value.notEqual(new BigInt(0))) {
      entity.tokenId = tokenId.value;
      log.info("Valid tokenId found for subId {} {}", [
        entity.tokenId.toString(),
        event.params.id.toString(),
      ]);
    } else {
      // Set default tokenId to 1 if tokenId is 0 or the call reverted
      entity.tokenId = BigInt.fromString("1");
      log.info("Default tokenId set to 1 for subId {} {}", [
        entity.tokenId.toString(),
        event.params.id.toString(),
      ]);
    }
    // }
    entity.average_prob_of_default = new BigInt(0);
    entity.average_loss_given_default = new BigInt(0);
    entity.average_risk_score = new BigInt(0);
    entity.average_exposure_at_default = new BigInt(0);
    //   entity.subscriptionResponses = []
    entity.save();
  } else {
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

  let consumerAddress: Address;
  if (event.address.toHexString() == COORDINATOR_1) {
    consumerAddress = Address.fromString(CONSUMER_1);
  } else {
    consumerAddress = Address.fromString(CONSUMER_2);
  }

  let consumer = RitualConsumer.bind(consumerAddress);
  let isComputeSub = consumer.try_subIdToAggregatedResult(event.params.id);
  // let avg = consumer.try_subIdToAggregatedResult(event.params.id).value;
  if (isComputeSub.reverted) {
    log.warning("Failed to get subscription type for id: {}", [event.params.id.toString()]);
    return;
  }

  // Add more detailed logging
  log.info("Subscription ID: {}, isComputeSub value: {}", [
    event.params.id.toString(),
    isComputeSub.value.getPushInferenceAvgToNftContract().toString()
  ]);

  if (
    !isComputeSub.reverted &&
    isComputeSub.value.getPushInferenceAvgToNftContract() == true
  ) {
    // Load the subscription
    let sub = ComputeSubscription.load(cID);
    // Check if the subscription exists
    if (sub == null) {
      log.info("Subscription not found for id: {}", [cID.toHex()]);
      return;
    }
    let entity = new SubscriptionResponse(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.isProofVerifiedOnchain = false;

    entity.subscription = sub.id;
    entity.nodeAddress = event.params.node;
    let decodedresults = consumer.getResponseFromSubIdAndNode(
      event.params.id,
      event.params.node
    );
    entity.prob_of_default = decodedresults[0];
    entity.loss_given_default = decodedresults[1];
    entity.risk_score = decodedresults[2];
    entity.exposure_at_default = decodedresults[3];
    entity.input = new Bytes(0);
    entity.output = new Bytes(0);
    entity.proof = new Bytes(0);
    decodeInputsCompute(event.transaction.input, entity);

    if (entity.proof != new Bytes(0)) {
      entity.isProofVerifiedOnchain = true;
    }
    entity.save();

    // now update subscription
    const avgArr = consumer.subIdToAvg(event.params.id);
    sub.average_prob_of_default = avgArr[0];
    sub.average_loss_given_default = avgArr[1];
    sub.average_risk_score = avgArr[2];
    sub.average_exposure_at_default = avgArr[3];
    sub.save();
  } else {
    // if monitoring subscription
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
function decodeInputsCompute(
  input: Bytes,
  entity: SubscriptionResponse
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
export function handleRely(event: Rely): void {}
