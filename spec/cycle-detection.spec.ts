import 'jasmine';
import 'reflect-metadata';
import {Container, Inject, Injectable} from '../src/index.js';

describe('Dependency cycle detection', () => {
  /*it('Should detect synchronous dependency cycles and throw', () => {
    @Injectable()
    class A {
      constructor(public b: B) {}
    }

    @Injectable()
    class B {
      constructor(public c: C) {}
    }

    @Injectable()
    class C {
      constructor(public a: A) {}
    }

    const container = new Container();
    container.bindClass(A);
    container.bindClass(B);
    container.bindClass(C);

    function resolveWithCycle() {
      container.get(A);
    }

    expect(resolveWithCycle).toThrowError(/Dependency cycle detected/);
  });

  it('Should detect asynchronous dependency cycles and throw', async () => {
    @Injectable()
    class AsyncA {
      constructor(public b: AsyncB) { }
    }

    @Injectable()
    class AsyncB {
      constructor(public c: AsyncC) {}
    }

    @Injectable()
    class AsyncC {
      constructor(public a: AsyncA) {}
    }

    const container = new Container();
    container.bindClass(AsyncA);
    container.bindClass(AsyncB);
    container.bindClass(AsyncC);

    try {
      await container.resolve(AsyncA);
      fail('Should have thrown a cycle detection error');
    } catch (error) {
      expect(error.message).toMatch(/Dependency cycle detected/);
    }
  });
*/
  it('Should detect cycles with factory providers', async () => {
    @Injectable()
    class FactoryA {
      constructor() {}
    }

    @Injectable()
    class FactoryB {
      constructor(public a: FactoryA) {}
    }

    const container = new Container();
    
    container.bindFactory(FactoryA, (injector) => {
      // Create a cycle by having FactoryA depend on FactoryB
      const b = injector.get(FactoryB);
      return new FactoryA();
    });
    
    container.bindClass(FactoryB);

    function resolveWithCycle() {
      container.get(FactoryA);
    }

    expect(resolveWithCycle).toThrowError(/Dependency cycle detected/);
  });

  it('Should detect cycles with async factory providers', async () => {
    @Injectable()
    class AsyncFactoryA {
      constructor() {}
    }

    @Injectable()
    class AsyncFactoryB {
      constructor(public a: AsyncFactoryA) {}
    }

    const container = new Container();
    
    container.bindAsyncFactory(AsyncFactoryA, async (injector) => {
      // Create a cycle by having AsyncFactoryA depend on AsyncFactoryB
      const b = await injector.resolve(AsyncFactoryB);
      return new AsyncFactoryA();
    });
    
    container.bindClass(AsyncFactoryB);

    try {
      await container.resolve(AsyncFactoryA);
      fail('Should have thrown a cycle detection error');
    } catch (error) {
      expect(error.message).toMatch(/Dependency cycle detected/);
    }
  });
});
