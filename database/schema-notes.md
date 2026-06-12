# PopEyez — Database Schema Notes

All models use Mongoose with MongoDB. All ObjectId references use Mongoose's `ref` for `.populate()` support.

---

## 1. User

**Collection:** `users`

| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | required, unique, lowercase |
| passwordHash | String | bcrypt hash, stored by pre-save hook |
| role | Enum | organizer / staff / vendor / guest / venueOwner |
| phone | String | optional |
| bio | String | optional |
| avatarUrl | String | optional |
| isActive | Boolean | default true |
| notificationPreferences | Object | { email: Boolean, push: Boolean, inApp: Boolean } |
| createdBy | ObjectId → User | for staff created by organizer |

**Hooks:**
- Pre-save: bcrypt hash password if modified
- Instance method: `matchPassword(candidatePassword)` for login verification

---

## 2. Event

**Collection:** `events`

| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| description | String | |
| organizer | ObjectId → User | required |
| date | Date | required |
| startTime | String | e.g. "18:00" |
| endTime | String | |
| venue | ObjectId → Venue | optional (set after booking approval) |
| status | Enum | Planning / Confirmed / In Progress / Completed / Cancelled |
| eventType | String | e.g. "Birthday Pop-Up", "Corporate" |
| expectedGuests | Number | |
| dressCode | String | |
| agenda | String | multi-line |
| totalBudget | Number | overall planned budget |
| staffMembers | [ObjectId → User] | assigned staff |
| coverImageUrl | String | |

---

## 3. Venue

**Collection:** `venues`

| Field | Type | Notes |
|-------|------|-------|
| owner | ObjectId → User | required, venueOwner role |
| name | String | required |
| description | String | |
| location | Object | { address, city, area } |
| capacity | Number | required |
| dimensions | String | e.g. "500 sqm" |
| amenities | [String] | e.g. WiFi, Parking, Stage |
| pricing | Object | { perDay, perHour, currency: "EGP" } |
| photos | [String] | URLs |
| floorPlanUrl | String | |
| availabilityDates | [Date] | |
| unavailableDates | [Date] | |
| isActive | Boolean | default true |
| rating | Number | average from feedback |
| reviewCount | Number | |

---

## 4. BookingRequest

**Collection:** `bookingrequests`

| Field | Type | Notes |
|-------|------|-------|
| organizer | ObjectId → User | required |
| venue | ObjectId → Venue | required |
| event | ObjectId → Event | optional |
| date | Date | requested date |
| expectedAttendees | Number | |
| specialRequirements | String | |
| status | Enum | Pending / Approved / Declined / Counter-Proposed |
| ownerMessage | String | venue owner's response message |
| counterProposal | Object | { date, price, notes } |

---

## 5. Task

**Collection:** `tasks`

| Field | Type | Notes |
|-------|------|-------|
| event | ObjectId → Event | required |
| title | String | required |
| description | String | |
| assignedTo | ObjectId → User | optional (staff) |
| speciality | String | e.g. "Photography", "Catering" |
| status | Enum | Not Assigned / Pending / In Progress / Done |
| dueDate | Date | |
| priority | Enum | Low / Medium / High |

---

## 6. BudgetItem

**Collection:** `budgetitems`

| Field | Type | Notes |
|-------|------|-------|
| event | ObjectId → Event | required |
| category | String | e.g. Venue, Catering, Décor |
| description | String | |
| plannedAmount | Number | |
| actualAmount | Number | |
| notes | String | |

---

## 7. VendorProfile

**Collection:** `vendorprofiles`

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | required, unique |
| companyName | String | required |
| suppliesOffered | [String] | categories |
| mainLocation | String | Cairo area |
| pricingList | [Object] | [{ item, price, unit }] |
| contactInfo | Object | { phone, email, website } |
| deliveryRegions | [String] | Cairo areas |
| minimumOrder | Number | EGP |
| leadTime | Number | days |
| rating | Number | |
| reviewCount | Number | |
| logoUrl | String | |
| isActive | Boolean | |

---

## 8. SourcingRequest

**Collection:** `sourcingrequests`

| Field | Type | Notes |
|-------|------|-------|
| organizer | ObjectId → User | required |
| vendor | ObjectId → User | required |
| event | ObjectId → Event | |
| requestedItems | [Object] | [{ item, quantity, unit, notes }] |
| deliveryDate | Date | |
| eventLocation | String | |
| status | Enum | Pending / Accepted / Declined / Preparing / Out for Delivery / Delivered |
| clarificationNote | String | vendor's clarification |
| delayNote | String | vendor's delay reason |
| totalEstimatedCost | Number | EGP |

---

## 9. Invoice

**Collection:** `invoices`

| Field | Type | Notes |
|-------|------|-------|
| vendor | ObjectId → User | required |
| organizer | ObjectId → User | |
| event | ObjectId → Event | |
| sourcingRequest | ObjectId → SourcingRequest | |
| invoiceNumber | String | auto-generated: INV-{timestamp} |
| items | [Object] | [{ description, quantity, unitPrice, total }] |
| totalAmount | Number | |
| status | Enum | Pending Review / Approved / Rejected / Paid |
| notes | String | |
| dueDate | Date | |

**Hooks:**
- Pre-save: generate `invoiceNumber` if not set

---

## 10. Guest

**Collection:** `guests`

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | optional (if guest has an account) |
| guestName | String | required |
| email | String | required |
| phone | String | |
| event | ObjectId → Event | required |
| group | String | e.g. "Family", "VIP", "Team" |
| rsvpStatus | Enum | Pending / Attending / Not Attending / Maybe |
| dietaryPreferences | [String] | Vegetarian, Vegan, Halal, etc. |
| allergies | [String] | Nuts, Dairy, Gluten, etc. |
| specialRequirements | String | |
| qrCodeValue | String | UUID, auto-generated on creation |
| checkInStatus | Boolean | default false |
| checkedInAt | Date | |
| checkedInBy | ObjectId → User | staff who checked in |

---

## 11. Invitation

**Collection:** `invitations`

Unique compound index: `{ event, guest }`

| Field | Type | Notes |
|-------|------|-------|
| event | ObjectId → Event | required |
| guest | ObjectId → Guest | required |
| status | Enum | Sent / Viewed / Responded |
| message | String | custom invitation message |
| sentAt | Date | |

---

## 12. Communication

**Collection:** `communications`

| Field | Type | Notes |
|-------|------|-------|
| event | ObjectId → Event | required |
| sentBy | ObjectId → User | required |
| message | String | required |
| recipients | [ObjectId → Guest] | all or specific guests |
| receivedBy | [ObjectId → Guest] | who should receive |
| seenBy | [ObjectId → Guest] | who has seen it |
| isFollowUp | Boolean | |
| followUpTo | ObjectId → Communication | parent message |

---

## 13. Feedback

**Collection:** `feedbacks`

| Field | Type | Notes |
|-------|------|-------|
| event | ObjectId → Event | required |
| guest | ObjectId → Guest | optional (anonymous allowed) |
| overallRating | Number | 1–5, required |
| foodRating | Number | 1–5 |
| venueRating | Number | 1–5 |
| organizationRating | Number | 1–5 |
| comments | String | |
| sentiment | Enum | Positive / Neutral / Negative |

**Hooks:**
- Pre-save: auto-calculate sentiment from overallRating

---

## 14. Layout

**Collection:** `layouts`

Unique index on `event`

| Field | Type | Notes |
|-------|------|-------|
| event | ObjectId → Event | required, unique |
| elements | [Object] | [{ id, type, label, x, y, width, height, rotation, color, seats }] |
| setupInstructions | String | |
| canvasWidth | Number | default 800 |
| canvasHeight | Number | default 600 |
| sharedWithStaff | Boolean | controls staff visibility |

**Element types:** table, booth, bar, stage, entrance, exit, equipment, decoration

---

## 15. Notification

**Collection:** `notifications`

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | required |
| title | String | required |
| message | String | required |
| type | Enum | task / booking / invoice / rsvp / communication / event / general |
| isRead | Boolean | default false |
| link | String | frontend route for navigation |

---

## Relationships Summary

```
User (organizer) ──creates──► Event ──has──► Task (many)
                                         ──has──► BudgetItem (many)
                                         ──has──► Guest (many)
                                         ──has──► Layout (one)
                                         ──has──► Communication (many)
                                         ──has──► Feedback (many)
                                         ──has──► Invitation (many)

User (organizer) ──creates──► BookingRequest ──for──► Venue
                                              ──for──► Event

User (organizer) ──creates──► SourcingRequest ──to──► User (vendor)
User (vendor) ──has──► VendorProfile (one-to-one)
User (vendor) ──creates──► Invoice ──from──► SourcingRequest

User (venueOwner) ──owns──► Venue (many)

Guest ──receives──► Invitation
Guest ──receives──► Communication
Guest ──has──► Feedback
```

---

## Indexes

| Collection | Index |
|------------|-------|
| users | email (unique) |
| vendorprofiles | user (unique) |
| invitations | { event, guest } (unique compound) |
| layouts | event (unique) |
| notifications | { user, isRead } (for unread count) |
