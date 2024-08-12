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

let coordinatorAddress = Address.fromString(
  "0xBA4132229e49A466afFA976f2850C3eDF4E01615"
);
let consumerAddress = Address.fromString(
  "0x8F80036c01692df40e1aC95Bda71d0E2ea6da6a6"
);

export function handleSubscriptionCreated(
  event: SubscriptionCreatedEvent
): void {
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );

  let coordinator = Coordinator.bind(coordinatorAddress);
  let consumer = RitualConsumer.bind(consumerAddress);
  let nameOfContainer = coordinator
    .subscriptions(event.params.id)
    .getContainerId();
  if (nameOfContainer == "qiro-policy") {
    let entity = new ComputeSubscription(cID);
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.subscriptionId = event.params.id;
    // try {
    // entity.tokenId = consumer.subIdToTokenId(event.params.id);
    // } catch (error) {
    const tokenId = consumer.try_subIdToTokenId(event.params.id);
    if (tokenId.reverted == false) {
      entity.tokenId = tokenId.value;
    } else {
      entity.tokenId = new BigInt(0);
    }
    // }
    entity.average_prob_of_default = new BigInt(0);
    entity.average_loss_given_default = new BigInt(0);
    entity.average_risk_score = new BigInt(0);
    entity.average_exposure_at_default = new BigInt(0);
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
  log.info("nameOfContainer: {}", ["staring sub fullfill handler"]);

  // Create a unique ID for the subscription
  let cID = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromBigInt(event.params.id))
  );
  let coordinator = Coordinator.bind(coordinatorAddress);
  let consumer = RitualConsumer.bind(consumerAddress);

  let nameOfContainer = coordinator
    .subscriptions(event.params.id)
    .getContainerId();
  log.info("nameOfContainer: {}, {}", [
    nameOfContainer,
    event.params.id.toString(),
  ]);
  
  if (nameOfContainer == "qiro-policy") {
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
    decodeInputsCompute(event.transaction.input, entity);
    if(entity.proof != new Bytes(0)) {
      entity.isProofVerifiedOnchain = true;
    }
    entity.save();
    const aggResult = consumer.try_subIdToAggregatedResult(event.params.id);
    if (aggResult.reverted == false) {
      sub.average_prob_of_default = aggResult.value.getProb_of_default();
      sub.average_loss_given_default = aggResult.value.getLoss_given_default();
      sub.average_risk_score = aggResult.value.getRisk_score();
      sub.average_exposure_at_default =
        aggResult.value.getExposure_at_default();
      sub.save();
    } else {
      sub.average_prob_of_default = new BigInt(0);
      sub.average_loss_given_default = new BigInt(0);
      sub.average_risk_score = new BigInt(0);
      sub.average_exposure_at_default = new BigInt(0);
    }
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
  // entity.tokenChainId = new BigInt(11155111);
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
    entity.proof = proof
    const decoded2 = ethereum.decode("(bytes,bytes)", output);
    if (decoded2 != null) {
      const t = decoded2.toTuple();
      let rawOutput = t[0].toBytes();
      let processedOutput = t[1].toBytes();

      // Decode the raw output to get the uint256 array
      const rawDecoded = ethereum.decode("uint256[]", rawOutput);

      if (rawDecoded != null) {
        const rawArray = rawDecoded.toArray();

        // Assuming rawArray contains at least 4 elements, otherwise handle the error
        if (rawArray.length >= 4) {
          entity.prob_of_default = rawArray[0].toBigInt();
          entity.loss_given_default = rawArray[1].toBigInt();
          entity.risk_score = rawArray[2].toBigInt();
          entity.exposure_at_default = rawArray[3].toBigInt();
        } else {
          log.error("Decoded rawArray does not contain enough elements.", []);
          entity.prob_of_default = new BigInt(0);
          entity.loss_given_default = new BigInt(0);
          entity.risk_score = new BigInt(0);
          entity.exposure_at_default = new BigInt(0);
        }
      } else {
        log.error("Failed to decode rawOutput.", []);
        entity.prob_of_default = new BigInt(0);
        entity.loss_given_default = new BigInt(0);
        entity.risk_score = new BigInt(0);
        entity.exposure_at_default = new BigInt(0);
      }
      entity.save();
    } else {
      log.error("Decoded2 null hai", []);
      entity.prob_of_default = new BigInt(0);
      entity.loss_given_default = new BigInt(0);
      entity.risk_score = new BigInt(0);
      entity.exposure_at_default = new BigInt(0);
    }
  } else {
    entity.input = new Bytes(0);
    entity.output = new Bytes(0);
    entity.proof = new Bytes(0);
  }
}
export function handleRely(event: Rely): void {}

// export function decodeSubscriptionFulfilled(input: Bytes): void {
//   // First 4 bytes are the function selector, so skip them
//   const functionInput = input.subarray(4);
//   // Prepend a "tuple" prefix
//   const tuplePrefix = Bytes.fromHexString(
//     "0x0000000000000000000000000000000000000000000000000000000000000020"
//   );
//   const functionInputAsTuple = new Uint8Array(
//     tuplePrefix.length + functionInput.length
//   );

//   // Concatenate prefix & original input
//   functionInputAsTuple.set(tuplePrefix, 0);
//   functionInputAsTuple.set(functionInput, tuplePrefix.length);

//   const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);
//   const decoded = ethereum.decode("(bytes,bytes)", tupleInputBytes);

//   if (decoded != null) {
//     const t = decoded.toTuple();
//     let rawOutput = t[0].toBytes();
//     let processedOutput = t[1].toBytes();

//     // Decode the raw output to get the uint256 array
//     const rawDecoded = ethereum.decode("uint256[]", rawOutput);
//     if (rawDecoded != null) {
//       const rawArray = rawDecoded.toArray();
//       const probOfDefault = rawArray[0].toBigInt();
//       const lossGivenDefault = rawArray[1].toBigInt();
//       const riskScore = rawArray[2].toBigInt();
//       const exposureAtDefault = rawArray[3].toBigInt();

//       // Print or use the extracted values
//       log.info("Probability of Default: {}", [probOfDefault.toString()]);
//       log.info("Loss Given Default: {}", [lossGivenDefault.toString()]);
//       log.info("Risk Score: {}", [riskScore.toString()]);
//       log.info("Exposure at Default: {}", [exposureAtDefault.toString()]);
//     }
//   }
// }
