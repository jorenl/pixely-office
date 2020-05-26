export function shouldBeNever(n: never) {
  throw new Error("Reached code that was expected to be unreachable");
}
