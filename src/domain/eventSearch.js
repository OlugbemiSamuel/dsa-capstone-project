import { mergeSort } from "./sorting.js";
import { DomainError } from "./error.js";

// A date-only 'to' filter must include the whole day, up to 23:59:59.999.
const isDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

// Parses a date string into a Date, throwing VALIDATION when it is bad.
const parseDate = (value, field) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new DomainError("VALIDATION", `Invalid ${field} date: ${value}`);
  }
  return date;
};

// Compare two summaries by date, earliest first. Ties broken by title then id.
const compareByDate = (a, b) => {
  if (a.startsAt < b.startsAt) return -1;
  if (a.startsAt > b.startsAt) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

// Compare two summaries by price, cheapest first.
// Events with no price (cheapestPriceCents === null) always go last.
// Ties broken by title then id.
const compareByPrice = (a, b) => {
  const aPrice = a.cheapestPriceCents;
  const bPrice = b.cheapestPriceCents;

  if (aPrice !== null && bPrice !== null) {
    if (aPrice < bPrice) return -1;
    if (aPrice > bPrice) return 1;
  } else if (aPrice === null && bPrice !== null) {
    return 1;
  } else if (aPrice !== null && bPrice === null) {
    return -1;
  }

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

// Compare two summaries by availability, most seats left first.
// Ties broken by title then id.
const compareByAvailability = (a, b) => {
  if (a.seatsLeft > b.seatsLeft) return -1;
  if (a.seatsLeft < b.seatsLeft) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

// ----- filter -----

export const filterEvents = (summaries, criteria = {}) => {
  const { q, city, from, to, maxPriceCents, onlyAvailable } = criteria;

  // Validate the 'from' date when it is provided.
  let fromDate;
  if (from !== undefined && from !== "") {
    fromDate = parseDate(from, "from");
  }

  // Validate the 'to' date when it is provided.
  // A date-only 'to' (YYYY-MM-DD) is expanded to the end of that day
  // so the whole day is included in an inclusive filter.
  let toDate;
  if (to !== undefined && to !== "") {
    if (isDateOnly(to)) {
      toDate = new Date(`${to}T23:59:59.999`);
      if (Number.isNaN(toDate.getTime())) {
        throw new DomainError("VALIDATION", `Invalid to date: ${to}`);
      }
    } else {
      toDate = parseDate(to, "to");
    }
  }

  // Validate maxPriceCents: it must be a whole number.
  if (maxPriceCents !== undefined && !Number.isInteger(maxPriceCents)) {
    throw new DomainError("VALIDATION", "maxPriceCents must be a whole number");
  }

  let result = [...summaries];

  // q matches title or venue, ignoring case.
  if (q !== undefined && q !== "") {
    const qLower = q.toLowerCase();
    result = result.filter(
      (event) =>
        event.title.toLowerCase().includes(qLower) ||
        event.venue.toLowerCase().includes(qLower),
    );
  }

  // city matches exactly, ignoring case.
  if (city !== undefined && city !== "") {
    const cityLower = city.toLowerCase();
    result = result.filter((event) => event.city.toLowerCase() === cityLower);
  }

  // from and to are inclusive. A date-only 'to' already covers the whole day.
  if (fromDate !== undefined || toDate !== undefined) {
    result = result.filter((event) => {
      const eventDate = new Date(event.startsAt);
      if (fromDate !== undefined && eventDate < fromDate) return false;
      if (toDate !== undefined && eventDate > toDate) return false;
      return true;
    });
  }

  // maxPriceCents compares with the cheapest tier.
  // Events with no tiers (cheapestPriceCents === null) are left out.
  if (maxPriceCents !== undefined) {
    result = result.filter((event) => {
      if (event.cheapestPriceCents === null) return false;
      return event.cheapestPriceCents <= maxPriceCents;
    });
  }

  // onlyAvailable keeps only events that still have seats left.
  if (onlyAvailable === true) {
    result = result.filter((event) => event.seatsLeft > 0);
  }

  return result;
};

// ----- sort -----

export const sortEvents = (summaries, sortBy) => {
  const validSortBy = ["date", "price", "availability"];
  if (!validSortBy.includes(sortBy)) {
    throw new DomainError("VALIDATION", `Unknown sort option: ${sortBy}`);
  }

  // Pick the compare function for this sort option.
  let compare;
  if (sortBy === "date") {
    compare = compareByDate;
  } else if (sortBy === "price") {
    compare = compareByPrice;
  } else {
    compare = compareByAvailability;
  }

  // mergeSort returns a new array and never mutates its input, so the
  // original summaries array is left untouched.
  return mergeSort([...summaries], compare);
};

// ----- search = filter then sort -----

export const searchEvents = (summaries, criteria, sortBy) => {
  const filtered = filterEvents(summaries, criteria);
  return sortEvents(filtered, sortBy);
};
