// A stable merge sort.
// It always returns a brand-new array and never changes the array it was given.

// Merges two already-sorted arrays into one new sorted array.
// When two items compare as equal, the item from `left` is taken first,
// so equal items keep the order they had in the original list. That is
// what makes the sort stable.
const merge = (left, right, compare) => {
  // The new array we are building. We never push into `left` or `right`.
  const merged = [];

  // i walks through `left`, j walks through `right`.
  let i = 0;
  let j = 0;

  // While both sides still have items, compare the current items and
  // append the smaller one. On a tie (compare returns 0) we take from
  // `left` first, which preserves the original order -> stability.
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      merged.push(left[i]);
      i += 1;
    } else {
      merged.push(right[j]);
      j += 1;
    }
  }

  // If one side ran out first, the other side may still have leftovers.
  // Those leftovers are already sorted, so just append them in order.
  while (i < left.length) {
    merged.push(left[i]);
    i += 1;
  }
  while (j < right.length) {
    merged.push(right[j]);
    j += 1;
  }

  return merged;
};

// Sorts `items` using merge sort and returns a NEW sorted array.
// `compare(a, b)` should return a negative number if a comes before b,
// zero if they are equal, and a positive number if a comes after b.
// The original `items` array is never modified.
export const mergeSort = (
  items,
  compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0),
) => {
  // Base case: an empty array or a single item is already sorted.
  // We return a copy (slice) so the caller always gets a new array and
  // the input is never handed back unchanged or mutated.
  if (items.length <= 1) {
    return items.slice();
  }

  // Split the array into two halves. slice creates brand-new arrays,
  // so the original `items` is not touched here either.
  const middle = Math.floor(items.length / 2);
  const left = items.slice(0, middle);
  const right = items.slice(middle);

  // Recursion: sort each half by calling mergeSort on it. Each call
  // works on a smaller slice, so the pieces keep getting smaller until
  // they hit the base case (length 0 or 1) and start merging back up.
  const sortedLeft = mergeSort(left, compare);
  const sortedRight = mergeSort(right, compare);

  // Merge the two sorted halves into one new sorted array.
  return merge(sortedLeft, sortedRight, compare);
};
