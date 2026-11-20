import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeSort } from "../src/domain/sorting.js";

describe("mergeSort", () => {
  it("sorts an array of numbers in ascending order", () => {
    const input = [5, 2, 9, 1, 5, 6];
    const result = mergeSort(input, (a, b) => a - b);
    assert.deepStrictEqual(result, [1, 2, 5, 5, 6, 9]);
  });

  it("is stable: equal items keep their original relative order", () => {
    // Two items with value 1 (a, c) and two with value 2 (b, d).
    // After sorting by value, all 1s come before all 2s, and within each
    // group the original order (a before c, b before d) is preserved.
    const items = [
      { value: 1, order: "a" },
      { value: 2, order: "b" },
      { value: 1, order: "c" },
      { value: 2, order: "d" },
    ];
    const result = mergeSort(items, (a, b) => a.value - b.value);
    assert.deepStrictEqual(
      result.map((item) => item.order),
      ["a", "c", "b", "d"],
    );
  });

  it("returns a new array and never mutates the input", () => {
    const input = [3, 1, 2];
    const inputCopy = [...input];
    const result = mergeSort(input, (a, b) => a - b);

    // result is a different array object from input
    assert.notStrictEqual(result, input);
    // input is unchanged
    assert.deepStrictEqual(input, inputCopy);
  });

  it("handles an empty array", () => {
    assert.deepStrictEqual(
      mergeSort([], (a, b) => a - b),
      [],
    );
  });

  it("handles a single-element array", () => {
    assert.deepStrictEqual(
      mergeSort([42], (a, b) => a - b),
      [42],
    );
  });

  it("handles an already-sorted array", () => {
    assert.deepStrictEqual(
      mergeSort([1, 2, 3], (a, b) => a - b),
      [1, 2, 3],
    );
  });

  it("handles a reverse-sorted array", () => {
    assert.deepStrictEqual(
      mergeSort([3, 2, 1], (a, b) => a - b),
      [1, 2, 3],
    );
  });

  it("sorts strings with the default comparator", () => {
    assert.deepStrictEqual(mergeSort(["banana", "apple", "cherry"]), [
      "apple",
      "banana",
      "cherry",
    ]);
  });

  it("works with a custom object comparator (stable on equal ages)", () => {
    const people = [
      { name: "Chi", age: 30 },
      { name: "Ada", age: 30 },
      { name: "Bayo", age: 25 },
    ];
    const result = mergeSort(people, (a, b) => a.age - b.age);
    // Bayo (25) first. Chi and Ada are both 30; stable sort keeps Chi before Ada.
    assert.deepStrictEqual(
      result.map((p) => p.name),
      ["Bayo", "Chi", "Ada"],
    );
  });
});
