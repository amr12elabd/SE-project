# PopEyez — Assumptions & Design Decisions

This document records all assumptions, simplifications, and scope decisions made during development of the PopEyez platform.

## Authentication & Authorization

**A1. Staff accounts are created by organizers, not self-registered.**
Staff cannot register through the public registration page. The Register page offers roles: organizer, vendor, venue owner, and guest only. Staff accounts are created via the Staff Management page (organizer creates them with a generated password).

**A2. JWT tokens are stored in localStorage.**
For simplicity in a local development context, JWT tokens are stored in `localStorage`. In production, `httpOnly` cookies would be more secure.

**A3. Session expiry is 7 days.**
JWT tokens expire in 7 days. No refresh token mechanism is implemented.

**A4. Single active session per user.**
No multi-device session management. Logging in on a new device invalidates the old session by replacing the token in localStorage.

## Role & Access Control

**A5. A user has exactly one role.**
A user cannot be both an organizer and a vendor. Each account has a single, permanent role assigned at registration.

**A6. Organizers can only see their own events.**
Event filtering by role is enforced: organizers see only events they created, staff see only events they are assigned to.

**A7. Staff accounts cannot change their own password via the standard flow.**
Staff passwords are managed by the organizer. Staff can update their own password on the Profile page.

## Venue & Bookings

**A8. Venue availability calendar is simplified.**
The Venue model has `availabilityDates` and `unavailableDates` arrays but the UI does not implement a full calendar picker — date availability is not enforced at the API level when creating a booking. This is a known simplification.

**A9. Only one booking request per venue+date is allowed implicitly.**
No uniqueness constraint prevents multiple organizers from requesting the same venue on the same date simultaneously. In a real system, a locking mechanism would be needed.

**A10. Counter-proposals do not auto-expire.**
If a venue owner sends a counter-proposal, it remains open indefinitely. In production, a time-bound acceptance mechanism would be needed.

## Budget & Finance

**A11. Currency is EGP only.**
All monetary values are in Egyptian Pounds (EGP). No currency conversion is implemented.

**A12. Budget alerts use a 90% threshold.**
The budget management page shows a warning alert when actual spending exceeds 90% of the total budget. This threshold is hardcoded in the frontend.

**A13. Invoices are submitted by vendors and cannot be edited after submission.**
Once submitted, a vendor cannot edit an invoice. They would need to contact the organizer to reject it and resubmit.

## Guest Management

**A14. Guest QR codes are auto-generated using UUID.**
Each guest record gets a UUID as the `qrCodeValue` on creation. QR codes are displayed using the `qrcode.react` library.

**A15. Check-in by QR requires the guest QR value to match exactly.**
The check-in endpoint accepts either a guest ID or the exact QR code value. No fuzzy matching is implemented.

**A16. Dietary preferences and allergies are from a predefined list.**
The guest form offers checkboxes for common dietary preferences (Vegetarian, Vegan, Halal, etc.) and allergies (Nuts, Dairy, Gluten, etc.). Free-text entry is not supported.

## Communications & Messaging

**A17. Communications are one-directional (organizer → guests).**
Guests can see messages from the organizer but cannot reply. Two-way messaging is out of scope.

**A18. Message "seen" tracking is per-recipient, not per-guest-user.**
The Communication model tracks `seenBy` as an array of guest IDs. Guest users cannot individually mark messages; the organizer sees an aggregate "X of Y guests have seen this" count.

**A19. Day-of messages auto-refresh every 30 seconds.**
The Guest Dashboard's DayOfMessages page polls the API every 30 seconds. WebSocket/real-time communication is not implemented.

## Reports & Analytics

**A20. Reports are generated on-demand, not pre-computed.**
All report endpoints query the database in real time. No caching or pre-aggregation is used.

**A21. CSV export contains basic tabular data.**
The CSV export includes attendance and financial data. It is generated server-side and downloaded as a blob. Advanced formatting (Excel, charts) is not included.

**A22. Feedback sentiment is auto-classified by rating.**
Sentiment is calculated in the Feedback model's pre-save hook:
- overallRating ≥ 4 → Positive
- overallRating ≤ 2 → Negative
- overallRating = 3 → Neutral

No NLP is used.

## Vendor & Sourcing

**A23. Vendor profiles are one-per-user.**
Each vendor user can have exactly one VendorProfile (enforced by unique index on `user` field).

**A24. Sourcing request "messages" are stored as clarification notes, not a chat thread.**
The SourcingRequest model stores a single `clarificationNote` string. A proper message thread would require a sub-documents array.

**A25. Vendor invoices can only be submitted for orders in "Preparing" or later status.**
The SubmitInvoice page filters sourcing requests to show only eligible statuses (Preparing, Out for Delivery, Delivered) as invoice sources.

## Layout Designer

**A26. The venue layout designer is canvas-based using plain React state.**
Drag-and-drop is implemented via mousedown/mousemove/mouseup events on a positioned div container. No external drag-and-drop library is used. This works for desktop but is not touch-friendly.

**A27. Layout elements cannot overlap detection.**
No collision detection is implemented. Elements can be dragged on top of each other.

**A28. The canvas size is fixed at 800×600 pixels.**
The layout canvas dimensions are hardcoded. Responsive resizing is not implemented.

## Notifications

**A29. Notifications are created for key events only.**
Notifications are generated for: new booking requests (to venue owner), booking status changes (to organizer), task assignments (to staff), and new invoices (to organizer). Not all system events generate notifications.

**A30. Notification bell polls every 60 seconds.**
The notification count in the navbar is refreshed every 60 seconds. Real-time push notifications are not implemented.

## Seed Data

**A31. Seed data is Cairo-specific.**
All seed data uses Egyptian names, Cairo neighborhoods (Maadi, Zamalek, Heliopolis, New Cairo), and EGP pricing to simulate a realistic local context.

**A32. Running the seed script clears all data.**
`npm run seed` drops all 15 collections before reseeding. It is not additive — it replaces all existing data.

## Testing

**A33. No automated tests are included.**
No unit tests, integration tests, or E2E tests are included in this submission. Manual testing against the demo credentials and user journeys is the intended test method.

## Security (Out of Scope for Academic Project)

The following production security measures are intentionally omitted:
- Rate limiting / brute-force protection
- Input sanitization against XSS (beyond React's default)
- HTTPS / TLS configuration
- Environment secret rotation
- CSRF protection
- File upload validation (no image uploads are implemented)

## Browser Support

The application is designed and tested in Google Chrome (latest). IE11 and older browsers are not supported.
