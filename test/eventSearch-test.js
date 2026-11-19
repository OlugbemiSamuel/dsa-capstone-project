import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterEvents,
  sortEvents,
  searchEvents,
} from "../src/domain/eventSearch.js";

const summaries = [
  {
    id: "e1",
    title: "Lagos Tech Meetup",
    city: "Lagos",
    venue: "Hub One",
    startsAt: "2026-12-05T17:00:00",
    status: "published",
    cheapestPriceCents: 5000,
    seatsLeft: 10,
  },
  {
    id: "e2",
    title: "Abuja Jazz Night",
    city: "Abuja",
    venue: "Jazz Hall",
    startsAt: "2026-12-05T19:00:00",
    status: "published",
    cheapestPriceCents: 8000,
    seatsLeft: 2,
  },
  {
    id: "e3",
    title: "Port Harcourt Free Day",
    city: "Port Harcourt",
    venue: "Open Air",
    startsAt: "2026-12-03T10:00:00",
    status: "published",
    cheapestPriceCents: null,
    seatsLeft: 0,
  },
  {
    id: "e4",
    title: "Lagos Music Fest",
    city: "Lagos",
    venue: "Beach",
    startsAt: "2026-12-10T12:00:00",
    status: "draft",
    cheapestPriceCents: 3000,
    seatsLeft: 5,
  },
  {
    id: "e5",
    title: "Abuja Tech Talk",
    city: "Abuja",
    venue: "Hub One",
    startsAt: "2026-12-05T09:00:00",
    status: "published",
    cheapestPriceCents: 5000,
    seatsLeft: 100,
  },
];

const published = summaries.filter((e) => e.status === "published");

describe("filterEvents", () => {
  it("matches q against title or venue, ignoring case (S05)", () => {
    const result = filterEvents(summaries, { q: "jazz" });
    assert.deepStrictEqual(
      result.map((e) => e.id),
      ["e2"],
    );
  });

  it("matches q against venue as well as title", () => {
    const result = filterEvents(summaries, { q: "HUB ONE" });
    assert.deepStrictEqual(result.map((e) => e.id).sort(), ["e1", "e5"]);
  });

  it("filters by city exactly, ignoring case (S05)", () => {
    const result = filterEvents(summaries, { city: "lagos" });
    assert.deepStrictEqual(result.map((e) => e.title).sort(), [
      "Lagos Music Fest",
      "Lagos Tech Meetup",
    ]);
  });

  it("filters by inclusive date range (S05)", () => {
    const result = filterEvents(summaries, {
      from: "2026-12-05",
      to: "2026-12-05",
    });
    assert.deepStrictEqual(result.map((e) => e.title).sort(), [
      "Abuja Jazz Night",
      "Abuja Tech Talk",
      "Lagos Tech Meetup",
    ]);
  });

  it("a date-only 'to' includes the whole day (S05)", () => {
    const result = filterEvents(summaries, { to: "2026-12-05" });
    const titles = result.map((e) => e.title);
    assert.ok(
      titles.includes("Lagos Tech Meetup"),
      "5 PM event on the day is included",
    );
    assert.ok(
      titles.includes("Abuja Jazz Night"),
      "7 PM event on the day is included",
    );
    assert.ok(
      titles.includes("Abuja Tech Talk"),
      "9 AM event on the day is included",
    );
  });

  it("maxPriceCents compares with cheapest tier and leaves out events with no tiers (S05)", () => {
    const result = filterEvents(summaries, { maxPriceCents: 6000 });
    assert.deepStrictEqual(result.map((e) => e.title).sort(), [
      "Abuja Tech Talk",
      "Lagos Music Fest",
      "Lagos Tech Meetup",
    ]);
    assert.ok(
      !result.some((e) => e.id === "e3"),
      "event with no tiers is left out of price filters",
    );
  });

  it("onlyAvailable keeps events with seats left", () => {
    const result = filterEvents(summaries, { onlyAvailable: true });
    const ids = result.map((e) => e.id);
    assert.ok(ids.includes("e1"));
    assert.ok(ids.includes("e5"));
    assert.ok(!ids.includes("e3"), "event with 0 seats is excluded");
  });

  it("rejects a bad date with VALIDATION (S05)", () => {
    assert.throws(() => filterEvents(summaries, { from: "not-a-date" }), {
      code: "VALIDATION",
    });
  });

  it("rejects a non-whole-number price with VALIDATION (S05)", () => {
    assert.throws(() => filterEvents(summaries, { maxPriceCents: 5000.5 }), {
      code: "VALIDATION",
    });
  });

  it("handles an empty list", () => {
    assert.deepStrictEqual(filterEvents([], { q: "x" }), []);
    assert.deepStrictEqual(filterEvents([], { city: "Lagos" }), []);
  });
});

describe("sortEvents", () => {
  it("sorts by date, earliest first (S05)", () => {
    const result = sortEvents(published, "date");
    assert.deepStrictEqual(
      result.map((e) => e.id),
      ["e3", "e5", "e1", "e2"],
    );
  });

  it("breaks date ties by title, then id (S05)", () => {
    const sameDay = [
      {
        id: "b",
        title: "B Event",
        startsAt: "2026-12-05T10:00:00",
        status: "published",
        cheapestPriceCents: 100,
        seatsLeft: 5,
      },
      {
        id: "a",
        title: "A Event",
        startsAt: "2026-12-05T10:00:00",
        status: "published",
        cheapestPriceCents: 100,
        seatsLeft: 5,
      },
    ];
    const result = sortEvents(sameDay, "date");
    assert.deepStrictEqual(
      result.map((e) => e.id),
      ["a", "b"],
    );
  });

  it("sorts by price, cheapest first, no price last (S05)", () => {
    const result = sortEvents(published, "price");
    const ids = result.map((e) => e.id);
    assert.strictEqual(
      ids[ids.length - 1],
      "e3",
      "event with no price goes last",
    );
    assert.ok(
      ids.indexOf("e5") < ids.indexOf("e2"),
      "cheapest (5000) comes before 8000",
    );
  });

  it("sorts by availability, most seats left first (S05)", () => {
    const result = sortEvents(published, "availability");
    assert.deepStrictEqual(
      result.map((e) => e.id),
      ["e5", "e1", "e2", "e3"],
    );
  });

  it("rejects an unknown sortBy with VALIDATION (S05)", () => {
    assert.throws(() => sortEvents(published, "badoption"), {
      code: "VALIDATION",
    });
  });

  it("handles an empty list", () => {
    assert.deepStrictEqual(sortEvents([], "date"), []);
  });
});

describe("searchEvents", () => {
  it("filters then sorts (S05)", () => {
    const result = searchEvents(
      summaries,
      { city: "Lagos", q: "Tech" },
      "date",
    );
    assert.deepStrictEqual(
      result.map((e) => e.id),
      ["e1"],
    );
  });

  it("leaves the original summaries array unchanged after filter, sort and search", () => {
    const before = JSON.stringify(summaries);
    filterEvents(summaries, { city: "Lagos" });
    sortEvents(summaries, "date");
    searchEvents(summaries, { q: "x" }, "price");
    assert.strictEqual(JSON.stringify(summaries), before);
  });

  it("handles an empty list", () => {
    assert.deepStrictEqual(searchEvents([], {}, "date"), []);
  });
});
