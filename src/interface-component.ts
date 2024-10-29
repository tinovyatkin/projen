// import * as assert from "node:assert";
import { Construct, IConstruct } from "constructs";
import { Component } from "./component";

const METADATA_TYPE = "interface";

/**
 * Abstract base class for a component that implements some interface
 * and which can delegate to any other construct to be a discoverable implementation of those
 * interface(s).
 *
 * This is useful when you have several interfaces that can be implemented either by
 * a dedicated components or a single component (similar to multiple class inheritance in Python)
 * and you need a way to make these implementations discoverable like
 * `someInstance instanceof SomeInterface`
 *
 * NOTE: `instanceof` check for such classes disrespects inheritance chain,
 * i.e. `foo instanceof GrandMotherOfFooClass` will be falsy without explicit
 * `GrandMotherOfFooClass.delegateImplementation(foo)`
 */
export abstract class InterfaceComponent extends Component {
  /**
   * Mark provided construct as an implementation of this component interface(s)
   *
   * @param implementer - a construct to be marked as implemented
   */
  static delegateImplementation(implementer: IConstruct) {
    implementer.node.addMetadata(METADATA_TYPE, this.name);
  }

  /**
   * @internal
   */
  static [Symbol.hasInstance](instance: unknown) {
    return (
      Construct.isConstruct(instance) &&
      instance.node.metadata.some(
        (entry) => entry.type === METADATA_TYPE && entry.data === this.name
      )
    );
  }

  constructor(scope: IConstruct) {
    super(scope);

    this.node.addMetadata(METADATA_TYPE, new.target.name);
  }
}
