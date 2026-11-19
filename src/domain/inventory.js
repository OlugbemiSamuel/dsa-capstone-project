import { newId, referenceCode } from "./ids.js";
import { DomainError } from "./error.js";
import { Queue } from "./waitlist.js";

// Creates the central store holding all Maps for our domain
export const createStore = () => {
  return {
    events: new Map(), // eventId -> event object
    tiers: new Map(), // tierId -> tier object
    bookings: new Map(), // bookingId -> booking object
    bookingsByReference: new Map(), // reference -> booking object (O(1) fast lookup)
    waitlists: new Map(), // tierId -> Queue instance
  };
};

// Creates a new event (Starts as a draft per tutor spec)
export const createEvent = (
  store,
  { title, city, venue = "", startsAt, organizerId },
) => {
  if (!title || !city || !startsAt || !organizerId) {
    throw new DomainError(
      "VALIDATION",
      "Event requires title, city, startsAt, and organizerId",
    );
  }

  // startsAt must be a real date, not just a non-empty string.
  const startsAtDate = new Date(startsAt);
  if (Number.isNaN(startsAtDate.getTime())) {
    throw new DomainError(
      "VALIDATION",
      "startsAt must be a valid date",
    );
  }

  const eventId = newId();
  const event = {
    id: eventId,
    title,
    city,
    venue,
    startsAt,
    organizerId,
    status: "draft",
  };

  store.events.set(eventId, event);
  return event;
};

// Adds a ticket tier to an event
export const addTier = (store, eventId, { name, priceCents, capacity }) => {
  const event = store.events.get(eventId);
  if (!event) {
    throw new DomainError("NOT_FOUND", "Event not found");
  }

  if (
    !Number.isInteger(priceCents) ||
    priceCents < 0 ||
    capacity <= 0
  ) {
    throw new DomainError(
      "VALIDATION",
      "Price must be a whole number and cannot be negative; capacity must be positive",
    );
  }

  const tierId = newId();
  const tier = {
    id: tierId,
    eventId,
    name,
    priceCents,
    capacity,
    sold: 0,
  };

  store.tiers.set(tierId, tier);

  // Initialize an empty waitlist queue for this specific tier
  store.waitlists.set(tierId, new Queue());

  return tier;
};

// Books tickets from a tier (enforcing the capacity/sold-out rule)
export const bookTickets = (store, tierId, userId, quantity) => {
  if (quantity < 1 || quantity > 10) {
    throw new DomainError(
      "VALIDATION",
      "Can only book between 1 and 10 tickets at a time",
    );
  }

  const tier = store.tiers.get(tierId);
  if (!tier) {
    throw new DomainError("NOT_FOUND", "Ticket tier not found");
  }

  // Calculate available seats left
  const seatsLeft = tier.capacity - tier.sold;
  if (quantity > seatsLeft) {
    throw new DomainError("SOLD_OUT", "Not enough seats left in this tier");
  }

  // Update inventory count safely
  tier.sold += quantity;

  const bookingId = newId();
  const reference = referenceCode(8);

  const booking = {
    id: bookingId,
    reference,
    tierId,
    userId,
    quantity,
    status: "CONFIRMED",
  };

  // Store the booking in both Maps (one indexed by ID, one indexed by reference for O(1) lookup)
  store.bookings.set(bookingId, booking);
  store.bookingsByReference.set(reference, booking);

  return booking;
};

// Finds a booking instantly in O(1) time using the reference Map
export const findBookingByReference = (store, reference) => {
  const booking = store.bookingsByReference.get(reference);
  if (!booking) {
    throw new DomainError("NOT_FOUND", "Booking not found");
  }
  return booking;
};

// Cancels a booking and releases the seats back to the tier
export const cancelBooking = (store, reference) => {
  const booking = findBookingByReference(store, reference);

  if (booking.status === "CANCELLED") {
    throw new DomainError(
      "ALREADY_CANCELLED",
      "This booking has already been cancelled",
    );
  }

  // Mark status as cancelled
  booking.status = "CANCELLED";

  // Free up the sold seats in the tier
  const tier = store.tiers.get(booking.tierId);
  if (tier) {
    tier.sold -= booking.quantity;
  }

  return booking;
};

// Allows a user to join the waitlist for a sold-out tier
export const joinWaitlist = (store, tierId, userId, quantity) => {
  const tier = store.tiers.get(tierId);
  if (!tier) {
    throw new DomainError("NOT_FOUND", "Ticket tier not found");
  }

  const queue = store.waitlists.get(tierId);
  if (!queue) {
    throw new DomainError(
      "NOT_FOUND",
      "Waitlist queue not found for this tier",
    );
  }

  const waitlistEntry = { userId, quantity, joinedAt: Date.now() };
  queue.enqueue(waitlistEntry);

  return waitlistEntry;
};

export const publishEvent = (store, eventId) => {
  // Look the event up by id.
  const event = store.events.get(eventId);
  if (!event) {
    throw new DomainError("NOT_FOUND", "Event not found");
  }

  const hasTiers = Array.from(store.tiers.values()).some(
    (tier) => tier.eventId === eventId,
  );
  if (!hasTiers) {
    throw new DomainError(
      "INVALID_STATE",
      "Cannot publish an event with no ticket tiers",
    );
  }

  // Mark the event as published and return it.
  event.status = "published";
  return event;
};

export const listEventSummaries = (store, { publishedOnly = true } = {}) => {
  const events = Array.from(store.events.values());

  const filtered = publishedOnly
    ? events.filter((event) => event.status === "published")
    : events;

  return filtered.map((event) => {
    // Gather all tiers that belong to this event.
    const eventTiers = Array.from(store.tiers.values()).filter(
      (tier) => tier.eventId === event.id,
    );

    // The cheapest tier price (null when there are no tiers).
    const prices = eventTiers.map((tier) => tier.priceCents);
    const cheapestPriceCents = prices.length > 0 ? Math.min(...prices) : null;

    // Total seats left across all tiers of this event.
    const seatsLeft = eventTiers.reduce(
      (total, tier) => total + (tier.capacity - tier.sold),
      0,
    );

    return {
      id: event.id,
      title: event.title,
      city: event.city,
      venue: event.venue,
      startsAt: event.startsAt,
      status: event.status,
      cheapestPriceCents,
      seatsLeft,
    };
  });
};
