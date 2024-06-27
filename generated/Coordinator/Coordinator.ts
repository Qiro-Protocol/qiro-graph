// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class NodeActivated extends ethereum.Event {
  get params(): NodeActivated__Params {
    return new NodeActivated__Params(this);
  }
}

export class NodeActivated__Params {
  _event: NodeActivated;

  constructor(event: NodeActivated) {
    this._event = event;
  }

  get node(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class NodeDeactivated extends ethereum.Event {
  get params(): NodeDeactivated__Params {
    return new NodeDeactivated__Params(this);
  }
}

export class NodeDeactivated__Params {
  _event: NodeDeactivated;

  constructor(event: NodeDeactivated) {
    this._event = event;
  }

  get node(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class NodeRegistered extends ethereum.Event {
  get params(): NodeRegistered__Params {
    return new NodeRegistered__Params(this);
  }
}

export class NodeRegistered__Params {
  _event: NodeRegistered;

  constructor(event: NodeRegistered) {
    this._event = event;
  }

  get node(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get registerer(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get cooldownStart(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class SubscriptionCancelled extends ethereum.Event {
  get params(): SubscriptionCancelled__Params {
    return new SubscriptionCancelled__Params(this);
  }
}

export class SubscriptionCancelled__Params {
  _event: SubscriptionCancelled;

  constructor(event: SubscriptionCancelled) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class SubscriptionCreated extends ethereum.Event {
  get params(): SubscriptionCreated__Params {
    return new SubscriptionCreated__Params(this);
  }
}

export class SubscriptionCreated__Params {
  _event: SubscriptionCreated;

  constructor(event: SubscriptionCreated) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class SubscriptionFulfilled extends ethereum.Event {
  get params(): SubscriptionFulfilled__Params {
    return new SubscriptionFulfilled__Params(this);
  }
}

export class SubscriptionFulfilled__Params {
  _event: SubscriptionFulfilled;

  constructor(event: SubscriptionFulfilled) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get node(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Coordinator__createSubscriptionDelegateeResult {
  value0: BigInt;
  value1: boolean;

  constructor(value0: BigInt, value1: boolean) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromBoolean(this.value1));
    return map;
  }

  getValue0(): BigInt {
    return this.value0;
  }

  getValue1(): boolean {
    return this.value1;
  }
}

export class Coordinator__createSubscriptionDelegateeInputSubStruct extends ethereum.Tuple {
  get owner(): Address {
    return this[0].toAddress();
  }

  get activeAt(): BigInt {
    return this[1].toBigInt();
  }

  get period(): BigInt {
    return this[2].toBigInt();
  }

  get frequency(): BigInt {
    return this[3].toBigInt();
  }

  get redundancy(): i32 {
    return this[4].toI32();
  }

  get maxGasPrice(): BigInt {
    return this[5].toBigInt();
  }

  get maxGasLimit(): BigInt {
    return this[6].toBigInt();
  }

  get containerId(): string {
    return this[7].toString();
  }

  get inputs(): Bytes {
    return this[8].toBytes();
  }
}

export class Coordinator__eip712DomainResult {
  value0: Bytes;
  value1: string;
  value2: string;
  value3: BigInt;
  value4: Address;
  value5: Bytes;
  value6: Array<BigInt>;

  constructor(
    value0: Bytes,
    value1: string,
    value2: string,
    value3: BigInt,
    value4: Address,
    value5: Bytes,
    value6: Array<BigInt>,
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromFixedBytes(this.value0));
    map.set("value1", ethereum.Value.fromString(this.value1));
    map.set("value2", ethereum.Value.fromString(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromAddress(this.value4));
    map.set("value5", ethereum.Value.fromFixedBytes(this.value5));
    map.set("value6", ethereum.Value.fromUnsignedBigIntArray(this.value6));
    return map;
  }

  getFields(): Bytes {
    return this.value0;
  }

  getName(): string {
    return this.value1;
  }

  getVersion(): string {
    return this.value2;
  }

  getChainId(): BigInt {
    return this.value3;
  }

  getVerifyingContract(): Address {
    return this.value4;
  }

  getSalt(): Bytes {
    return this.value5;
  }

  getExtensions(): Array<BigInt> {
    return this.value6;
  }
}

export class Coordinator__nodeInfoResult {
  value0: i32;
  value1: BigInt;

  constructor(value0: i32, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set(
      "value0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value0)),
    );
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getStatus(): i32 {
    return this.value0;
  }

  getCooldownStart(): BigInt {
    return this.value1;
  }
}

export class Coordinator__subscriptionsResult {
  value0: Address;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: i32;
  value5: BigInt;
  value6: BigInt;
  value7: string;
  value8: Bytes;

  constructor(
    value0: Address,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: i32,
    value5: BigInt,
    value6: BigInt,
    value7: string,
    value8: Bytes,
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
    this.value7 = value7;
    this.value8 = value8;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set(
      "value4",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value4)),
    );
    map.set("value5", ethereum.Value.fromUnsignedBigInt(this.value5));
    map.set("value6", ethereum.Value.fromUnsignedBigInt(this.value6));
    map.set("value7", ethereum.Value.fromString(this.value7));
    map.set("value8", ethereum.Value.fromBytes(this.value8));
    return map;
  }

  getOwner(): Address {
    return this.value0;
  }

  getActiveAt(): BigInt {
    return this.value1;
  }

  getPeriod(): BigInt {
    return this.value2;
  }

  getFrequency(): BigInt {
    return this.value3;
  }

  getRedundancy(): i32 {
    return this.value4;
  }

  getMaxGasPrice(): BigInt {
    return this.value5;
  }

  getMaxGasLimit(): BigInt {
    return this.value6;
  }

  getContainerId(): string {
    return this.value7;
  }

  getInputs(): Bytes {
    return this.value8;
  }
}

export class Coordinator extends ethereum.SmartContract {
  static bind(address: Address): Coordinator {
    return new Coordinator("Coordinator", address);
  }

  DELEGATEE_OVERHEAD_CACHED_WEI(): BigInt {
    let result = super.call(
      "DELEGATEE_OVERHEAD_CACHED_WEI",
      "DELEGATEE_OVERHEAD_CACHED_WEI():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_DELEGATEE_OVERHEAD_CACHED_WEI(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "DELEGATEE_OVERHEAD_CACHED_WEI",
      "DELEGATEE_OVERHEAD_CACHED_WEI():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  DELEGATEE_OVERHEAD_CREATE_WEI(): BigInt {
    let result = super.call(
      "DELEGATEE_OVERHEAD_CREATE_WEI",
      "DELEGATEE_OVERHEAD_CREATE_WEI():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_DELEGATEE_OVERHEAD_CREATE_WEI(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "DELEGATEE_OVERHEAD_CREATE_WEI",
      "DELEGATEE_OVERHEAD_CREATE_WEI():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  DELIVERY_OVERHEAD_WEI(): BigInt {
    let result = super.call(
      "DELIVERY_OVERHEAD_WEI",
      "DELIVERY_OVERHEAD_WEI():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_DELIVERY_OVERHEAD_WEI(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "DELIVERY_OVERHEAD_WEI",
      "DELIVERY_OVERHEAD_WEI():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  EIP712_NAME(): string {
    let result = super.call("EIP712_NAME", "EIP712_NAME():(string)", []);

    return result[0].toString();
  }

  try_EIP712_NAME(): ethereum.CallResult<string> {
    let result = super.tryCall("EIP712_NAME", "EIP712_NAME():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  EIP712_VERSION(): string {
    let result = super.call("EIP712_VERSION", "EIP712_VERSION():(string)", []);

    return result[0].toString();
  }

  try_EIP712_VERSION(): ethereum.CallResult<string> {
    let result = super.tryCall(
      "EIP712_VERSION",
      "EIP712_VERSION():(string)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  cooldown(): BigInt {
    let result = super.call("cooldown", "cooldown():(uint256)", []);

    return result[0].toBigInt();
  }

  try_cooldown(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("cooldown", "cooldown():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  createSubscription(
    containerId: string,
    inputs: Bytes,
    maxGasPrice: BigInt,
    maxGasLimit: BigInt,
    frequency: BigInt,
    period: BigInt,
    redundancy: i32,
  ): BigInt {
    let result = super.call(
      "createSubscription",
      "createSubscription(string,bytes,uint48,uint32,uint32,uint32,uint16):(uint32)",
      [
        ethereum.Value.fromString(containerId),
        ethereum.Value.fromBytes(inputs),
        ethereum.Value.fromUnsignedBigInt(maxGasPrice),
        ethereum.Value.fromUnsignedBigInt(maxGasLimit),
        ethereum.Value.fromUnsignedBigInt(frequency),
        ethereum.Value.fromUnsignedBigInt(period),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(redundancy)),
      ],
    );

    return result[0].toBigInt();
  }

  try_createSubscription(
    containerId: string,
    inputs: Bytes,
    maxGasPrice: BigInt,
    maxGasLimit: BigInt,
    frequency: BigInt,
    period: BigInt,
    redundancy: i32,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "createSubscription",
      "createSubscription(string,bytes,uint48,uint32,uint32,uint32,uint16):(uint32)",
      [
        ethereum.Value.fromString(containerId),
        ethereum.Value.fromBytes(inputs),
        ethereum.Value.fromUnsignedBigInt(maxGasPrice),
        ethereum.Value.fromUnsignedBigInt(maxGasLimit),
        ethereum.Value.fromUnsignedBigInt(frequency),
        ethereum.Value.fromUnsignedBigInt(period),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(redundancy)),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  createSubscriptionDelegatee(
    nonce: BigInt,
    expiry: BigInt,
    sub: Coordinator__createSubscriptionDelegateeInputSubStruct,
    v: i32,
    r: Bytes,
    s: Bytes,
  ): Coordinator__createSubscriptionDelegateeResult {
    let result = super.call(
      "createSubscriptionDelegatee",
      "createSubscriptionDelegatee(uint32,uint32,(address,uint32,uint32,uint32,uint16,uint48,uint32,string,bytes),uint8,bytes32,bytes32):(uint32,bool)",
      [
        ethereum.Value.fromUnsignedBigInt(nonce),
        ethereum.Value.fromUnsignedBigInt(expiry),
        ethereum.Value.fromTuple(sub),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(v)),
        ethereum.Value.fromFixedBytes(r),
        ethereum.Value.fromFixedBytes(s),
      ],
    );

    return new Coordinator__createSubscriptionDelegateeResult(
      result[0].toBigInt(),
      result[1].toBoolean(),
    );
  }

  try_createSubscriptionDelegatee(
    nonce: BigInt,
    expiry: BigInt,
    sub: Coordinator__createSubscriptionDelegateeInputSubStruct,
    v: i32,
    r: Bytes,
    s: Bytes,
  ): ethereum.CallResult<Coordinator__createSubscriptionDelegateeResult> {
    let result = super.tryCall(
      "createSubscriptionDelegatee",
      "createSubscriptionDelegatee(uint32,uint32,(address,uint32,uint32,uint32,uint16,uint48,uint32,string,bytes),uint8,bytes32,bytes32):(uint32,bool)",
      [
        ethereum.Value.fromUnsignedBigInt(nonce),
        ethereum.Value.fromUnsignedBigInt(expiry),
        ethereum.Value.fromTuple(sub),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(v)),
        ethereum.Value.fromFixedBytes(r),
        ethereum.Value.fromFixedBytes(s),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Coordinator__createSubscriptionDelegateeResult(
        value[0].toBigInt(),
        value[1].toBoolean(),
      ),
    );
  }

  delegateCreatedIds(param0: Bytes): BigInt {
    let result = super.call(
      "delegateCreatedIds",
      "delegateCreatedIds(bytes32):(uint32)",
      [ethereum.Value.fromFixedBytes(param0)],
    );

    return result[0].toBigInt();
  }

  try_delegateCreatedIds(param0: Bytes): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "delegateCreatedIds",
      "delegateCreatedIds(bytes32):(uint32)",
      [ethereum.Value.fromFixedBytes(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  eip712Domain(): Coordinator__eip712DomainResult {
    let result = super.call(
      "eip712Domain",
      "eip712Domain():(bytes1,string,string,uint256,address,bytes32,uint256[])",
      [],
    );

    return new Coordinator__eip712DomainResult(
      result[0].toBytes(),
      result[1].toString(),
      result[2].toString(),
      result[3].toBigInt(),
      result[4].toAddress(),
      result[5].toBytes(),
      result[6].toBigIntArray(),
    );
  }

  try_eip712Domain(): ethereum.CallResult<Coordinator__eip712DomainResult> {
    let result = super.tryCall(
      "eip712Domain",
      "eip712Domain():(bytes1,string,string,uint256,address,bytes32,uint256[])",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Coordinator__eip712DomainResult(
        value[0].toBytes(),
        value[1].toString(),
        value[2].toString(),
        value[3].toBigInt(),
        value[4].toAddress(),
        value[5].toBytes(),
        value[6].toBigIntArray(),
      ),
    );
  }

  getSubscriptionInterval(activeAt: BigInt, period: BigInt): BigInt {
    let result = super.call(
      "getSubscriptionInterval",
      "getSubscriptionInterval(uint32,uint32):(uint32)",
      [
        ethereum.Value.fromUnsignedBigInt(activeAt),
        ethereum.Value.fromUnsignedBigInt(period),
      ],
    );

    return result[0].toBigInt();
  }

  try_getSubscriptionInterval(
    activeAt: BigInt,
    period: BigInt,
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getSubscriptionInterval",
      "getSubscriptionInterval(uint32,uint32):(uint32)",
      [
        ethereum.Value.fromUnsignedBigInt(activeAt),
        ethereum.Value.fromUnsignedBigInt(period),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  id(): BigInt {
    let result = super.call("id", "id():(uint32)", []);

    return result[0].toBigInt();
  }

  try_id(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("id", "id():(uint32)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  maxSubscriberNonce(param0: Address): BigInt {
    let result = super.call(
      "maxSubscriberNonce",
      "maxSubscriberNonce(address):(uint32)",
      [ethereum.Value.fromAddress(param0)],
    );

    return result[0].toBigInt();
  }

  try_maxSubscriberNonce(param0: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "maxSubscriberNonce",
      "maxSubscriberNonce(address):(uint32)",
      [ethereum.Value.fromAddress(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  nodeInfo(param0: Address): Coordinator__nodeInfoResult {
    let result = super.call("nodeInfo", "nodeInfo(address):(uint8,uint32)", [
      ethereum.Value.fromAddress(param0),
    ]);

    return new Coordinator__nodeInfoResult(
      result[0].toI32(),
      result[1].toBigInt(),
    );
  }

  try_nodeInfo(
    param0: Address,
  ): ethereum.CallResult<Coordinator__nodeInfoResult> {
    let result = super.tryCall("nodeInfo", "nodeInfo(address):(uint8,uint32)", [
      ethereum.Value.fromAddress(param0),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Coordinator__nodeInfoResult(value[0].toI32(), value[1].toBigInt()),
    );
  }

  nodeResponded(param0: Bytes): boolean {
    let result = super.call("nodeResponded", "nodeResponded(bytes32):(bool)", [
      ethereum.Value.fromFixedBytes(param0),
    ]);

    return result[0].toBoolean();
  }

  try_nodeResponded(param0: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "nodeResponded",
      "nodeResponded(bytes32):(bool)",
      [ethereum.Value.fromFixedBytes(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  redundancyCount(param0: Bytes): i32 {
    let result = super.call(
      "redundancyCount",
      "redundancyCount(bytes32):(uint16)",
      [ethereum.Value.fromFixedBytes(param0)],
    );

    return result[0].toI32();
  }

  try_redundancyCount(param0: Bytes): ethereum.CallResult<i32> {
    let result = super.tryCall(
      "redundancyCount",
      "redundancyCount(bytes32):(uint16)",
      [ethereum.Value.fromFixedBytes(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  subscriptions(param0: BigInt): Coordinator__subscriptionsResult {
    let result = super.call(
      "subscriptions",
      "subscriptions(uint32):(address,uint32,uint32,uint32,uint16,uint48,uint32,string,bytes)",
      [ethereum.Value.fromUnsignedBigInt(param0)],
    );

    return new Coordinator__subscriptionsResult(
      result[0].toAddress(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toI32(),
      result[5].toBigInt(),
      result[6].toBigInt(),
      result[7].toString(),
      result[8].toBytes(),
    );
  }

  try_subscriptions(
    param0: BigInt,
  ): ethereum.CallResult<Coordinator__subscriptionsResult> {
    let result = super.tryCall(
      "subscriptions",
      "subscriptions(uint32):(address,uint32,uint32,uint32,uint16,uint48,uint32,string,bytes)",
      [ethereum.Value.fromUnsignedBigInt(param0)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Coordinator__subscriptionsResult(
        value[0].toAddress(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toI32(),
        value[5].toBigInt(),
        value[6].toBigInt(),
        value[7].toString(),
        value[8].toBytes(),
      ),
    );
  }
}

export class ActivateNodeCall extends ethereum.Call {
  get inputs(): ActivateNodeCall__Inputs {
    return new ActivateNodeCall__Inputs(this);
  }

  get outputs(): ActivateNodeCall__Outputs {
    return new ActivateNodeCall__Outputs(this);
  }
}

export class ActivateNodeCall__Inputs {
  _call: ActivateNodeCall;

  constructor(call: ActivateNodeCall) {
    this._call = call;
  }
}

export class ActivateNodeCall__Outputs {
  _call: ActivateNodeCall;

  constructor(call: ActivateNodeCall) {
    this._call = call;
  }
}

export class CancelSubscriptionCall extends ethereum.Call {
  get inputs(): CancelSubscriptionCall__Inputs {
    return new CancelSubscriptionCall__Inputs(this);
  }

  get outputs(): CancelSubscriptionCall__Outputs {
    return new CancelSubscriptionCall__Outputs(this);
  }
}

export class CancelSubscriptionCall__Inputs {
  _call: CancelSubscriptionCall;

  constructor(call: CancelSubscriptionCall) {
    this._call = call;
  }

  get subscriptionId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class CancelSubscriptionCall__Outputs {
  _call: CancelSubscriptionCall;

  constructor(call: CancelSubscriptionCall) {
    this._call = call;
  }
}

export class CreateSubscriptionCall extends ethereum.Call {
  get inputs(): CreateSubscriptionCall__Inputs {
    return new CreateSubscriptionCall__Inputs(this);
  }

  get outputs(): CreateSubscriptionCall__Outputs {
    return new CreateSubscriptionCall__Outputs(this);
  }
}

export class CreateSubscriptionCall__Inputs {
  _call: CreateSubscriptionCall;

  constructor(call: CreateSubscriptionCall) {
    this._call = call;
  }

  get containerId(): string {
    return this._call.inputValues[0].value.toString();
  }

  get inputs(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get maxGasPrice(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get maxGasLimit(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get frequency(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get period(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }

  get redundancy(): i32 {
    return this._call.inputValues[6].value.toI32();
  }
}

export class CreateSubscriptionCall__Outputs {
  _call: CreateSubscriptionCall;

  constructor(call: CreateSubscriptionCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class CreateSubscriptionDelegateeCall extends ethereum.Call {
  get inputs(): CreateSubscriptionDelegateeCall__Inputs {
    return new CreateSubscriptionDelegateeCall__Inputs(this);
  }

  get outputs(): CreateSubscriptionDelegateeCall__Outputs {
    return new CreateSubscriptionDelegateeCall__Outputs(this);
  }
}

export class CreateSubscriptionDelegateeCall__Inputs {
  _call: CreateSubscriptionDelegateeCall;

  constructor(call: CreateSubscriptionDelegateeCall) {
    this._call = call;
  }

  get nonce(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get expiry(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get sub(): CreateSubscriptionDelegateeCallSubStruct {
    return changetype<CreateSubscriptionDelegateeCallSubStruct>(
      this._call.inputValues[2].value.toTuple(),
    );
  }

  get v(): i32 {
    return this._call.inputValues[3].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[5].value.toBytes();
  }
}

export class CreateSubscriptionDelegateeCall__Outputs {
  _call: CreateSubscriptionDelegateeCall;

  constructor(call: CreateSubscriptionDelegateeCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }

  get value1(): boolean {
    return this._call.outputValues[1].value.toBoolean();
  }
}

export class CreateSubscriptionDelegateeCallSubStruct extends ethereum.Tuple {
  get owner(): Address {
    return this[0].toAddress();
  }

  get activeAt(): BigInt {
    return this[1].toBigInt();
  }

  get period(): BigInt {
    return this[2].toBigInt();
  }

  get frequency(): BigInt {
    return this[3].toBigInt();
  }

  get redundancy(): i32 {
    return this[4].toI32();
  }

  get maxGasPrice(): BigInt {
    return this[5].toBigInt();
  }

  get maxGasLimit(): BigInt {
    return this[6].toBigInt();
  }

  get containerId(): string {
    return this[7].toString();
  }

  get inputs(): Bytes {
    return this[8].toBytes();
  }
}

export class DeactivateNodeCall extends ethereum.Call {
  get inputs(): DeactivateNodeCall__Inputs {
    return new DeactivateNodeCall__Inputs(this);
  }

  get outputs(): DeactivateNodeCall__Outputs {
    return new DeactivateNodeCall__Outputs(this);
  }
}

export class DeactivateNodeCall__Inputs {
  _call: DeactivateNodeCall;

  constructor(call: DeactivateNodeCall) {
    this._call = call;
  }
}

export class DeactivateNodeCall__Outputs {
  _call: DeactivateNodeCall;

  constructor(call: DeactivateNodeCall) {
    this._call = call;
  }
}

export class DeliverComputeCall extends ethereum.Call {
  get inputs(): DeliverComputeCall__Inputs {
    return new DeliverComputeCall__Inputs(this);
  }

  get outputs(): DeliverComputeCall__Outputs {
    return new DeliverComputeCall__Outputs(this);
  }
}

export class DeliverComputeCall__Inputs {
  _call: DeliverComputeCall;

  constructor(call: DeliverComputeCall) {
    this._call = call;
  }

  get subscriptionId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get deliveryInterval(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get input(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }

  get output(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get proof(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class DeliverComputeCall__Outputs {
  _call: DeliverComputeCall;

  constructor(call: DeliverComputeCall) {
    this._call = call;
  }
}

export class DeliverComputeDelegateeCall extends ethereum.Call {
  get inputs(): DeliverComputeDelegateeCall__Inputs {
    return new DeliverComputeDelegateeCall__Inputs(this);
  }

  get outputs(): DeliverComputeDelegateeCall__Outputs {
    return new DeliverComputeDelegateeCall__Outputs(this);
  }
}

export class DeliverComputeDelegateeCall__Inputs {
  _call: DeliverComputeDelegateeCall;

  constructor(call: DeliverComputeDelegateeCall) {
    this._call = call;
  }

  get nonce(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get expiry(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get sub(): DeliverComputeDelegateeCallSubStruct {
    return changetype<DeliverComputeDelegateeCallSubStruct>(
      this._call.inputValues[2].value.toTuple(),
    );
  }

  get v(): i32 {
    return this._call.inputValues[3].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[5].value.toBytes();
  }

  get deliveryInterval(): BigInt {
    return this._call.inputValues[6].value.toBigInt();
  }

  get input(): Bytes {
    return this._call.inputValues[7].value.toBytes();
  }

  get output(): Bytes {
    return this._call.inputValues[8].value.toBytes();
  }

  get proof(): Bytes {
    return this._call.inputValues[9].value.toBytes();
  }
}

export class DeliverComputeDelegateeCall__Outputs {
  _call: DeliverComputeDelegateeCall;

  constructor(call: DeliverComputeDelegateeCall) {
    this._call = call;
  }
}

export class DeliverComputeDelegateeCallSubStruct extends ethereum.Tuple {
  get owner(): Address {
    return this[0].toAddress();
  }

  get activeAt(): BigInt {
    return this[1].toBigInt();
  }

  get period(): BigInt {
    return this[2].toBigInt();
  }

  get frequency(): BigInt {
    return this[3].toBigInt();
  }

  get redundancy(): i32 {
    return this[4].toI32();
  }

  get maxGasPrice(): BigInt {
    return this[5].toBigInt();
  }

  get maxGasLimit(): BigInt {
    return this[6].toBigInt();
  }

  get containerId(): string {
    return this[7].toString();
  }

  get inputs(): Bytes {
    return this[8].toBytes();
  }
}

export class RegisterNodeCall extends ethereum.Call {
  get inputs(): RegisterNodeCall__Inputs {
    return new RegisterNodeCall__Inputs(this);
  }

  get outputs(): RegisterNodeCall__Outputs {
    return new RegisterNodeCall__Outputs(this);
  }
}

export class RegisterNodeCall__Inputs {
  _call: RegisterNodeCall;

  constructor(call: RegisterNodeCall) {
    this._call = call;
  }

  get node(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RegisterNodeCall__Outputs {
  _call: RegisterNodeCall;

  constructor(call: RegisterNodeCall) {
    this._call = call;
  }
}
