import { Component, InterfaceComponent, Project } from "../src";

interface IFoo {
  readonly fooPath: string;
}
class Foo extends InterfaceComponent implements IFoo {
  static of(project: Project) {
    return project.components.find((c) => c instanceof this);
  }
  readonly fooPath = "fakePath";
}

describe("InterfaceComponent", () => {
  test("can be used a a base class", () => {
    const project = new Project({
      name: "root",
    });

    const foo = new Foo(project);
    const fooOfProject = project.components.find((c) => c instanceof Foo);
    expect(fooOfProject).toBe(foo);

    expect(foo.node.metadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "interface", data: "Foo" }),
      ])
    );
  });

  test("instanceof does not respect inheritance if not explicitly delegated", () => {
    class NewFoo extends Foo {}
    const project = new Project({
      name: "root",
    });
    const newFoo = new NewFoo(project);
    const oldFoo = new Foo(project);

    const foos = project.components.filter((c) => c instanceof Foo);
    expect(foos).toHaveLength(1); // `NewFoo instances Foo` will be falsy without explicit `Foo.delegateImplementation(newFoo)`
    const newFoos = project.components.filter((c) => c instanceof NewFoo);
    expect(newFoos).toHaveLength(1);
    expect(oldFoo instanceof NewFoo).toBeFalsy();

    expect(Foo.of(project)).toBe(oldFoo);
    expect(NewFoo.of(project)).toBe(newFoo);
  });

  test("can delegate implementation", () => {
    const project = new Project({
      name: "root",
    });

    const boo = new (class extends Component implements IFoo {
      fooPath = "fakeBooPath";
    })(project);
    Foo.delegateImplementation(boo);

    const fooOfProject = Foo.of(project);
    expect(fooOfProject).toBe(boo);
  });

  test("single construct can be the implementer of several interfaces", () => {
    interface IFooManager {
      readonly fooStore: Foo[];
    }
    class FooManager extends InterfaceComponent implements IFooManager {
      //   static readonly SPECIES_METADATA = "Foo::Manager";
      static of(project: Project) {
        return project.components.find((c) => c instanceof FooManager);
      }
      readonly fooStore: Foo[] = [];
    }

    const project = new Project({
      name: "root",
    });
    const boo = new (class extends Component implements IFoo, IFooManager {
      fooStore: Foo[] = [];
      fooPath = "booPath";
    })(project);
    Foo.delegateImplementation(boo);
    FooManager.delegateImplementation(boo);

    expect(Foo.of(project)).toBe(boo);
    expect(FooManager.of(project)).toBe(boo);

    expect(boo.node.metadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "interface", data: "Foo" }),
        expect.objectContaining({ type: "interface", data: "FooManager" }),
      ])
    );
  });
});
