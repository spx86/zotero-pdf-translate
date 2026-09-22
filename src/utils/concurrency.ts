/**
 * Run independent jobs with a bounded number of them in flight.
 *
 * The worker stores its own result, so nothing is collected here and the
 * order in which jobs finish does not matter. After the first failure no new
 * job is started; jobs already running are awaited, then the first error is
 * re-thrown, so the caller sees the original reason.
 */
export async function runWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const list = items || [];
  if (list.length === 0) {
    return;
  }
  const limit = Math.min(
    Math.max(1, Math.floor(concurrency) || 1),
    list.length,
  );

  let next = 0;
  let failed = false;
  let failure: unknown;

  const runners = Array.from({ length: limit }, async () => {
    while (!failed) {
      const index = next++;
      if (index >= list.length) {
        return;
      }
      try {
        await worker(list[index], index);
      } catch (e) {
        if (!failed) {
          failed = true;
          failure = e;
        }
        return;
      }
    }
  });

  await Promise.all(runners);

  if (failed) {
    throw failure;
  }
}
