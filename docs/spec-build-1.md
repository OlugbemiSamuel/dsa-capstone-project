# Spec: Build 1 — Domain core

_Written by me before reading the tutor's AI prompt in `docs/build-1.md`._
_If it is vague, the code will be vague. Make every rule something a test could check._

## 1. One sentence

What can a user do when this build is finished?
A user cna run npm run demo and it shws them thefull story fo what this build/project is all about, from events details to tuckets buying, to canecelling and waitlist update using fifo principles, and seeing the atomicity principle denying buying of more tickets than avaiavlabe leading to rejection instead of partial success, and npm run benchmark to see how fast the map lookup is compared to array.find when chceking for bookings with refrence code.

>

## 2. Nouns (the things that exist) and their fields

For each: name, the fields it needs, and the one field you are unsure about.

> **Event** — date, time, location, id, title
> **Ticket tier** — multiple tiers like General, VIP, capacity for each tier, priceCents, sold
> **Booking** — a booking neeeds a booking id, booking refrence, quantity, amountCents, status, tierId
> **Waitlist entry** — users who wants,

## 3. Rules

Number them. Each should read: _given ***, when ***, then \_\_\_._
Cover the happy path, the refusals, and the "nothing changed" cases.

> 1.given a tier priced 500000 kobo, when 2 tickets are booked, then the amount is 1000000 and an integer; given a fractional price or quantity, then VALIDATION

> 2. given a tier where sold equals capacity, when someone books 1, then SOLD_OUT and nothing changes
> 3. Given a situation where by an attendee tries to buy two tickets when only one is left/available then it should be rejected with the errorcode SOLD_OUT and the one ticket should still be available with no bookings recorded, using the stomicity of all in or all fail , theres no partial state.
> 4. The seatLefts should a derived data from the actual capacity assold tickets never goes below 0 and higher than capacity count that way we are not storing two datas, our source of truth remsins one nd we can always bench against it.
> 5. A booking is for a number of ticket/s, and capacity rules apllies to that number.
> 6. Canceling a booking releases it seats.
> 7. The waitlist is served in strictly first in first out order and the demo mst name the person.
> 8. A booking is found in constant time by its booking refrence.
>    .

## 4. Errors

Every expected failure needs a stable code. List: code -> when it is thrown -> what must be unchanged afterwards.

| Code          | When | What must not change                                                                                                                       |
| ------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| NOT_FOUND     |      | looking for a booking refrence code or details thats not available                                                                         | the avaiavble refrence nd availabel seats and sold tickets                                                  |
| VALIDATION    |      | an input from the eattendee is wrong, not allowed or blocked s                                                                             | the avaiable seats must not chnage, the booking must not be generated                                       |
| SOLD_OUT      |      | an atendee is trying to buy A TicKET WHE EVENT IS SOLDOUT meaning THERE NO TICKTES LEFT or trying to n=buy more tickts than avaibale seats | the avaiable seats must not chnage, the booking must nOT be generated, and the eventnstate must not change. |
| INVALID_STATE |      | an atendee is trying to cancel an already cancellled ticket                                                                                | thesystem must not chnage.                                                                                  |

## 5. Files and responsibilities

What files does this need, what is each one responsible for, and which ones must contain **no** input/output?

> | File | Responsible for | Must NOT do |
> | waitlist.js | keeking attendees in the waitlist so they can be called when there is an availabe seat | it must not store bookings, events, tickets |
> | inventory.js | keeps the list/track of everything about the event, the ticket tiers, the capacity, sold tickets, | it must not store waitlist names |
> | money.js | declares and enforces the money in cents rule | it must not store waitlist names, keep track of event details |
> | error.js | a central error page for validation, soldout, notofund and errorstate| it must not not do any pther perotions other than throw/catch errors |
> | booking.js | a central bookingr page for bookings function and refrences generation| it must not not do any other operations other than validate bookinsg, generate bookings refrences |
> | demo.js | demo page for running the demo in the terminal | it must not not do any other operations other than run the demo page in the terminal |
> | benchmark.js | benchmark page for running the benchmark of MAP data stricture and algorithms over array.find and compare which is faster for looking for bookings in a large number of bookings using booking refrences, running in the terminal | it must not not do any other operations other than run the benchmark page in the terminal |
> | moneytest.js | runs the test to check if the money stucture declared is functioning as expected| it must not not do any other operations other than run a test for the money.js file |

## 6. Done when (in my own words)

1.given that this buld is successufl I'm done when npm run demo prints the whole event stpry in the terminal given an actual demo event with all the nounds and details, selling out, booking is refused, peole or attendee join the waitlist, a booking is cancelled andthe oldest person in the waitlost is naed and give the now avable ticket,

> 2.when fully done is when run npm benchmark shows a map lookup of bookings is fastern than array.find in a large list of bookings and i can explain why in Big O terms and then merge my first pr

> - [ ]

## 7. Deliberately NOT building

1.  given that thid build only runs in the terminal, no db, no server.
    > 2. payment, auth, ui, waitlist

> -

## 8. Open questions

What is the maximum number of tickets in one booking?
Must price be ≥ 0 and capacity ≥ 1?
How long is a reference, and from which characters?
If the person at the head of the waitlist wants 4 seats and 1 is free — partial offer, or wait?
Does cancelling automatically offer the freed seat, or is "offer the next person" a separate step?
Does a booking record who made it, given there are no users yet?

> 1.
> 2.
> 3.

## 9. My acceptance criteria

Write 5-8 `Given / When / Then` lines I will turn into tests in Build 2.

> **Given** a situation where a user wants 2 number if tickets
> **When** ... there are >= 2 seatlefts
> **Then** ... it should process successfully generate boking n=refrence, seats let should be -2,
> **Given** a situation where a user wants 2 number if tickets
> **When** ... there are >= 2 seatlefts
> **Then** ... it should process successfully generate boking n=refrence, seats let should be -2,
> **Given** a situation where a user wants 2 number if tickets
> **When** ... there are >= 2 seatlefts
> **Then** ... it should process successfully generate boking n=refrence, seats let should be -2,
