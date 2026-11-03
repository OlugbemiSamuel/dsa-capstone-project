import { newId, referenceCode } from "../src/domain/ids.js";

const TOTAL_BOOKINGS = 100000;
const LOOKUPS = 500;

// 1. Set up test data structures
const bookingsArray = [];
const bookingsMap = new Map();

console.log(`Generating ${TOTAL_BOOKINGS} mock bookings in memory...`);

for (let i = 0; i < TOTAL_BOOKINGS; i++) {
  const id = newId();
  const reference = referenceCode(8);
  const booking = { id, reference, userId: `user-${i}`, status: "CONFIRMED" };

  bookingsArray.push(booking);
  bookingsMap.set(reference, booking);
}

// Pick a random reference from near the end of the data to search for
const targetReference = bookingsArray[TOTAL_BOOKINGS - 50].reference;

// 2. Benchmark Array.find() O(N) lookup speed
console.time("Array.find (O(N)) time");
for (let i = 0; i < LOOKUPS; i++) {
  bookingsArray.find((b) => b.reference === targetReference);
}
console.timeEnd("Array.find (O(N)) time");

// 3. Benchmark Map.get() O(1) lookup speed
console.time("Map.get (O(1)) time");
for (let i = 0; i < LOOKUPS; i++) {
  bookingsMap.get(targetReference);
}
console.timeEnd("Map.get (O(1)) time");
