import {
  createStore,
  createEvent,
  addTier,
  bookTickets,
  cancelBooking,
  findBookingByReference,
  joinWaitlist,
} from "../src/domain/inventory.js";

// 1. Initialize a fresh store
const store = createStore();

console.log("--- EVENT TICKETING DEMO START ---");

// 2. Create a new event and publish/open it
const event = createEvent(store, {
  title: "Family Fun Fiesta 2026",
  city: "Lagos",
  venue: "Tafawa Balewa Square",
  startsAt: "2026-12-15T10:00:00Z",
  organizerId: "org-123",
});
console.log(`Event Created: "${event.title}" (${event.status})`);

// 3. Add a ticket tier with a small capacity of 3 seats for testing limits
const vipTier = addTier(store, event.id, {
  name: "VIP Pass",
  priceCents: 50000,
  capacity: 3,
});
console.log(
  `Tier Added: "${vipTier.name}" with capacity of ${vipTier.capacity}`,
);

// 4. Ada books 2 tickets successfully
const adaBooking = bookTickets(store, vipTier.id, "user-ada", 2);
console.log(
  `SUCCESS: Ada booked ${adaBooking.quantity} ticket(s). Reference: ${adaBooking.reference}`,
);

// 5. Bayo tries to book 2 tickets, but only 1 seat is left! This will throw SOLD_OUT.
try {
  console.log("Bayo trying to book 2 tickets...");
  bookTickets(store, vipTier.id, "user-bayo", 2);
} catch (error) {
  console.log(`REFUSED AS EXPECTED: [${error.code}] ${error.message}`);
}

// 6. Bayo successfully books the last remaining 1 ticket
const bayoBooking = bookTickets(store, vipTier.id, "user-bayo", 1);
console.log(
  `SUCCESS: Bayo booked the last ${bayoBooking.quantity} ticket. Reference: ${bayoBooking.reference}`,
);

// 7. Chioma and David join the waitlist since the tier is now fully sold out
joinWaitlist(store, vipTier.id, "user-chioma", 1);
console.log("Chioma joined the waitlist.");
joinWaitlist(store, vipTier.id, "user-david", 2);
console.log("David joined the waitlist.");

// 8. Find Ada's booking instantly using our fast O(1) reference map lookup
const found = findBookingByReference(store, adaBooking.reference);
console.log(
  `Lookup Verified: Found booking reference ${found.reference} for user ${found.userId}`,
);

// 9. Ada cancels her booking, releasing 2 seats back to the tier
console.log("Ada cancels her booking to free up seats...");
cancelBooking(store, adaBooking.reference);
console.log(
  `Seats are now freed! Tier sold count dropped back down to: ${vipTier.sold}`,
);

console.log("--- EVENT TICKETING DEMO END ---");
