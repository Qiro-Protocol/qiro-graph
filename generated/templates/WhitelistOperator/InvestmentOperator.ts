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

export class Paused extends ethereum.Event {
  get params(): Paused__Params {
    return new Paused__Params(this);
  }
}

export class Paused__Params {
  _event: Paused;

  constructor(event: Paused) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Redeem extends ethereum.Event {
  get params(): Redeem__Params {
    return new Redeem__Params(this);
  }
}

export class Redeem__Params {
  _event: Redeem;

  constructor(event: Redeem) {
    this._event = event;
  }

  get poolId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get tranche(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get receiver(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get tokenAmount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get currencyAmount(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get price(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get totalPoolBalance(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }

  get juniorPoolBalance(): BigInt {
    return this._event.parameters[7].value.toBigInt();
  }

  get seniorPoolBalance(): BigInt {
    return this._event.parameters[8].value.toBigInt();
  }
}

export class Supply extends ethereum.Event {
  get params(): Supply__Params {
    return new Supply__Params(this);
  }
}

export class Supply__Params {
  _event: Supply;

  constructor(event: Supply) {
    this._event = event;
  }

  get poolId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get tranche(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get supplier(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get totalPoolBalance(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get juniorPoolBalance(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get seniorPoolBalance(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }
}

export class Unpaused extends ethereum.Event {
  get params(): Unpaused__Params {
    return new Unpaused__Params(this);
  }
}

export class Unpaused__Params {
  _event: Unpaused;

  constructor(event: Unpaused) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class InvestmentOperator__redemptionCalculatorJuniorResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;

  constructor(value0: BigInt, value1: BigInt, value2: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    return map;
  }

  getMaxTokenAmount(): BigInt {
    return this.value0;
  }

  getCurrencyAmount(): BigInt {
    return this.value1;
  }

  getPrice(): BigInt {
    return this.value2;
  }
}

export class InvestmentOperator__redemptionCalculatorSeniorResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;

  constructor(value0: BigInt, value1: BigInt, value2: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    return map;
  }

  getMaxTokenAmount(): BigInt {
    return this.value0;
  }

  getCurrencyAmount(): BigInt {
    return this.value1;
  }

  getPrice(): BigInt {
    return this.value2;
  }
}

export class InvestmentOperator extends ethereum.SmartContract {
  static bind(address: Address): InvestmentOperator {
    return new InvestmentOperator("InvestmentOperator", address);
  }

  JUNIOR(): Bytes {
    let result = super.call("JUNIOR", "JUNIOR():(bytes32)", []);

    return result[0].toBytes();
  }

  try_JUNIOR(): ethereum.CallResult<Bytes> {
    let result = super.tryCall("JUNIOR", "JUNIOR():(bytes32)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  SENIOR(): Bytes {
    let result = super.call("SENIOR", "SENIOR():(bytes32)", []);

    return result[0].toBytes();
  }

  try_SENIOR(): ethereum.CallResult<Bytes> {
    let result = super.tryCall("SENIOR", "SENIOR():(bytes32)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  assessor(): Address {
    let result = super.call("assessor", "assessor():(address)", []);

    return result[0].toAddress();
  }

  try_assessor(): ethereum.CallResult<Address> {
    let result = super.tryCall("assessor", "assessor():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  paused(): boolean {
    let result = super.call("paused", "paused():(bool)", []);

    return result[0].toBoolean();
  }

  try_paused(): ethereum.CallResult<boolean> {
    let result = super.tryCall("paused", "paused():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  redemptionCalculatorJunior(
    user: Address,
  ): InvestmentOperator__redemptionCalculatorJuniorResult {
    let result = super.call(
      "redemptionCalculatorJunior",
      "redemptionCalculatorJunior(address):(uint256,uint256,uint256)",
      [ethereum.Value.fromAddress(user)],
    );

    return new InvestmentOperator__redemptionCalculatorJuniorResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
    );
  }

  try_redemptionCalculatorJunior(
    user: Address,
  ): ethereum.CallResult<InvestmentOperator__redemptionCalculatorJuniorResult> {
    let result = super.tryCall(
      "redemptionCalculatorJunior",
      "redemptionCalculatorJunior(address):(uint256,uint256,uint256)",
      [ethereum.Value.fromAddress(user)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new InvestmentOperator__redemptionCalculatorJuniorResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
      ),
    );
  }

  redemptionCalculatorSenior(
    user: Address,
  ): InvestmentOperator__redemptionCalculatorSeniorResult {
    let result = super.call(
      "redemptionCalculatorSenior",
      "redemptionCalculatorSenior(address):(uint256,uint256,uint256)",
      [ethereum.Value.fromAddress(user)],
    );

    return new InvestmentOperator__redemptionCalculatorSeniorResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
    );
  }

  try_redemptionCalculatorSenior(
    user: Address,
  ): ethereum.CallResult<InvestmentOperator__redemptionCalculatorSeniorResult> {
    let result = super.tryCall(
      "redemptionCalculatorSenior",
      "redemptionCalculatorSenior(address):(uint256,uint256,uint256)",
      [ethereum.Value.fromAddress(user)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new InvestmentOperator__redemptionCalculatorSeniorResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
      ),
    );
  }

  whitelistOperator(): Address {
    let result = super.call(
      "whitelistOperator",
      "whitelistOperator():(address)",
      [],
    );

    return result[0].toAddress();
  }

  try_whitelistOperator(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "whitelistOperator",
      "whitelistOperator():(address)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _whitelistOperator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _assessor(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class RedeemJuniorCall extends ethereum.Call {
  get inputs(): RedeemJuniorCall__Inputs {
    return new RedeemJuniorCall__Inputs(this);
  }

  get outputs(): RedeemJuniorCall__Outputs {
    return new RedeemJuniorCall__Outputs(this);
  }
}

export class RedeemJuniorCall__Inputs {
  _call: RedeemJuniorCall;

  constructor(call: RedeemJuniorCall) {
    this._call = call;
  }

  get tokenAmount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get user(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RedeemJuniorCall__Outputs {
  _call: RedeemJuniorCall;

  constructor(call: RedeemJuniorCall) {
    this._call = call;
  }
}

export class RedeemSeniorCall extends ethereum.Call {
  get inputs(): RedeemSeniorCall__Inputs {
    return new RedeemSeniorCall__Inputs(this);
  }

  get outputs(): RedeemSeniorCall__Outputs {
    return new RedeemSeniorCall__Outputs(this);
  }
}

export class RedeemSeniorCall__Inputs {
  _call: RedeemSeniorCall;

  constructor(call: RedeemSeniorCall) {
    this._call = call;
  }

  get tokenAmount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get user(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RedeemSeniorCall__Outputs {
  _call: RedeemSeniorCall;

  constructor(call: RedeemSeniorCall) {
    this._call = call;
  }
}

export class SupplyJuniorCall extends ethereum.Call {
  get inputs(): SupplyJuniorCall__Inputs {
    return new SupplyJuniorCall__Inputs(this);
  }

  get outputs(): SupplyJuniorCall__Outputs {
    return new SupplyJuniorCall__Outputs(this);
  }
}

export class SupplyJuniorCall__Inputs {
  _call: SupplyJuniorCall;

  constructor(call: SupplyJuniorCall) {
    this._call = call;
  }

  get currencyAmount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get user(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class SupplyJuniorCall__Outputs {
  _call: SupplyJuniorCall;

  constructor(call: SupplyJuniorCall) {
    this._call = call;
  }
}

export class SupplySeniorCall extends ethereum.Call {
  get inputs(): SupplySeniorCall__Inputs {
    return new SupplySeniorCall__Inputs(this);
  }

  get outputs(): SupplySeniorCall__Outputs {
    return new SupplySeniorCall__Outputs(this);
  }
}

export class SupplySeniorCall__Inputs {
  _call: SupplySeniorCall;

  constructor(call: SupplySeniorCall) {
    this._call = call;
  }

  get currencyAmount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get receiver(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class SupplySeniorCall__Outputs {
  _call: SupplySeniorCall;

  constructor(call: SupplySeniorCall) {
    this._call = call;
  }
}
