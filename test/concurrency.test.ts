import { runWithConcurrency } from "../src/utils/concurrency";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Bounded concurrency", function () {
  it("runs every item exactly once", async function () {
    const seen: number[] = [];
    await runWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
      seen.push(item);
    });
    assert.deepEqual(seen.slice().sort(), [1, 2, 3, 4, 5]);
  });

  it("never exceeds the limit", async function () {
    let inFlight = 0;
    let peak = 0;
    await runWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8], 3, async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await delay(5);
      inFlight--;
    });
    assert.isAtMost(peak, 3);
    assert.isAtLeast(peak, 2);
  });

  it("treats a limit below one as one", async function () {
    let inFlight = 0;
    let peak = 0;
    await runWithConcurrency([1, 2, 3], 0, async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await delay(2);
      inFlight--;
    });
    assert.strictEqual(peak, 1);
  });

  it("passes the index of each item", async function () {
    const pairs: string[] = [];
    await runWithConcurrency(["a", "b", "c"], 2, async (item, index) => {
      pairs.push(`${index}:${item}`);
    });
    assert.deepEqual(pairs.slice().sort(), ["0:a", "1:b", "2:c"]);
  });

  it("does nothing for an empty list", async function () {
    let calls = 0;
    await runWithConcurrency([], 4, async () => {
      calls++;
    });
    assert.strictEqual(calls, 0);
  });

  it("re-throws the first failure", async function () {
    let error: unknown;
    try {
      await runWithConcurrency([1, 2, 3], 2, async (item) => {
        if (item === 1) {
          throw new Error("boom");
        }
      });
    } catch (e) {
      error = e;
    }
    assert.isDefined(error);
    assert.strictEqual((error as Error).message, "boom");
  });

  it("stops starting new items after a failure", async function () {
    const started: number[] = [];
    try {
      await runWithConcurrency([1, 2, 3, 4, 5, 6], 1, async (item) => {
        started.push(item);
        if (item === 2) {
          throw new Error("stop");
        }
      });
    } catch (e) {
      // expected
    }
    assert.deepEqual(started, [1, 2]);
  });
});
