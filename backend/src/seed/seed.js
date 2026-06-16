require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const BookingRequest = require('../models/BookingRequest');
const Task = require('../models/Task');
const BudgetItem = require('../models/BudgetItem');
const VendorProfile = require('../models/VendorProfile');
const SourcingRequest = require('../models/SourcingRequest');
const Invoice = require('../models/Invoice');
const Guest = require('../models/Guest');
const Invitation = require('../models/Invitation');
const Communication = require('../models/Communication');
const Feedback = require('../models/Feedback');
const Layout = require('../models/Layout');
const Notification = require('../models/Notification');

const hash = async (pw) => bcrypt.hash(pw, 10);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear all collections
  await Promise.all([
    User.deleteMany(), Event.deleteMany(), Venue.deleteMany(),
    BookingRequest.deleteMany(), Task.deleteMany(), BudgetItem.deleteMany(),
    VendorProfile.deleteMany(), SourcingRequest.deleteMany(), Invoice.deleteMany(),
    Guest.deleteMany(), Invitation.deleteMany(), Communication.deleteMany(),
    Feedback.deleteMany(), Layout.deleteMany(), Notification.deleteMany()
  ]);
  console.log('Collections cleared.');

  // ── USERS ──
  const pw = 'password123';

  const organizer = await User.create({
    name: 'Sara Hassan', email: 'organizer@popeyez.com', passwordHash: pw,
    role: 'organizer', phone: '+20 100 123 4567',
    bio: 'Professional pop-up café event organizer with 5 years of experience in Cairo.',
    isActive: true
  });

  const staff1 = await User.create({
    name: 'Ahmed Karim', email: 'staff@popeyez.com', passwordHash: pw,
    role: 'staff', phone: '+20 101 234 5678',
    bio: 'Event setup specialist and guest coordinator.', isActive: true
  });

  const staff2 = await User.create({
    name: 'Nour El-Din', email: 'staff2@popeyez.com', passwordHash: pw,
    role: 'staff', phone: '+20 102 345 6789',
    bio: 'Barista expert and check-in coordinator.', isActive: true
  });

  const vendor1 = await User.create({
    name: 'Mahmoud Bakery', email: 'vendor@popeyez.com', passwordHash: pw,
    role: 'vendor', phone: '+20 103 456 7890', isActive: true
  });

  const vendor2 = await User.create({
    name: 'Cairo Coffee Supplies', email: 'vendor2@popeyez.com', passwordHash: pw,
    role: 'vendor', phone: '+20 104 567 8901', isActive: true
  });

  const vendor3 = await User.create({
    name: 'Nile Equipment Rentals', email: 'vendor3@popeyez.com', passwordHash: pw,
    role: 'vendor', phone: '+20 105 678 9012', isActive: true
  });

  const venueOwner1 = await User.create({
    name: 'Seifedin Khaled', email: 'venueowner@popeyez.com', passwordHash: pw,
    role: 'venueOwner', phone: '+20 106 789 0123',
    bio: 'Owner of premium event spaces in Zamalek and Dokki.', isActive: true
  });

  const venueOwner2 = await User.create({
    name: 'Layla Nasser', email: 'venueowner2@popeyez.com', passwordHash: pw,
    role: 'venueOwner', phone: '+20 107 890 1234',
    bio: 'Creative venue curator in New Cairo.', isActive: true
  });

  const guestUser1 = await User.create({
    name: 'Yasmin Ibrahim', email: 'guest@popeyez.com', passwordHash: pw,
    role: 'guest', phone: '+20 108 901 2345', isActive: true
  });

  console.log('Users created.');

  // ── VENUES ──
  const venue1 = await Venue.create({
    owner: venueOwner1._id,
    name: 'Zamalek Garden Terrace',
    description: 'A stunning rooftop garden terrace in the heart of Zamalek with panoramic Nile views.',
    location: { address: '15 Hassan Sabry St', city: 'Cairo', area: 'Zamalek' },
    capacity: 150, dimensions: '20m x 30m',
    amenities: ['WiFi', 'Parking', 'Kitchen', 'Sound System', 'Air Conditioning', 'Outdoor Terrace'],
    pricing: { perDay: 8000, perHour: 1200, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    isActive: true, rating: 4.8, reviewCount: 24
  });

  const venue2 = await Venue.create({
    owner: venueOwner1._id,
    name: 'Dokki Art Studio Space',
    description: 'Industrial chic art studio perfect for intimate pop-up cafés with bohemian decor.',
    location: { address: '42 Mohi El Din Abu El Ezz St', city: 'Cairo', area: 'Dokki' },
    capacity: 80, dimensions: '15m x 20m',
    amenities: ['WiFi', 'Kitchen', 'Sound System', 'Projector', 'Skylights'],
    pricing: { perDay: 5000, perHour: 800, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    isActive: true, rating: 4.5, reviewCount: 18
  });

  const venue3 = await Venue.create({
    owner: venueOwner2._id,
    name: 'New Cairo Business Hub',
    description: 'Modern event space in Fifth Settlement with state-of-the-art facilities.',
    location: { address: '90th Street, Fifth Settlement', city: 'Cairo', area: 'New Cairo' },
    capacity: 200, dimensions: '25m x 40m',
    amenities: ['WiFi', 'Parking', 'Full Kitchen', 'Sound System', 'LED Lighting', 'AC', 'Elevator'],
    pricing: { perDay: 12000, perHour: 1800, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'],
    isActive: true, rating: 4.9, reviewCount: 31
  });

  const venue4 = await Venue.create({
    owner: venueOwner2._id,
    name: 'Maadi Riverside Loft',
    description: 'Elegant riverside loft with exposed brick walls and abundant natural light.',
    location: { address: '7 Road 9, Maadi', city: 'Cairo', area: 'Maadi' },
    capacity: 100, dimensions: '18m x 22m',
    amenities: ['WiFi', 'Rooftop Access', 'Kitchen', 'Sound System', 'Bar Counter'],
    pricing: { perDay: 6500, perHour: 1000, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1519167758481-83f29c8a4a6e?w=800'],
    isActive: true, rating: 4.6, reviewCount: 15
  });

  console.log('Venues created.');

  // ── EVENTS ──
  const event1 = await Event.create({
    name: 'Cairo Autumn Brew Café',
    description: 'A cozy autumn-themed pop-up café celebrating Egyptian coffee culture with artisan brews and local pastries.',
    organizer: organizer._id,
    date: new Date('2026-07-15'),
    startTime: '10:00', endTime: '22:00',
    venue: venue1._id,
    status: 'Confirmed',
    eventType: 'Pop-Up Café',
    expectedGuests: 120,
    dressCode: 'Smart Casual',
    agenda: '10:00 Setup | 12:00 Doors Open | 13:00 Live Music | 18:00 Special Tasting | 20:00 Evening Event | 22:00 Close',
    totalBudget: 45000,
    staffMembers: [staff1._id, staff2._id]
  });

  const event2 = await Event.create({
    name: 'Maadi Sunset Espresso Night',
    description: 'An elegant evening pop-up café experience featuring specialty espresso drinks and gourmet bites.',
    organizer: organizer._id,
    date: new Date('2026-08-20'),
    startTime: '17:00', endTime: '23:00',
    venue: venue4._id,
    status: 'Planning',
    eventType: 'Pop-Up Café',
    expectedGuests: 80,
    dressCode: 'Cocktail',
    agenda: '17:00 Setup | 18:00 Doors Open | 19:30 Espresso Master Class | 21:00 DJ Set | 23:00 Close',
    totalBudget: 30000,
    staffMembers: [staff1._id]
  });

  console.log('Events created.');

  // ── BOOKING REQUESTS ──
  await BookingRequest.create({
    organizer: organizer._id, venue: venue1._id, event: event1._id,
    date: new Date('2026-07-15'), expectedAttendees: 120,
    specialRequirements: 'Need kitchen access from 8 AM for prep work',
    status: 'Approved',
    ownerMessage: 'Welcome! We are excited to host your event. Kitchen access granted from 8 AM.'
  });

  await BookingRequest.create({
    organizer: organizer._id, venue: venue3._id, event: event2._id,
    date: new Date('2026-08-20'), expectedAttendees: 80,
    specialRequirements: 'Rooftop access preferred for the evening event',
    status: 'Pending'
  });

  await BookingRequest.create({
    organizer: organizer._id, venue: venue2._id,
    date: new Date('2026-09-10'), expectedAttendees: 60,
    specialRequirements: 'Need full day access including teardown',
    status: 'Counter-Proposed',
    ownerMessage: 'We can offer the space but suggest a different date due to prior booking.',
    counterProposal: { date: new Date('2026-09-15'), price: 5500, notes: 'September 15th is available with the same pricing.' }
  });

  console.log('Booking requests created.');

  // ── TASKS ──
  const tasks = [
    { event: event1._id, title: 'Set up main entrance display', description: 'Arrange welcome banner and floral decorations at entrance', assignedTo: staff1._id, speciality: 'Decoration', status: 'Done', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Prepare barista station', description: 'Set up espresso machines, grinders, and all coffee equipment', assignedTo: staff2._id, speciality: 'Barista', status: 'In Progress', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Arrange seating layout', description: 'Place tables and chairs according to approved floor plan', assignedTo: staff1._id, speciality: 'Setup', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Guest check-in desk setup', description: 'Prepare name list, QR scanner, and welcome packets', assignedTo: staff2._id, speciality: 'Guest Relations', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'Medium' },
    { event: event1._id, title: 'Coordinate pastry delivery', description: 'Receive and store pastry delivery from Mahmoud Bakery', assignedTo: staff1._id, speciality: 'Logistics', status: 'Pending', dueDate: new Date('2026-07-14'), priority: 'High' },
    { event: event1._id, title: 'Sound system check', description: 'Test all audio equipment and coordinate with live music performers', speciality: 'Technical', status: 'Not Assigned', dueDate: new Date('2026-07-15'), priority: 'Medium' },
    { event: event1._id, title: 'Social media live coverage', description: 'Post event highlights on social media throughout the day', assignedTo: staff2._id, speciality: 'Marketing', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'Low' },
    { event: event2._id, title: 'Venue walkthrough and assessment', description: 'Visit Maadi Riverside Loft and take measurements', assignedTo: staff1._id, speciality: 'Planning', status: 'Done', dueDate: new Date('2026-07-01'), priority: 'High' },
    { event: event2._id, title: 'Confirm vendor list for event 2', description: 'Contact and confirm all suppliers for the August event', speciality: 'Coordination', status: 'Not Assigned', dueDate: new Date('2026-08-01'), priority: 'Medium' }
  ];

  for (const t of tasks) {
    await Task.create(t);
  }
  console.log('Tasks created.');

  // ── BUDGET ITEMS ──
  const budgetItems1 = [
    { event: event1._id, category: 'Venue', description: 'Zamalek Garden Terrace rental', plannedAmount: 8000, actualAmount: 8000, notes: 'Confirmed booking' },
    { event: event1._id, category: 'Coffee & Beverages', description: 'Coffee beans, syrups, milk, tea', plannedAmount: 7500, actualAmount: 6800, notes: 'Ordered from Cairo Coffee Supplies' },
    { event: event1._id, category: 'Pastries & Food', description: 'Croissants, cakes, sandwiches', plannedAmount: 6000, actualAmount: 6500, notes: 'Ordered from Mahmoud Bakery - slightly over due to extra items' },
    { event: event1._id, category: 'Equipment Rental', description: 'Extra tables, chairs, display stands', plannedAmount: 4000, actualAmount: 3500, notes: 'Rented from Nile Equipment Rentals' },
    { event: event1._id, category: 'Decoration', description: 'Flowers, banners, table decor, lighting', plannedAmount: 3500, actualAmount: 3200, notes: '' },
    { event: event1._id, category: 'Staff', description: 'Staff payments for the day', plannedAmount: 3000, actualAmount: 3000, notes: '' },
    { event: event1._id, category: 'Marketing', description: 'Social media ads, printing, posters', plannedAmount: 2500, actualAmount: 1800, notes: 'Under budget' },
    { event: event1._id, category: 'Miscellaneous', description: 'Contingency fund', plannedAmount: 2000, actualAmount: 850, notes: '' }
  ];

  const budgetItems2 = [
    { event: event2._id, category: 'Venue', description: 'Maadi Riverside Loft rental', plannedAmount: 6500, actualAmount: 0, notes: 'Booking pending confirmation' },
    { event: event2._id, category: 'Coffee & Beverages', description: 'Specialty espresso supplies', plannedAmount: 5000, actualAmount: 0, notes: 'To be ordered' },
    { event: event2._id, category: 'Food', description: 'Gourmet bites and appetizers', plannedAmount: 4500, actualAmount: 0, notes: '' },
    { event: event2._id, category: 'Equipment', description: 'Espresso machines and accessories', plannedAmount: 3000, actualAmount: 0, notes: '' },
    { event: event2._id, category: 'DJ & Entertainment', description: 'DJ set for evening', plannedAmount: 2500, actualAmount: 0, notes: '' },
    { event: event2._id, category: 'Decoration', description: 'Sunset theme décor', plannedAmount: 2000, actualAmount: 0, notes: '' }
  ];

  for (const item of [...budgetItems1, ...budgetItems2]) {
    await BudgetItem.create(item);
  }
  console.log('Budget items created.');

  // ── VENDOR PROFILES ──
  await VendorProfile.create({
    user: vendor1._id, companyName: 'Mahmoud Bakery & Patisserie',
    suppliesOffered: ['Pastries', 'Cakes', 'Bread', 'Sandwiches', 'Desserts'],
    mainLocation: 'Heliopolis, Cairo',
    pricingList: [
      { item: 'Assorted Croissants (dozen)', price: 180, unit: 'per dozen' },
      { item: 'Specialty Cakes (kg)', price: 350, unit: 'per kg' },
      { item: 'Mini Sandwiches (tray of 30)', price: 450, unit: 'per tray' }
    ],
    contactInfo: { phone: '+20 103 456 7890', email: 'vendor@popeyez.com', website: '' },
    deliveryRegions: ['Greater Cairo', 'Giza', 'Heliopolis', 'Nasr City'],
    minimumOrder: 500, leadTime: '24 hours',
    rating: 4.7, reviewCount: 42
  });

  await VendorProfile.create({
    user: vendor2._id, companyName: 'Cairo Coffee Supplies Co.',
    suppliesOffered: ['Coffee Beans', 'Coffee Equipment', 'Syrups', 'Milk Alternatives', 'Tea', 'Brewing Equipment'],
    mainLocation: 'Mohandessin, Cairo',
    pricingList: [
      { item: 'Single Origin Coffee Beans (250g)', price: 120, unit: 'per bag' },
      { item: 'House Blend (1kg)', price: 380, unit: 'per kg' },
      { item: 'Flavored Syrups (750ml)', price: 85, unit: 'per bottle' },
      { item: 'Oat Milk (1L)', price: 45, unit: 'per carton' }
    ],
    contactInfo: { phone: '+20 104 567 8901', email: 'vendor2@popeyez.com', website: 'www.cairocoffee.eg' },
    deliveryRegions: ['Greater Cairo', 'Giza', 'Maadi', 'Zamalek', 'New Cairo'],
    minimumOrder: 300, leadTime: '48 hours',
    rating: 4.9, reviewCount: 67
  });

  await VendorProfile.create({
    user: vendor3._id, companyName: 'Nile Equipment Rentals',
    suppliesOffered: ['Tables', 'Chairs', 'Tents', 'Display Stands', 'Bar Counters', 'Coffee Carts', 'Lighting'],
    mainLocation: 'Dokki, Cairo',
    pricingList: [
      { item: 'Round Tables (per unit)', price: 150, unit: 'per day' },
      { item: 'Bistro Chairs (per unit)', price: 35, unit: 'per day' },
      { item: 'Coffee Cart', price: 800, unit: 'per day' },
      { item: 'Display Shelf Unit', price: 200, unit: 'per day' }
    ],
    contactInfo: { phone: '+20 105 678 9012', email: 'vendor3@popeyez.com' },
    deliveryRegions: ['All Cairo Governorate'],
    minimumOrder: 1000, leadTime: '72 hours',
    rating: 4.5, reviewCount: 29
  });

  console.log('Vendor profiles created.');

  // ── SOURCING REQUESTS ──
  const sourcing1 = await SourcingRequest.create({
    organizer: organizer._id, vendor: vendor1._id, event: event1._id,
    requestedItems: [
      { item: 'Assorted Croissants', quantity: 15, unit: 'dozen', notes: 'Mix of butter, almond, and chocolate' },
      { item: 'Specialty Cakes', quantity: 5, unit: 'kg', notes: 'Autumn flavors: caramel apple and pumpkin spice' },
      { item: 'Mini Sandwiches', quantity: 4, unit: 'trays', notes: 'Vegetarian and chicken options' }
    ],
    deliveryDate: new Date('2026-07-15'),
    eventLocation: '15 Hassan Sabry St, Zamalek',
    status: 'Out for Delivery',
    totalEstimatedCost: 5970
  });

  // Update status to simulate delivery chain
  sourcing1.status = 'Out for Delivery';
  await sourcing1.save();

  await SourcingRequest.create({
    organizer: organizer._id, vendor: vendor2._id, event: event1._id,
    requestedItems: [
      { item: 'House Blend Coffee Beans', quantity: 5, unit: 'kg', notes: 'For espresso and filter' },
      { item: 'Hazelnut Syrup', quantity: 6, unit: 'bottles' },
      { item: 'Vanilla Syrup', quantity: 6, unit: 'bottles' },
      { item: 'Oat Milk', quantity: 20, unit: 'cartons' }
    ],
    deliveryDate: new Date('2026-07-14'),
    eventLocation: '15 Hassan Sabry St, Zamalek',
    status: 'Delivered',
    totalEstimatedCost: 2810
  });

  await SourcingRequest.create({
    organizer: organizer._id, vendor: vendor3._id, event: event1._id,
    requestedItems: [
      { item: 'Round Tables', quantity: 15, unit: 'units' },
      { item: 'Bistro Chairs', quantity: 60, unit: 'units' },
      { item: 'Coffee Cart', quantity: 2, unit: 'units' }
    ],
    deliveryDate: new Date('2026-07-15'),
    eventLocation: '15 Hassan Sabry St, Zamalek',
    status: 'Preparing',
    totalEstimatedCost: 5350
  });

  console.log('Sourcing requests created.');

  // ── INVOICES ──
  await Invoice.create({
    vendor: vendor2._id, organizer: organizer._id, event: event1._id,
    invoiceNumber: 'INV-2026-001',
    items: [
      { description: 'House Blend Coffee Beans (5kg)', quantity: 5, unitPrice: 380, total: 1900 },
      { description: 'Hazelnut Syrup (6 bottles)', quantity: 6, unitPrice: 85, total: 510 },
      { description: 'Vanilla Syrup (6 bottles)', quantity: 6, unitPrice: 85, total: 510 },
      { description: 'Oat Milk (20 cartons)', quantity: 20, unitPrice: 45, total: 900 }
    ],
    totalAmount: 3820, status: 'Approved',
    itemizedBreakdown: 'Full delivery confirmed on July 14. All items in excellent condition.',
    dueDate: new Date('2026-07-30')
  });

  await Invoice.create({
    vendor: vendor3._id, organizer: organizer._id, event: event1._id,
    invoiceNumber: 'INV-2026-002',
    items: [
      { description: 'Round Tables x15 (1 day)', quantity: 15, unitPrice: 150, total: 2250 },
      { description: 'Bistro Chairs x60 (1 day)', quantity: 60, unitPrice: 35, total: 2100 },
      { description: 'Coffee Cart x2 (1 day)', quantity: 2, unitPrice: 800, total: 1600 }
    ],
    totalAmount: 5950, status: 'Pending Review',
    dueDate: new Date('2026-07-30')
  });

  console.log('Invoices created.');

  // ── GUESTS ──
  const guestData = [
    { guestName: 'Yasmin Ibrahim', email: 'guest@popeyez.com', phone: '+20 108 901 2345', event: event1._id, group: 'VIP', rsvpStatus: 'Attending', dietaryPreferences: ['Vegan'], allergies: ['Nuts'], qrCodeValue: 'QR-YASMIN-001', checkInStatus: true, checkedInAt: new Date('2026-07-15T12:05:00'), checkedInBy: staff2._id },
    { guestName: 'Omar Sayed', email: 'omar.sayed@email.com', phone: '+20 109 012 3456', event: event1._id, group: 'General', rsvpStatus: 'Attending', dietaryPreferences: [], allergies: [], qrCodeValue: 'QR-OMAR-002', checkInStatus: true, checkedInAt: new Date('2026-07-15T12:15:00'), checkedInBy: staff2._id },
    { guestName: 'Mariam Fathy', email: 'mariam.fathy@email.com', event: event1._id, group: 'Press', rsvpStatus: 'Attending', dietaryPreferences: ['Gluten Free'], allergies: ['Gluten'], qrCodeValue: 'QR-MARIAM-003', checkInStatus: false },
    { guestName: 'Tarek Abdallah', email: 'tarek.abdallah@email.com', event: event1._id, group: 'General', rsvpStatus: 'Maybe', dietaryPreferences: ['Vegetarian'], qrCodeValue: 'QR-TAREK-004', checkInStatus: false },
    { guestName: 'Dina Mostafa', email: 'dina.mostafa@email.com', event: event1._id, group: 'VIP', rsvpStatus: 'Not Attending', specialRequirements: 'Would love to attend next time!', qrCodeValue: 'QR-DINA-005', checkInStatus: false },
    { guestName: 'Hossam Rashid', email: 'hossam.rashid@email.com', event: event1._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-HOSSAM-006', checkInStatus: false },
    { guestName: 'Rania Khaled', email: 'rania.khaled@email.com', event: event1._id, group: 'General', rsvpStatus: 'Attending', dietaryPreferences: ['Dairy Free'], qrCodeValue: 'QR-RANIA-007', checkInStatus: false },
    { guestName: 'Karim Samir', email: 'karim.samir@email.com', event: event1._id, group: 'Press', rsvpStatus: 'Pending', qrCodeValue: 'QR-KARIM-008', checkInStatus: false },
    { guestName: 'Salma Wael', email: 'salma.wael@email.com', event: event2._id, group: 'VIP', rsvpStatus: 'Attending', qrCodeValue: 'QR-SALMA-009', checkInStatus: false },
    { guestName: 'Adam Hosny', email: 'adam.hosny@email.com', event: event2._id, group: 'General', rsvpStatus: 'Maybe', qrCodeValue: 'QR-ADAM-010', checkInStatus: false }
  ];

  const guests = [];
  for (const g of guestData) {
    guests.push(await Guest.create(g));
  }
  console.log('Guests created.');

  // ── INVITATIONS ──
  for (const guest of guests.slice(0, 8)) {
    await Invitation.create({
      event: guest.event, guest: guest._id,
      message: `Dear ${guest.guestName}, you are cordially invited to join us at ${guest.event.toString() === event1._id.toString() ? 'Cairo Autumn Brew Café' : 'Maadi Sunset Espresso Night'}! We look forward to seeing you.`,
      status: guest.rsvpStatus !== 'Pending' ? 'Responded' : 'Sent',
      sentAt: new Date('2026-06-15')
    });
  }
  console.log('Invitations created.');

  // ── COMMUNICATIONS ──
  const comm1 = await Communication.create({
    event: event1._id, sentBy: organizer._id,
    message: '🎉 Exciting news! Cairo Autumn Brew Café is confirmed for July 15th at Zamalek Garden Terrace. Doors open at 12 PM. We cannot wait to see you all!',
    recipients: guests.slice(0, 7).map(g => g._id),
    receivedBy: guests.slice(0, 7).map(g => g._id),
    seenBy: guests.slice(0, 5).map(g => g._id)
  });

  await Communication.create({
    event: event1._id, sentBy: organizer._id,
    message: '⏰ Reminder: Event starts in 24 hours! Remember to bring this invitation and arrive 15 minutes early for check-in.',
    recipients: guests.slice(0, 7).map(g => g._id),
    receivedBy: guests.slice(0, 6).map(g => g._id),
    seenBy: guests.slice(0, 3).map(g => g._id),
    isFollowUp: false
  });

  await Communication.create({
    event: event1._id, sentBy: organizer._id,
    message: '📍 Quick update: The parking area is on the building\'s north side. See you soon!',
    recipients: [guests[5]._id, guests[6]._id],
    receivedBy: [guests[5]._id, guests[6]._id],
    seenBy: [],
    isFollowUp: true,
    followUpTo: comm1._id
  });

  console.log('Communications created.');

  // ── FEEDBACK ──
  const feedbackData = [
    { event: event1._id, guest: guests[0]._id, overallRating: 5, foodRating: 5, venueRating: 5, organizationRating: 5, comments: 'Absolutely amazing experience! The coffee was world-class and the venue was breathtaking. Will definitely attend future events!' },
    { event: event1._id, guest: guests[1]._id, overallRating: 4, foodRating: 4, venueRating: 5, organizationRating: 4, comments: 'Great event overall. The pastries were delicious and the staff was very friendly. Could improve the check-in process.' },
    { event: event1._id, guest: guests[2]._id, overallRating: 5, foodRating: 5, venueRating: 4, organizationRating: 5, comments: 'Loved every minute! As a press member, I was impressed by the professional organization and the quality of offerings.' },
    { event: event1._id, guest: guests[5]._id, overallRating: 3, foodRating: 3, venueRating: 4, organizationRating: 3, comments: 'Decent event but the wait times for coffee were a bit long. The venue was beautiful though.' }
  ];

  for (const f of feedbackData) {
    await Feedback.create(f);
  }
  console.log('Feedback created.');

  // ── LAYOUT ──
  await Layout.create({
    event: event1._id,
    elements: [
      { id: 'el-1', type: 'entrance', label: 'Main Entrance', x: 350, y: 20, width: 100, height: 40, rotation: 0, color: '#2196F3', seats: 0 },
      { id: 'el-2', type: 'bar', label: 'Coffee Bar', x: 50, y: 80, width: 200, height: 60, rotation: 0, color: '#795548', seats: 0 },
      { id: 'el-3', type: 'table', label: 'Table A1', x: 50, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-4', type: 'table', label: 'Table A2', x: 180, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-5', type: 'table', label: 'Table B1', x: 310, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-6', type: 'booth', label: 'VIP Booth 1', x: 500, y: 150, width: 120, height: 80, rotation: 0, color: '#9C27B0', seats: 6 },
      { id: 'el-7', type: 'booth', label: 'VIP Booth 2', x: 500, y: 280, width: 120, height: 80, rotation: 0, color: '#9C27B0', seats: 6 },
      { id: 'el-8', type: 'stage', label: 'Live Music Stage', x: 50, y: 420, width: 200, height: 100, rotation: 0, color: '#FF5722', seats: 0 },
      { id: 'el-9', type: 'table', label: 'Table C1', x: 310, y: 400, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-10', type: 'table', label: 'Table C2', x: 440, y: 400, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-11', type: 'equipment', label: 'Check-in Desk', x: 600, y: 20, width: 100, height: 60, rotation: 0, color: '#607D8B', seats: 0 },
      { id: 'el-12', type: 'exit', label: 'Emergency Exit', x: 680, y: 500, width: 80, height: 40, rotation: 0, color: '#F44336', seats: 0 }
    ],
    setupInstructions: 'Setup order:\n1. Coffee Bar first (needs plumbing connection)\n2. Check-in Desk at entrance\n3. Tables and chairs per layout\n4. VIP Booths with premium seating\n5. Stage for live music - ensure 3m clearance around\n6. Final decoration and lighting\n\nImportant: Keep emergency exit clear at all times.',
    canvasWidth: 800, canvasHeight: 600,
    sharedWithStaff: true
  });

  console.log('Layout created.');

  // ── NOTIFICATIONS ──
  const notifs = [
    { user: organizer._id, title: 'Booking Approved', message: 'Your booking request for Zamalek Garden Terrace has been approved!', type: 'booking', isRead: true },
    { user: organizer._id, title: 'New Invoice Submitted', message: 'Cairo Coffee Supplies submitted an invoice of 3,820 EGP', type: 'invoice', isRead: true },
    { user: organizer._id, title: 'New Invoice Submitted', message: 'Nile Equipment Rentals submitted an invoice of 5,950 EGP for review', type: 'invoice', isRead: false },
    { user: organizer._id, title: 'Budget Alert', message: 'Pastries & Food category exceeded planned budget by 500 EGP', type: 'general', isRead: false },
    { user: staff1._id, title: 'Task Assigned', message: 'You have been assigned: Set up main entrance display', type: 'task', isRead: true },
    { user: staff1._id, title: 'Task Assigned', message: 'You have been assigned: Coordinate pastry delivery', type: 'task', isRead: false },
    { user: staff2._id, title: 'Task Assigned', message: 'You have been assigned: Prepare barista station', type: 'task', isRead: false },
    { user: vendor2._id, title: 'New Sourcing Request', message: 'Sara Hassan sent a new sourcing request for coffee supplies', type: 'general', isRead: true },
    { user: vendor3._id, title: 'New Sourcing Request', message: 'Sara Hassan sent a sourcing request for equipment rental', type: 'general', isRead: false },
    { user: venueOwner1._id, title: 'New Booking Request', message: 'New booking request from Sara Hassan for July 15, 2026', type: 'booking', isRead: true }
  ];

  for (const n of notifs) {
    await Notification.create(n);
  }
  console.log('Notifications created.');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('═══ DEMO CREDENTIALS ═══');
  console.log('Organizer:   organizer@popeyez.com   / password123');
  console.log('Staff:       staff@popeyez.com        / password123');
  console.log('Staff 2:     staff2@popeyez.com       / password123');
  console.log('Vendor:      vendor@popeyez.com       / password123');
  console.log('Vendor 2:    vendor2@popeyez.com      / password123');
  console.log('Vendor 3:    vendor3@popeyez.com      / password123');
  console.log('Guest:       guest@popeyez.com        / password123');
  console.log('Venue Owner: venueowner@popeyez.com   / password123');
  console.log('Venue Own 2: venueowner2@popeyez.com  / password123');
  console.log('════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
