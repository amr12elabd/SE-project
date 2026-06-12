# PopEyez — Seed Data Description

Run `cd backend && npm run seed` to populate the database with all data below.

The seed script clears all 15 collections then reseeds from scratch.

---

## Demo Users (9 accounts)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Nour El-Rashidy | organizer@popeyez.com | password123 | organizer |
| Salma Hassan | staff@popeyez.com | password123 | staff |
| Ahmed Khalil | staff2@popeyez.com | password123 | staff |
| Karim Mostafa | vendor@popeyez.com | password123 | vendor |
| Mariam Tarek | vendor2@popeyez.com | password123 | vendor |
| Omar Farouk | vendor3@popeyez.com | password123 | vendor |
| Layla Abdel-Aziz | guest@popeyez.com | password123 | guest |
| Hassan Mahmoud | venueowner@popeyez.com | password123 | venueOwner |
| Fatma Ibrahim | venueowner2@popeyez.com | password123 | venueOwner |

---

## Venues (4 Cairo venues)

### 1. The Rooftop Garden — Zamalek
- **Owner:** Hassan Mahmoud (venueowner@popeyez.com)
- **Capacity:** 150 persons
- **Location:** 12 Ibrahim Pasha St, Zamalek, Cairo
- **Pricing:** EGP 8,000/day, EGP 1,200/hour
- **Amenities:** WiFi, Air Conditioning, Audio System, Outdoor Space, Parking
- **Description:** A stunning rooftop venue overlooking the Nile

### 2. The Vintage Loft — Maadi
- **Owner:** Hassan Mahmoud
- **Capacity:** 80 persons
- **Location:** 45 Road 9, Maadi, Cairo
- **Pricing:** EGP 5,500/day, EGP 800/hour
- **Amenities:** WiFi, Air Conditioning, Kitchen, Projector, Stage
- **Description:** Cozy industrial loft with exposed brick walls

### 3. Heliopolis Event Hall
- **Owner:** Fatma Ibrahim (venueowner2@popeyez.com)
- **Capacity:** 300 persons
- **Location:** 78 Hegaz St, Heliopolis, Cairo
- **Pricing:** EGP 15,000/day, EGP 2,000/hour
- **Amenities:** WiFi, Parking, Air Conditioning, Audio System, Stage, Projector, Security, Disabled Access
- **Description:** Grand hall with marble floors, ideal for corporate events

### 4. Garden Pavilion — New Cairo
- **Owner:** Fatma Ibrahim
- **Capacity:** 200 persons
- **Location:** 33 Fifth Settlement, New Cairo, Cairo
- **Pricing:** EGP 10,000/day, EGP 1,500/hour
- **Amenities:** WiFi, Outdoor Space, Parking, Air Conditioning, Kitchen
- **Description:** Beautiful garden pavilion with a covered terrace

---

## Events (2 events)

### 1. Cairo Coffee Culture Pop-Up
- **Organizer:** Nour El-Rashidy
- **Date:** (set to ~2 weeks from seed date)
- **Venue:** The Vintage Loft, Maadi
- **Status:** Confirmed
- **Expected Guests:** 60
- **Type:** Pop-Up Café
- **Budget:** EGP 35,000
- **Staff:** Salma Hassan, Ahmed Khalil
- **Dress Code:** Smart Casual

### 2. Sunset Rooftop Brunch
- **Organizer:** Nour El-Rashidy
- **Date:** (set to ~5 weeks from seed date)
- **Venue:** The Rooftop Garden, Zamalek
- **Status:** Planning
- **Expected Guests:** 100
- **Type:** Brunch Event
- **Budget:** EGP 65,000
- **Staff:** Salma Hassan

---

## Booking Requests (3)

1. **Cairo Coffee Culture Pop-Up** → The Vintage Loft — Status: **Approved**
2. **Sunset Rooftop Brunch** → The Rooftop Garden — Status: **Approved**
3. **Test Counter Proposal** → Heliopolis Event Hall — Status: **Counter-Proposed** (demo of counter-proposal flow)

---

## Tasks (9 tasks for Event 1)

| Title | Assigned To | Priority | Status |
|-------|------------|----------|--------|
| Set up coffee bar equipment | Salma Hassan | High | In Progress |
| Arrange seating & décor | Ahmed Khalil | Medium | Pending |
| Coordinate with barista vendor | Salma Hassan | High | Done |
| Set up registration table | Ahmed Khalil | Low | Not Assigned |
| Test audio equipment | Salma Hassan | Medium | Pending |
| Prepare welcome signage | Ahmed Khalil | Low | Pending |
| Brief security staff | (unassigned) | Medium | Not Assigned |
| Confirm catering delivery time | Salma Hassan | High | In Progress |
| Event photography briefing | (unassigned) | Low | Not Assigned |

---

## Budget Items (14 items across both events)

**Event 1 — Cairo Coffee Culture Pop-Up:**
- Venue rental: Planned EGP 5,500 / Actual EGP 5,500
- Coffee equipment hire: Planned EGP 3,000 / Actual EGP 2,800
- Catering (pastries & food): Planned EGP 8,000 / Actual EGP 7,500
- Photography: Planned EGP 2,500 / Actual EGP 2,500
- Décor & flowers: Planned EGP 3,000 / Actual EGP 3,200
- Marketing materials: Planned EGP 1,500 / Actual EGP 900
- Miscellaneous: Planned EGP 2,000 / Actual EGP 1,100

**Event 2 — Sunset Rooftop Brunch:**
- Venue rental: Planned EGP 8,000 / Actual EGP 0 (not yet paid)
- Catering: Planned EGP 25,000 / Actual EGP 0
- Décor & furniture: Planned EGP 12,000 / Actual EGP 0
- Photography & video: Planned EGP 5,000 / Actual EGP 0
- Entertainment: Planned EGP 8,000 / Actual EGP 0
- Invitations & printing: Planned EGP 2,000 / Actual EGP 1,800
- Contingency: Planned EGP 5,000 / Actual EGP 0

---

## Vendor Profiles (3)

| Company | User | Supplies | Location |
|---------|------|----------|----------|
| Cairo Catering Co. | Karim Mostafa | Food & Beverages, Catering Equipment | Maadi |
| Sound & Light Egypt | Mariam Tarek | Audio & Visual | Heliopolis |
| Bloom Décor Studio | Omar Farouk | Décor & Flowers, Furniture & Tents | Zamalek |

Each vendor profile includes a pricing list (3-5 items) and Cairo delivery regions.

---

## Sourcing Requests (3)

1. **Cairo Catering Co. → Event 1** — Pastries, Coffee Beans, Oat Milk — Status: **Delivering** (Out for Delivery)
2. **Sound & Light Egypt → Event 2** — Speaker System, Microphone Set, LED Lighting — Status: **Accepted**
3. **Bloom Décor Studio → Event 2** — Floral Centerpieces, Tablecloths, Fairy Lights — Status: **Pending**

---

## Invoices (2)

1. **Invoice INV-001** — Cairo Catering Co. → Nour (Event 1) — EGP 9,800 — Status: **Approved**
2. **Invoice INV-002** — Sound & Light Egypt → Nour (Event 2) — EGP 15,500 — Status: **Pending Review**

---

## Guests (10 for Event 1)

| Name | Email | RSVP Status | Group | Dietary |
|------|-------|-------------|-------|---------|
| Layla Abdel-Aziz | guest@popeyez.com | Attending | VIP | Vegetarian |
| Youssef Al-Sayed | youssef@example.com | Attending | Friends | — |
| Dina Ramzy | dina@example.com | Attending | Friends | Vegan |
| Mohamed Samir | mohamed@example.com | Maybe | Colleagues | Halal |
| Sara El-Gohary | sara@example.com | Not Attending | Family | — |
| Amira Nasser | amira@example.com | Attending | VIP | Gluten-Free |
| Khaled Hamdy | khaled@example.com | Attending | Colleagues | — |
| Rania Fouad | rania@example.com | Pending | Friends | Vegan, Gluten-Free |
| Tarek Mostafa | tarek@example.com | Attending | Family | — |
| Heba Zaki | heba@example.com | Attending | Colleagues | — |

All guests have auto-generated QR codes. Guests 1, 2, 3, 6, 7, 9, 10 are marked as checked-in.

---

## Invitations (8)

Invitations sent to all 8 attending/maybe guests for Event 1 with a personalized message. Statuses range from Sent to Viewed to Responded.

---

## Communications (3)

1. **Welcome message** — Sent to all guests — "Welcome to Cairo Coffee Culture Pop-Up! We're thrilled to have you join us..."
2. **Parking instructions** — Follow-up to all — "Parking is available on Road 9, just 2 minutes walk from the venue."
3. **Dress code reminder** — Sent to guests who haven't seen message 1 — "Quick reminder: Smart Casual dress code tonight!"

---

## Feedback Records (4)

Four feedback entries for Event 1 from attending guests:
- Rating 5/5 — Positive sentiment — "The coffee selection was exceptional! Very well organized."
- Rating 4/5 — Positive sentiment — "Lovely atmosphere. The music was perfect."
- Rating 3/5 — Neutral sentiment — "Good event overall, parking was a bit tricky."
- Rating 2/5 — Negative sentiment — "The queue at the coffee bar was very long."

---

## Layout (1 — Event 1)

12 canvas elements for the Vintage Loft floor plan:
- 4 round tables (seats 6 each)
- 2 long booths (seats 8 each)
- 1 coffee bar counter
- 1 stage/DJ area
- 1 main entrance
- 1 emergency exit
- 1 equipment storage area
- 1 photo booth decoration

Layout is marked as `sharedWithStaff: true` so staff can view it.

---

## Notifications (10)

A mix of notification types pre-seeded for the organizer:
- Booking approved notifications
- New sourcing request notification
- Invoice submitted notification
- Task completion notification
- Guest check-in notification

5 are unread, 5 are read.

---

## Consistency Notes

- All event dates are dynamically set relative to seed execution time (upcoming events)
- All EGP amounts use realistic Cairo market pricing for 2024
- User passwords are hashed via bcrypt before storage
- All ObjectId references are properly linked (no orphaned refs)
- Guest QR code values are real UUID v4 strings
