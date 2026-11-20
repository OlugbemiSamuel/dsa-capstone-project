// Tests for the domain store in src/domain/inventory.js.
// Covers S02 (create event), S03 (add tiers), S04 (publish) and S06 (book tickets).

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createStore,
  createEvent,
  addTier,
  publishEvent,
  listEventSummaries,
  bookTickets,
} from "../src/domain/inventory.js";

// Helper: creates a published event with one tier, returning the event and tier.
const makeEventWithTier = (store) => {
  const event = createEvent(store, {
    title: "Lagos Tech Meetup",
    city: "Lagos",
    venue: "Hub One",
    startsAt: "2026-12-05T17:00:00",
    organizerId: "org1",
  });
  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 3,
  });
  return { event, tier };
};

describe("S02: create event", () => {
  it("saves a new event as a draft with an id, hidden from the public list", () => {
    const store = createStore();
    const event = createEvent(store, {
      title: "Lagos Tech Meetup",
      city: "Lagos",
      venue: "Hub One",
      startsAt: "2026-12-05T17:00:00",
      organizerId: "org1",
    });

    assert.ok(event.id, "event should have a new id");
    assert.strictEqual(event.status, "draft");
    assert.strictEqual(event.title, "Lagos Tech Meetup");

    // Drafts are hidden from the public list by default.
    const summaries = listEventSummaries(store);
    assert.strictEqual(summaries.length, 0);
  });

  it("rejects a missing title with VALIDATION", () => {
    const store = createStore();
    assert.throws(
      () =>
        createEvent(store, {
          title: "",
          city: "Lagos",
          startsAt: "2026-12-05",
          organizerId: "org1",
        }),
      { code: "VALIDATION" }
    );
  });

  it("rejects a missing city with VALIDATION", () => {
    const store = createStore();
    assert.throws(
      () =>
        createEvent(store, {
          title: "X",
          city: "",
          startsAt: "2026-12-05",
          organizerId: "org1",
        }),
      { code: "VALIDATION" }
    );
  });

  it("rejects a missing startsAt with VALIDATION", () => {
    const store = createStore();
    assert.throws(
      () =>
        createEvent(store, {
          title: "X",
          city: "Lagos",
          startsAt: "",
          organizerId: "org1",
        }),
      { code: "VALIDATION" }
    );
  });
});

describe("S03: add ticket tiers", () => {
  it("saves a tier with 0 sold and full seats left", () => {
    const store = createStore();
    const event = createEvent(store, {
      title: "Event",
      city: "Lagos",
      startsAt: "2026-12-05",
      organizerId: "org1",
    });
    const tier = addTier(store, event.id, {
      name: "General",
      priceCents: 500000,
      capacity: 100,
    });

    assert.strictEqual(tier.name, "General");
    assert.strictEqual(tier.priceCents, 500000);
    assert.strictEqual(tier.capacity, 100);
    assert.strictEqual(tier.sold, 0);
    assert.strictEqual(tier.capacity - tier.sold, 100);
  });

  it("rejects a negative price with VALIDATION", () => {
    const store = createStore();
    const event = createEvent(store, {
      title: "Event",
      city: "Lagos",
      startsAt: "2026-12-05",
      organizerId: "org1",
    });
    assert.throws(
      () =>
        addTier(store, event.id, {
          name: "General",
          priceCents: -1,
          capacity: 10,
        }),
      { code: "VALIDATION" }
    );
  });

  it("rejects capacity less than 1 with VALIDATION", () => {
    const store = createStore();
    const event = createEvent(store, {
      title: "Event",
      city: "Lagos",
      startsAt: "2026-12-05",
      organizerId: "org1",
    });
    assert.throws(
      () =>
        addTier(store, event.id, {
          name: "General",
          priceCents: 100,
          capacity: 0,
        }),
      { code: "VALIDATION" }
    );
  });

  it("rejects a missing event id with NOT_FOUND", () => {
    const store = createStore();
    assert.throws(
      () =>
        addTier(store, "does-not-exist", {
          name: "General",
          priceCents: 100,
          capacity: 10,
        }),
      { code: "NOT_FOUND" }
    );
  });
});

describe("S04: publish event", () => {
  it("publishes a draft event with tiers, setting status to published", () => {
    const store = createStore();
    const { event } = makeEventWithTier(store);
    assert.strictEqual(event.status, "draft");

    const published = publishEvent(store, event.id);
    assert.strictEqual(published.status, "published");
  });

  it("rejects publishing an event with no tiers with INVALID_STATE", () => {
    const store = createStore();
    const event = createEvent(store, {
      title: "Empty Event",
      city: "Lagos",
      startsAt: "2026-12-05",
      organizerId: "org1",
    });
    assert.throws(() => publishEvent(store, event.id), {
      code: "INVALID_STATE",
    });
  });

  it("rejects publishing a missing event with NOT_FOUND", () => {
    const store = createStore();
    assert.throws(() => publishEvent(store, "does-not-exist"), {
      code: "NOT_FOUND",
    });
  });
});

describe("listEventSummaries", () => {
  it("hides drafts by default (publishedOnly = true)", () => {
    const store = createStore();
    const { event } = makeEventWithTier(store);
    createEvent(store, {
      title: "Draft Event",
      city: "Lagos",
      startsAt: "2026-12-10",
      organizerId: "org1",
    });
    publishEvent(store, event.id);

    const summaries = listEventSummaries(store);
    assert.strictEqual(summaries.length, 1);
    assert.strictEqual(summaries[0].status, "published");
  });

  it("includes drafts when publishedOnly is false", () => {
    const store = createStore();
    makeEventWithTier(store);
    createEvent(store, {
      title: "Draft Event",
      city: "Lagos",
      startsAt: "2026-12-10",
      organizerId: "org1",
    });

    const all = listEventSummaries(store, { publishedOnly: false });
    assert.strictEqual(all.length, 2);
  });

  it("returns a new array and does not mutate the store", () => {
    const store = createStore();
    makeEventWithTier(store);
    const before = JSON.stringify(listEventSummaries(store));
    const summaries = listEventSummaries(store);
    assert.notStrictEqual(summaries, store.events);
    assert.strictEqual(JSON.stringify(listEventSummaries(store)), before);
  });
});

describe("S06: book tickets", () => {
  it("creates a booking and reduces seats left", () => {
    const store = createStore();
    const { event, tier } = makeEventWithTier(store);
    publishEvent(store, event.id);

    const booking = bookTickets(store, tier.id, "user1", 2);
    assert.strictEqual(booking.quantity, 2);
    assert.strictEqual(booking.status, "CONFIRMED");
    assert.strictEqual(tier.sold, 2);
    assert.strictEqual(tier.capacity - tier.sold, 1);
  });

  it("rejects booking more seats than left with SOLD_OUT and changes nothing", () => {
    const store = createStore();
    const { event, tier } = makeEventWithTier(store);
    tier.sold = 2; // only 1 seat left out of capacity 3
    publishEvent(store, event.id);

    assert.throws(() => bookTickets(store, tier.id, "user1", 2), {
      code: "SOLD_OUT",
    });
    assert.strictEqual(tier.sold, 2, "tier.sold is unchanged after SOLD_OUT");
  });

  it("rejects quantity 0 with VALIDATION", () => {
    const store = createStore();
    const { tier } = makeEventWithTier(store);
    assert.throws(() => bookTickets(store, tier.id, "user1", 0), {
      code: "VALIDATION",
    });
  });

  it("rejects negative quantity with VALIDATION", () => {
    const store = createStore();
    const { tier } = makeEventWithTier(store);
    assert.throws(() => bookTickets(store, tier.id, "user1", -1), {
      code: "VALIDATION",
    });
  });

  it("rejects quantity more than 10 with VALIDATION", () => {
    const store = createStore();
    const { tier } = makeEventWithTier(store);
    assert.throws(() => bookTickets(store, tier.id, "user1", 11), {
      code: "VALIDATION",
    });
  });
});
