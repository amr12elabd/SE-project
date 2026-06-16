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

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  await Promise.all([
    User.deleteMany(), Event.deleteMany(), Venue.deleteMany(),
    BookingRequest.deleteMany(), Task.deleteMany(), BudgetItem.deleteMany(),
    VendorProfile.deleteMany(), SourcingRequest.deleteMany(), Invoice.deleteMany(),
    Guest.deleteMany(), Invitation.deleteMany(), Communication.deleteMany(),
    Feedback.deleteMany(), Layout.deleteMany(), Notification.deleteMany()
  ]);
  console.log('Collections cleared.');

  const pw = 'password123';

  // ── USERS ──
  const organizer = await User.create({ name: 'Sara Hassan', email: 'organizer@popeyez.com', passwordHash: pw, role: 'organizer', phone: '+20 100 123 4567', bio: 'Professional pop-up café event organizer with 5 years of experience in Cairo.', isActive: true });
  const organizer2 = await User.create({ name: 'Rami Adel', email: 'organizer2@popeyez.com', passwordHash: pw, role: 'organizer', phone: '+20 100 999 8877', bio: 'Specialty coffee event curator and brand experience designer.', isActive: true });

  const staff1 = await User.create({ name: 'Ahmed Karim', email: 'staff@popeyez.com', passwordHash: pw, role: 'staff', phone: '+20 101 234 5678', bio: 'Event setup specialist and guest coordinator.', isActive: true });
  const staff2 = await User.create({ name: 'Nour El-Din', email: 'staff2@popeyez.com', passwordHash: pw, role: 'staff', phone: '+20 102 345 6789', bio: 'Barista expert and check-in coordinator.', isActive: true });
  const staff3 = await User.create({ name: 'Lina Saad', email: 'staff3@popeyez.com', passwordHash: pw, role: 'staff', phone: '+20 102 777 3344', bio: 'Logistics and vendor liaison specialist.', isActive: true });
  const staff4 = await User.create({ name: 'Khaled Mansour', email: 'staff4@popeyez.com', passwordHash: pw, role: 'staff', phone: '+20 101 555 6677', bio: 'Technical setup and audio-visual coordinator.', isActive: true });

  const vendor1 = await User.create({ name: "Atwa's Bakery", email: 'vendor@popeyez.com', passwordHash: pw, role: 'vendor', phone: '+20 103 456 7890', isActive: true });
  const vendor2 = await User.create({ name: 'Cairo Coffee Supplies', email: 'vendor2@popeyez.com', passwordHash: pw, role: 'vendor', phone: '+20 104 567 8901', isActive: true });
  const vendor3 = await User.create({ name: 'Nile Equipment Rentals', email: 'vendor3@popeyez.com', passwordHash: pw, role: 'vendor', phone: '+20 105 678 9012', isActive: true });
  const vendor4 = await User.create({ name: 'Nour Floral Design', email: 'vendor4@popeyez.com', passwordHash: pw, role: 'vendor', phone: '+20 106 111 2233', isActive: true });
  const vendor5 = await User.create({ name: 'SoundWave Productions', email: 'vendor5@popeyez.com', passwordHash: pw, role: 'vendor', phone: '+20 107 444 5566', isActive: true });

  const venueOwner1 = await User.create({ name: 'Seifedin Khaled', email: 'venueowner@popeyez.com', passwordHash: pw, role: 'venueOwner', phone: '+20 106 789 0123', bio: 'Owner of premium event spaces in Zamalek and Dokki.', isActive: true });
  const venueOwner2 = await User.create({ name: 'Layla Nasser', email: 'venueowner2@popeyez.com', passwordHash: pw, role: 'venueOwner', phone: '+20 107 890 1234', bio: 'Creative venue curator in New Cairo.', isActive: true });
  const venueOwner3 = await User.create({ name: 'Tarek Bishara', email: 'venueowner3@popeyez.com', passwordHash: pw, role: 'venueOwner', phone: '+20 100 321 9988', bio: 'Industrial and creative space developer in Heliopolis.', isActive: true });

  const guestUser1 = await User.create({ name: 'Yasmin Ibrahim', email: 'guest@popeyez.com', passwordHash: pw, role: 'guest', phone: '+20 108 901 2345', isActive: true });
  const guestUser2 = await User.create({ name: 'Shady Peter', email: 'shady@popeyez.com', passwordHash: pw, role: 'guest', phone: '+20 109 777 8899', isActive: true });

  console.log('Users created.');

  // ── VENUES ──
  const venue1 = await Venue.create({
    owner: venueOwner1._id, name: 'Zamalek Garden Terrace',
    description: 'Stunning rooftop garden terrace in the heart of Zamalek with panoramic Nile views and lush greenery.',
    location: { address: '15 Hassan Sabry St', city: 'Cairo', area: 'Zamalek' },
    capacity: 150, dimensions: '20m x 30m',
    amenities: ['WiFi', 'Parking', 'Kitchen', 'Sound System', 'Air Conditioning', 'Outdoor Terrace', 'Restrooms'],
    pricing: { perDay: 8000, perHour: 1200, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    isActive: true, rating: 4.8, reviewCount: 24
  });

  const venue2 = await Venue.create({
    owner: venueOwner1._id, name: 'Dokki Art Studio Space',
    description: 'Industrial chic art studio perfect for intimate pop-up cafés with bohemian decor and skylights.',
    location: { address: '42 Mohi El Din Abu El Ezz St', city: 'Cairo', area: 'Dokki' },
    capacity: 80, dimensions: '15m x 20m',
    amenities: ['WiFi', 'Kitchen', 'Sound System', 'Projector', 'Skylights', 'Art Gallery Wall'],
    pricing: { perDay: 5000, perHour: 800, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    isActive: true, rating: 4.5, reviewCount: 18
  });

  const venue3 = await Venue.create({
    owner: venueOwner2._id, name: 'New Cairo Business Hub',
    description: 'Modern event space in Fifth Settlement with state-of-the-art facilities and ample parking.',
    location: { address: '90th Street, Fifth Settlement', city: 'Cairo', area: 'New Cairo' },
    capacity: 250, dimensions: '25m x 40m',
    amenities: ['WiFi', 'Parking', 'Full Kitchen', 'Sound System', 'LED Lighting', 'AC', 'Elevator', 'Catering Area'],
    pricing: { perDay: 12000, perHour: 1800, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'],
    isActive: true, rating: 4.9, reviewCount: 31
  });

  const venue4 = await Venue.create({
    owner: venueOwner2._id, name: 'Maadi Riverside Loft',
    description: 'Elegant riverside loft with exposed brick walls, abundant natural light and rooftop access.',
    location: { address: '7 Road 9, Maadi', city: 'Cairo', area: 'Maadi' },
    capacity: 100, dimensions: '18m x 22m',
    amenities: ['WiFi', 'Rooftop Access', 'Kitchen', 'Sound System', 'Bar Counter', 'Projector'],
    pricing: { perDay: 6500, perHour: 1000, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1519167758481-83f29c8a4a6e?w=800'],
    isActive: true, rating: 4.6, reviewCount: 15
  });

  const venue5 = await Venue.create({
    owner: venueOwner3._id, name: 'Heliopolis Creative Warehouse',
    description: 'Converted industrial warehouse with 400sqm of open floor plan, ideal for large-scale pop-up events.',
    location: { address: '22 Al Ahram St', city: 'Cairo', area: 'Heliopolis' },
    capacity: 400, dimensions: '40m x 50m',
    amenities: ['WiFi', 'Parking', 'Loading Dock', 'Full Kitchen', 'Industrial Sound', 'Mezzanine Level', 'AC', 'Freight Elevator'],
    pricing: { perDay: 18000, perHour: 2500, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800'],
    isActive: true, rating: 4.7, reviewCount: 9
  });

  const venue6 = await Venue.create({
    owner: venueOwner3._id, name: 'Garden City Boutique Hall',
    description: 'Intimate colonial-era boutique hall with mosaic floors and a private garden courtyard.',
    location: { address: '3 Kasr El Ainy St', city: 'Cairo', area: 'Garden City' },
    capacity: 60, dimensions: '12m x 15m',
    amenities: ['WiFi', 'Garden Courtyard', 'Vintage Decor', 'Mini Kitchen', 'Ambient Lighting'],
    pricing: { perDay: 4000, perHour: 650, currency: 'EGP' },
    photos: ['https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'],
    isActive: true, rating: 4.4, reviewCount: 11
  });

  console.log('Venues created.');

  // ── EVENTS ──
  const event1 = await Event.create({
    name: 'Cairo Autumn Brew Café',
    description: 'A cozy autumn-themed pop-up café celebrating Egyptian coffee culture with artisan brews and local pastries.',
    organizer: organizer._id,
    date: new Date('2026-07-15'), startTime: '10:00', endTime: '22:00',
    venue: venue1._id, status: 'Confirmed', eventType: 'Pop-Up Café',
    expectedGuests: 120, dressCode: 'Smart Casual',
    agenda: '10:00 Setup | 12:00 Doors Open | 13:00 Live Music | 18:00 Special Tasting | 20:00 Evening Event | 22:00 Close',
    totalBudget: 45000, staffMembers: [staff1._id, staff2._id, staff3._id]
  });

  const event2 = await Event.create({
    name: 'Maadi Sunset Espresso Night',
    description: 'An elegant evening pop-up café experience featuring specialty espresso drinks and gourmet bites with a DJ set.',
    organizer: organizer._id,
    date: new Date('2026-08-20'), startTime: '17:00', endTime: '23:00',
    venue: venue4._id, status: 'Planning', eventType: 'Pop-Up Café',
    expectedGuests: 80, dressCode: 'Cocktail',
    agenda: '17:00 Setup | 18:00 Doors Open | 19:30 Espresso Master Class | 21:00 DJ Set | 23:00 Close',
    totalBudget: 30000, staffMembers: [staff1._id, staff4._id]
  });

  const event3 = await Event.create({
    name: 'Heliopolis Coffee & Art Fair',
    description: 'A large-scale pop-up event combining specialty coffee with local art exhibitions, live roasting, and workshops.',
    organizer: organizer2._id,
    date: new Date('2026-09-05'), startTime: '09:00', endTime: '21:00',
    venue: venue5._id, status: 'Planning', eventType: 'Coffee & Art Fair',
    expectedGuests: 300, dressCode: 'Casual',
    agenda: '09:00 Setup | 10:00 Doors Open | 11:00 Live Roasting Demo | 13:00 Art Gallery Opens | 15:00 Workshops | 19:00 Evening Music | 21:00 Close',
    totalBudget: 85000, staffMembers: [staff2._id, staff3._id, staff4._id]
  });

  const event4 = await Event.create({
    name: 'Dokki Brew Workshop',
    description: 'An intimate hands-on coffee brewing workshop for enthusiasts — covering V60, Chemex, AeroPress and more.',
    organizer: organizer2._id,
    date: new Date('2026-06-10'), startTime: '14:00', endTime: '19:00',
    venue: venue2._id, status: 'Completed', eventType: 'Workshop',
    expectedGuests: 30, dressCode: 'Casual',
    agenda: '14:00 Setup | 15:00 Welcome & Intro | 15:30 V60 Session | 16:30 Chemex Session | 17:30 AeroPress Session | 18:30 Tasting & Q&A | 19:00 Close',
    totalBudget: 12000, staffMembers: [staff2._id]
  });

  const event5 = await Event.create({
    name: 'Zamalek Winter Rooftop Café',
    description: 'A seasonal winter pop-up café on the rooftop terrace of Zamalek Garden with hot drinks, live jazz and city views.',
    organizer: organizer._id,
    date: new Date('2026-12-20'), startTime: '16:00', endTime: '23:00',
    venue: venue1._id, status: 'Planning', eventType: 'Pop-Up Café',
    expectedGuests: 100, dressCode: 'Smart Casual',
    agenda: '16:00 Setup | 17:00 Doors Open | 18:00 Live Jazz | 20:00 Special Menu | 23:00 Close',
    totalBudget: 38000, staffMembers: [staff1._id, staff2._id]
  });

  console.log('Events created.');

  // ── BOOKING REQUESTS ──
  await BookingRequest.create({ organizer: organizer._id, venue: venue1._id, event: event1._id, date: new Date('2026-07-15'), expectedAttendees: 120, specialRequirements: 'Need kitchen access from 8 AM for prep work', status: 'Approved', ownerMessage: 'Welcome! Kitchen access granted from 8 AM. Please coordinate with our facilities team.' });
  await BookingRequest.create({ organizer: organizer._id, venue: venue4._id, event: event2._id, date: new Date('2026-08-20'), expectedAttendees: 80, specialRequirements: 'Rooftop access preferred for the evening event', status: 'Pending' });
  await BookingRequest.create({ organizer: organizer2._id, venue: venue5._id, event: event3._id, date: new Date('2026-09-05'), expectedAttendees: 300, specialRequirements: 'Need loading dock access from 7 AM and full kitchen all day', status: 'Approved', ownerMessage: 'All set! Loading dock will be accessible from 7 AM. Please park freight in the rear.' });
  await BookingRequest.create({ organizer: organizer2._id, venue: venue2._id, event: event4._id, date: new Date('2026-06-10'), expectedAttendees: 30, specialRequirements: 'Workshop setup: 6 brewing stations needed', status: 'Approved', ownerMessage: 'Perfect for a workshop! Tables will be arranged in station format as requested.' });
  await BookingRequest.create({ organizer: organizer._id, venue: venue1._id, event: event5._id, date: new Date('2026-12-20'), expectedAttendees: 100, specialRequirements: 'Heaters needed on rooftop for winter event', status: 'Counter-Proposed', ownerMessage: 'We can accommodate but suggest December 19th as we have a booking on the 20th until 3 PM.', counterProposal: { date: new Date('2026-12-19'), price: 8500, notes: 'We can add 4 outdoor heaters at no extra cost.' } });
  await BookingRequest.create({ organizer: organizer._id, venue: venue3._id, date: new Date('2026-10-15'), expectedAttendees: 200, specialRequirements: 'Large pop-up market event with 20 vendor stalls', status: 'Pending' });

  console.log('Booking requests created.');

  // ── TASKS ──
  const allTasks = [
    // Event 1 - Cairo Autumn Brew Café (Confirmed)
    { event: event1._id, title: 'Set up main entrance display', description: 'Arrange welcome banner and floral decorations at entrance', assignedTo: staff1._id, speciality: 'Decoration', status: 'Done', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Prepare barista station', description: 'Set up espresso machines, grinders, and all coffee equipment', assignedTo: staff2._id, speciality: 'Barista', status: 'In Progress', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Arrange seating layout', description: 'Place tables and chairs according to approved floor plan', assignedTo: staff1._id, speciality: 'Setup', status: 'Done', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Guest check-in desk setup', description: 'Prepare name list, QR scanner, and welcome packets', assignedTo: staff2._id, speciality: 'Guest Relations', status: 'In Progress', dueDate: new Date('2026-07-15'), priority: 'Medium' },
    { event: event1._id, title: 'Coordinate pastry delivery', description: "Receive and store pastry delivery from Atwa's Bakery", assignedTo: staff3._id, speciality: 'Logistics', status: 'Done', dueDate: new Date('2026-07-14'), priority: 'High' },
    { event: event1._id, title: 'Sound system check', description: 'Test all audio equipment and coordinate with live music performers', assignedTo: staff4._id, speciality: 'Technical', status: 'In Progress', dueDate: new Date('2026-07-15'), priority: 'High' },
    { event: event1._id, title: 'Social media live coverage', description: 'Post event highlights and stories throughout the day', assignedTo: staff2._id, speciality: 'Marketing', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'Low' },
    { event: event1._id, title: 'VIP table decoration', description: 'Set up premium centerpieces and personalized name cards for VIP tables', assignedTo: staff1._id, speciality: 'Decoration', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'Medium' },
    { event: event1._id, title: 'Stock coffee supplies', description: 'Count and organize all coffee beans, syrups and milk in prep area', assignedTo: staff3._id, speciality: 'Logistics', status: 'Done', dueDate: new Date('2026-07-14'), priority: 'High' },
    { event: event1._id, title: 'Brief event-day staff', description: 'Hold a 30-minute briefing session with all staff on roles and positions', speciality: 'Coordination', status: 'Not Assigned', dueDate: new Date('2026-07-15'), priority: 'Medium' },
    { event: event1._id, title: 'Lighting setup', description: 'Install warm ambient string lights and spot lighting for stage area', assignedTo: staff4._id, speciality: 'Technical', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'Medium' },
    { event: event1._id, title: 'Restroom inspection', description: 'Ensure restrooms are stocked, clean, and marked correctly', assignedTo: staff3._id, speciality: 'Facilities', status: 'Pending', dueDate: new Date('2026-07-15'), priority: 'Low' },

    // Event 2 - Maadi Sunset Espresso Night (Planning)
    { event: event2._id, title: 'Venue walkthrough and assessment', description: 'Visit Maadi Riverside Loft and take measurements for layout planning', assignedTo: staff1._id, speciality: 'Planning', status: 'Done', dueDate: new Date('2026-07-01'), priority: 'High' },
    { event: event2._id, title: 'Confirm vendor list', description: 'Contact and confirm all suppliers for the August event', assignedTo: staff3._id, speciality: 'Coordination', status: 'In Progress', dueDate: new Date('2026-07-30'), priority: 'High' },
    { event: event2._id, title: 'Design event flyer', description: 'Create digital flyer and social media assets for the event', speciality: 'Marketing', status: 'Not Assigned', dueDate: new Date('2026-07-25'), priority: 'Medium' },
    { event: event2._id, title: 'Book DJ', description: 'Finalize DJ contract and sound requirements for the evening set', assignedTo: staff4._id, speciality: 'Entertainment', status: 'Pending', dueDate: new Date('2026-07-20'), priority: 'High' },
    { event: event2._id, title: 'Plan espresso master class', description: 'Prepare slides, demo equipment, and class content for master class session', assignedTo: staff2._id, speciality: 'Barista', status: 'Pending', dueDate: new Date('2026-08-10'), priority: 'High' },
    { event: event2._id, title: 'Guest list management', description: 'Finalize and confirm RSVP list with dietary notes', assignedTo: staff1._id, speciality: 'Guest Relations', status: 'Pending', dueDate: new Date('2026-08-15'), priority: 'Medium' },

    // Event 3 - Heliopolis Coffee & Art Fair (Planning)
    { event: event3._id, title: 'Coordinate with 15 art exhibitors', description: 'Confirm participation, collect artwork details and space requirements', assignedTo: staff3._id, speciality: 'Coordination', status: 'In Progress', dueDate: new Date('2026-08-15'), priority: 'High' },
    { event: event3._id, title: 'Set up roasting demo zone', description: 'Arrange live roasting station with ventilation and power supply', assignedTo: staff4._id, speciality: 'Technical', status: 'Pending', dueDate: new Date('2026-09-05'), priority: 'High' },
    { event: event3._id, title: 'Workshop registration system', description: 'Build a simple sign-up sheet or digital form for workshop slots', assignedTo: staff2._id, speciality: 'Operations', status: 'Pending', dueDate: new Date('2026-08-20'), priority: 'Medium' },
    { event: event3._id, title: 'Sponsor banner placement', description: 'Plan and install sponsor banners and branding throughout the venue', speciality: 'Marketing', status: 'Not Assigned', dueDate: new Date('2026-09-05'), priority: 'Medium' },
    { event: event3._id, title: 'First aid station setup', description: 'Set up first aid kit, defibrillator access point and emergency contact list', assignedTo: staff3._id, speciality: 'Safety', status: 'Pending', dueDate: new Date('2026-09-05'), priority: 'High' },
    { event: event3._id, title: 'Order 300 welcome bags', description: 'Source and fill branded welcome bags with coffee samples and schedule', speciality: 'Logistics', status: 'Not Assigned', dueDate: new Date('2026-08-25'), priority: 'Medium' },

    // Event 4 - Dokki Brew Workshop (Completed)
    { event: event4._id, title: 'Prepare 6 brewing stations', description: 'Set up V60, Chemex and AeroPress stations with all equipment', assignedTo: staff2._id, speciality: 'Barista', status: 'Done', dueDate: new Date('2026-06-10'), priority: 'High' },
    { event: event4._id, title: 'Print workshop handouts', description: 'Print brewing guides, recipe cards and tasting notes for all attendees', assignedTo: staff3._id, speciality: 'Operations', status: 'Done', dueDate: new Date('2026-06-09'), priority: 'Medium' },
    { event: event4._id, title: 'Source 3 single-origin coffees', description: 'Select and purchase 3 distinct coffees for the tasting session', assignedTo: staff2._id, speciality: 'Barista', status: 'Done', dueDate: new Date('2026-06-08'), priority: 'High' },
    { event: event4._id, title: 'Post-event cleanup', description: 'Clean all equipment, restore venue to original state', assignedTo: staff2._id, speciality: 'Facilities', status: 'Done', dueDate: new Date('2026-06-10'), priority: 'Low' },

    // Event 5 - Zamalek Winter Rooftop (Planning)
    { event: event5._id, title: 'Source outdoor heaters', description: 'Rent or buy 6 outdoor patio heaters for rooftop winter comfort', speciality: 'Logistics', status: 'Not Assigned', dueDate: new Date('2026-12-10'), priority: 'High' },
    { event: event5._id, title: 'Book jazz trio', description: 'Find and contract a jazz trio for the live music session', speciality: 'Entertainment', status: 'Not Assigned', dueDate: new Date('2026-11-30'), priority: 'High' },
    { event: event5._id, title: 'Plan winter drink menu', description: 'Design seasonal menu featuring hot chocolate, mulled drinks, and specialty lattes', assignedTo: staff2._id, speciality: 'Barista', status: 'Pending', dueDate: new Date('2026-12-01'), priority: 'Medium' },
  ];

  for (const t of allTasks) await Task.create(t);
  console.log('Tasks created.');

  // ── VENDOR PROFILES ──
  await VendorProfile.create({
    user: vendor1._id, companyName: "Atwa's Bakery & Patisserie",
    suppliesOffered: ['Pastries', 'Cakes', 'Bread', 'Sandwiches', 'Desserts', 'Custom Cakes'],
    mainLocation: 'Heliopolis, Cairo',
    pricingList: [
      { item: 'Assorted Croissants (dozen)', price: 180, unit: 'per dozen' },
      { item: 'Specialty Cakes (kg)', price: 350, unit: 'per kg' },
      { item: 'Mini Sandwiches (tray of 30)', price: 450, unit: 'per tray' },
      { item: 'Custom Event Cake', price: 1200, unit: 'per order' }
    ],
    contactInfo: { phone: '+20 103 456 7890', email: 'vendor@popeyez.com' },
    deliveryRegions: ['Greater Cairo', 'Giza', 'Heliopolis', 'Nasr City'],
    minimumOrder: 500, leadTime: '24 hours', rating: 4.7, reviewCount: 42
  });

  await VendorProfile.create({
    user: vendor2._id, companyName: 'Cairo Coffee Supplies Co.',
    suppliesOffered: ['Coffee Beans', 'Espresso Equipment', 'Syrups', 'Milk Alternatives', 'Tea', 'Brewing Equipment'],
    mainLocation: 'Mohandessin, Cairo',
    pricingList: [
      { item: 'Single Origin Coffee Beans (250g)', price: 120, unit: 'per bag' },
      { item: 'House Blend (1kg)', price: 380, unit: 'per kg' },
      { item: 'Flavored Syrups (750ml)', price: 85, unit: 'per bottle' },
      { item: 'Oat Milk (1L)', price: 45, unit: 'per carton' },
      { item: 'Espresso Machine (rental/day)', price: 600, unit: 'per day' }
    ],
    contactInfo: { phone: '+20 104 567 8901', email: 'vendor2@popeyez.com', website: 'www.cairocoffee.eg' },
    deliveryRegions: ['Greater Cairo', 'Giza', 'Maadi', 'Zamalek', 'New Cairo'],
    minimumOrder: 300, leadTime: '48 hours', rating: 4.9, reviewCount: 67
  });

  await VendorProfile.create({
    user: vendor3._id, companyName: 'Nile Equipment Rentals',
    suppliesOffered: ['Tables', 'Chairs', 'Tents', 'Display Stands', 'Bar Counters', 'Coffee Carts', 'Lighting Rigs'],
    mainLocation: 'Dokki, Cairo',
    pricingList: [
      { item: 'Round Tables (per unit)', price: 150, unit: 'per day' },
      { item: 'Bistro Chairs (per unit)', price: 35, unit: 'per day' },
      { item: 'Coffee Cart (branded)', price: 800, unit: 'per day' },
      { item: 'Display Shelf Unit', price: 200, unit: 'per day' },
      { item: 'Folding Tent (3x3m)', price: 700, unit: 'per day' }
    ],
    contactInfo: { phone: '+20 105 678 9012', email: 'vendor3@popeyez.com' },
    deliveryRegions: ['All Cairo Governorate'],
    minimumOrder: 1000, leadTime: '72 hours', rating: 4.5, reviewCount: 29
  });

  await VendorProfile.create({
    user: vendor4._id, companyName: 'Nour Floral Design Studio',
    suppliesOffered: ['Floral Arrangements', 'Table Centerpieces', 'Entrance Arches', 'Hanging Installations', 'Seasonal Decor'],
    mainLocation: 'Zamalek, Cairo',
    pricingList: [
      { item: 'Table Centerpiece (small)', price: 250, unit: 'per piece' },
      { item: 'Table Centerpiece (large)', price: 450, unit: 'per piece' },
      { item: 'Entrance Floral Arch', price: 2500, unit: 'per arch' },
      { item: 'Hanging Floral Installation', price: 3500, unit: 'per installation' }
    ],
    contactInfo: { phone: '+20 106 111 2233', email: 'vendor4@popeyez.com' },
    deliveryRegions: ['Zamalek', 'Maadi', 'Heliopolis', 'New Cairo', 'Garden City'],
    minimumOrder: 800, leadTime: '48 hours', rating: 4.8, reviewCount: 33
  });

  await VendorProfile.create({
    user: vendor5._id, companyName: 'SoundWave Productions',
    suppliesOffered: ['PA Systems', 'DJ Equipment', 'Live Sound Engineering', 'Stage Lighting', 'Microphones'],
    mainLocation: 'Nasr City, Cairo',
    pricingList: [
      { item: 'Basic PA System (half day)', price: 1500, unit: 'per booking' },
      { item: 'Full Sound + Lighting (full day)', price: 6000, unit: 'per day' },
      { item: 'DJ Equipment Package', price: 2500, unit: 'per night' },
      { item: 'Sound Engineer (per hour)', price: 350, unit: 'per hour' }
    ],
    contactInfo: { phone: '+20 107 444 5566', email: 'vendor5@popeyez.com' },
    deliveryRegions: ['All Greater Cairo'],
    minimumOrder: 1500, leadTime: '5 days', rating: 4.6, reviewCount: 21
  });

  console.log('Vendor profiles created.');

  // ── SOURCING REQUESTS ──
  await SourcingRequest.create({ organizer: organizer._id, vendor: vendor1._id, event: event1._id, requestedItems: [{ item: 'Assorted Croissants', quantity: 15, unit: 'dozen', notes: 'Mix of butter, almond, and chocolate' }, { item: 'Specialty Cakes', quantity: 5, unit: 'kg', notes: 'Autumn flavors: caramel apple and pumpkin spice' }, { item: 'Mini Sandwiches', quantity: 4, unit: 'trays', notes: 'Vegetarian and chicken options' }], deliveryDate: new Date('2026-07-15'), eventLocation: '15 Hassan Sabry St, Zamalek', status: 'Out for Delivery', totalEstimatedCost: 5970 });
  await SourcingRequest.create({ organizer: organizer._id, vendor: vendor2._id, event: event1._id, requestedItems: [{ item: 'House Blend Coffee Beans', quantity: 5, unit: 'kg' }, { item: 'Hazelnut Syrup', quantity: 6, unit: 'bottles' }, { item: 'Vanilla Syrup', quantity: 6, unit: 'bottles' }, { item: 'Oat Milk', quantity: 20, unit: 'cartons' }], deliveryDate: new Date('2026-07-14'), eventLocation: '15 Hassan Sabry St, Zamalek', status: 'Delivered', totalEstimatedCost: 2810 });
  await SourcingRequest.create({ organizer: organizer._id, vendor: vendor3._id, event: event1._id, requestedItems: [{ item: 'Round Tables', quantity: 15, unit: 'units' }, { item: 'Bistro Chairs', quantity: 60, unit: 'units' }, { item: 'Coffee Cart', quantity: 2, unit: 'units' }], deliveryDate: new Date('2026-07-15'), eventLocation: '15 Hassan Sabry St, Zamalek', status: 'Preparing', totalEstimatedCost: 5350 });
  await SourcingRequest.create({ organizer: organizer._id, vendor: vendor4._id, event: event1._id, requestedItems: [{ item: 'Table Centerpiece (large)', quantity: 12, unit: 'pieces', notes: 'Autumn theme: orange, burgundy, gold tones' }, { item: 'Entrance Floral Arch', quantity: 1, unit: 'arch', notes: 'Matching autumn palette' }], deliveryDate: new Date('2026-07-15'), eventLocation: '15 Hassan Sabry St, Zamalek', status: 'Accepted', totalEstimatedCost: 7900 });
  await SourcingRequest.create({ organizer: organizer._id, vendor: vendor5._id, event: event1._id, requestedItems: [{ item: 'Full Sound + Lighting (full day)', quantity: 1, unit: 'day', notes: 'Live music at 1 PM, DJ set at 8 PM' }], deliveryDate: new Date('2026-07-15'), eventLocation: '15 Hassan Sabry St, Zamalek', status: 'Accepted', totalEstimatedCost: 6000 });
  await SourcingRequest.create({ organizer: organizer._id, vendor: vendor2._id, event: event2._id, requestedItems: [{ item: 'Single Origin Coffee Beans (250g)', quantity: 10, unit: 'bags', notes: 'For master class — need tasting notes' }, { item: 'Espresso Machine (rental/day)', quantity: 2, unit: 'day' }], deliveryDate: new Date('2026-08-20'), eventLocation: '7 Road 9, Maadi', status: 'Pending', totalEstimatedCost: 2400 });
  await SourcingRequest.create({ organizer: organizer2._id, vendor: vendor1._id, event: event3._id, requestedItems: [{ item: 'Assorted Croissants', quantity: 30, unit: 'dozen' }, { item: 'Custom Event Cake', quantity: 3, unit: 'order', notes: 'Branded with event logo' }], deliveryDate: new Date('2026-09-05'), eventLocation: '22 Al Ahram St, Heliopolis', status: 'Pending', totalEstimatedCost: 9000 });
  await SourcingRequest.create({ organizer: organizer2._id, vendor: vendor3._id, event: event3._id, requestedItems: [{ item: 'Round Tables', quantity: 30, unit: 'units' }, { item: 'Bistro Chairs', quantity: 120, unit: 'units' }, { item: 'Folding Tent (3x3m)', quantity: 8, unit: 'units', notes: 'For outdoor vendor stalls' }], deliveryDate: new Date('2026-09-05'), eventLocation: '22 Al Ahram St, Heliopolis', status: 'Accepted', totalEstimatedCost: 15300 });
  await SourcingRequest.create({ organizer: organizer2._id, vendor: vendor2._id, event: event4._id, requestedItems: [{ item: 'Single Origin Coffee Beans (250g)', quantity: 6, unit: 'bags', notes: 'Ethiopian, Colombian, Yemeni — one of each for 2 groups' }], deliveryDate: new Date('2026-06-09'), eventLocation: '42 Mohi El Din Abu El Ezz St, Dokki', status: 'Delivered', totalEstimatedCost: 720 });

  console.log('Sourcing requests created.');

  // ── INVOICES ──
  await Invoice.create({ vendor: vendor2._id, organizer: organizer._id, event: event1._id, invoiceNumber: 'INV-2026-001', items: [{ description: 'House Blend Coffee Beans (5kg)', quantity: 5, unitPrice: 380, total: 1900 }, { description: 'Hazelnut Syrup (6 bottles)', quantity: 6, unitPrice: 85, total: 510 }, { description: 'Vanilla Syrup (6 bottles)', quantity: 6, unitPrice: 85, total: 510 }, { description: 'Oat Milk (20 cartons)', quantity: 20, unitPrice: 45, total: 900 }], totalAmount: 3820, status: 'Paid', itemizedBreakdown: 'Full delivery confirmed July 14. All items in excellent condition.', dueDate: new Date('2026-07-30') });
  await Invoice.create({ vendor: vendor3._id, organizer: organizer._id, event: event1._id, invoiceNumber: 'INV-2026-002', items: [{ description: 'Round Tables x15 (1 day)', quantity: 15, unitPrice: 150, total: 2250 }, { description: 'Bistro Chairs x60 (1 day)', quantity: 60, unitPrice: 35, total: 2100 }, { description: 'Coffee Cart x2 (1 day)', quantity: 2, unitPrice: 800, total: 1600 }], totalAmount: 5950, status: 'Approved', dueDate: new Date('2026-07-30') });
  await Invoice.create({ vendor: vendor4._id, organizer: organizer._id, event: event1._id, invoiceNumber: 'INV-2026-003', items: [{ description: 'Large Centerpieces x12', quantity: 12, unitPrice: 450, total: 5400 }, { description: 'Entrance Floral Arch x1', quantity: 1, unitPrice: 2500, total: 2500 }], totalAmount: 7900, status: 'Pending Review', dueDate: new Date('2026-07-28') });
  await Invoice.create({ vendor: vendor5._id, organizer: organizer._id, event: event1._id, invoiceNumber: 'INV-2026-004', items: [{ description: 'Full Sound & Lighting Package (1 day)', quantity: 1, unitPrice: 6000, total: 6000 }], totalAmount: 6000, status: 'Approved', dueDate: new Date('2026-07-28') });
  await Invoice.create({ vendor: vendor1._id, organizer: organizer._id, event: event1._id, invoiceNumber: 'INV-2026-005', items: [{ description: 'Assorted Croissants x15 dozen', quantity: 15, unitPrice: 180, total: 2700 }, { description: 'Specialty Cakes x5kg', quantity: 5, unitPrice: 350, total: 1750 }, { description: 'Mini Sandwiches x4 trays', quantity: 4, unitPrice: 450, total: 1800 }], totalAmount: 6250, status: 'Rejected', itemizedBreakdown: 'Invoice rejected — delivery was 2 hours late causing setup issues. Please resubmit with adjusted amount.', dueDate: new Date('2026-07-25') });
  await Invoice.create({ vendor: vendor2._id, organizer: organizer2._id, event: event4._id, invoiceNumber: 'INV-2026-006', items: [{ description: 'Single Origin Beans x6 bags', quantity: 6, unitPrice: 120, total: 720 }], totalAmount: 720, status: 'Paid', itemizedBreakdown: 'Workshop beans delivered June 9 — perfect quality.', dueDate: new Date('2026-06-20') });

  console.log('Invoices created.');

  // ── BUDGET ITEMS ──
  const budgets = [
    { event: event1._id, category: 'Venue', description: 'Zamalek Garden Terrace rental', plannedAmount: 8000, actualAmount: 8000, notes: 'Confirmed booking' },
    { event: event1._id, category: 'Coffee & Beverages', description: 'Coffee beans, syrups, milk, tea', plannedAmount: 7500, actualAmount: 6800, notes: 'Ordered from Cairo Coffee Supplies' },
    { event: event1._id, category: 'Pastries & Food', description: 'Croissants, cakes, sandwiches', plannedAmount: 6000, actualAmount: 6500, notes: 'Slightly over due to extra items' },
    { event: event1._id, category: 'Equipment Rental', description: 'Extra tables, chairs, coffee carts', plannedAmount: 4000, actualAmount: 3500, notes: 'Rented from Nile Equipment Rentals' },
    { event: event1._id, category: 'Floral & Decoration', description: 'Centerpieces, entrance arch, table decor', plannedAmount: 5000, actualAmount: 7900, notes: 'Over budget — arch was more expensive' },
    { event: event1._id, category: 'Sound & Lighting', description: 'PA system, DJ, stage lighting', plannedAmount: 6000, actualAmount: 6000, notes: 'SoundWave Productions — on budget' },
    { event: event1._id, category: 'Staff', description: 'Staff payments for the day', plannedAmount: 3000, actualAmount: 3000, notes: '' },
    { event: event1._id, category: 'Marketing', description: 'Social media ads, printing', plannedAmount: 2500, actualAmount: 1800, notes: 'Under budget' },
    { event: event1._id, category: 'Miscellaneous', description: 'Contingency fund', plannedAmount: 3000, actualAmount: 850, notes: '' },

    { event: event2._id, category: 'Venue', description: 'Maadi Riverside Loft rental', plannedAmount: 6500, actualAmount: 0, notes: 'Booking pending' },
    { event: event2._id, category: 'Coffee & Beverages', description: 'Specialty espresso supplies & equipment rental', plannedAmount: 5000, actualAmount: 0, notes: 'To be ordered' },
    { event: event2._id, category: 'Food', description: 'Gourmet bites and appetizers', plannedAmount: 4500, actualAmount: 0, notes: '' },
    { event: event2._id, category: 'DJ & Entertainment', description: 'DJ set for evening', plannedAmount: 3000, actualAmount: 0, notes: '' },
    { event: event2._id, category: 'Decoration', description: 'Sunset theme décor', plannedAmount: 2000, actualAmount: 0, notes: '' },

    { event: event3._id, category: 'Venue', description: 'Heliopolis Creative Warehouse', plannedAmount: 18000, actualAmount: 18000, notes: 'Confirmed' },
    { event: event3._id, category: 'Food & Beverages', description: 'Pastries, coffee, snacks for 300 guests', plannedAmount: 22000, actualAmount: 0, notes: 'Pending orders' },
    { event: event3._id, category: 'Equipment', description: 'Tables, chairs, tents, stands', plannedAmount: 12000, actualAmount: 0, notes: '' },
    { event: event3._id, category: 'Art Exhibition', description: 'Exhibition frames, lighting, art transport', plannedAmount: 8000, actualAmount: 0, notes: '' },
    { event: event3._id, category: 'Marketing', description: 'Ads, banners, welcome bags', plannedAmount: 7000, actualAmount: 0, notes: '' },
    { event: event3._id, category: 'Staff', description: 'All staff for full day event', plannedAmount: 8000, actualAmount: 0, notes: '' },

    { event: event4._id, category: 'Venue', description: 'Dokki Art Studio Space rental', plannedAmount: 5000, actualAmount: 5000, notes: '' },
    { event: event4._id, category: 'Coffee Supplies', description: 'Single origin beans for workshop', plannedAmount: 1000, actualAmount: 720, notes: 'Under budget' },
    { event: event4._id, category: 'Handouts & Materials', description: 'Printed brewing guides, packaging', plannedAmount: 800, actualAmount: 650, notes: '' },
    { event: event4._id, category: 'Staff', description: 'Workshop facilitator', plannedAmount: 2000, actualAmount: 2000, notes: '' },
  ];
  for (const b of budgets) await BudgetItem.create(b);
  console.log('Budget items created.');

  // ── GUESTS ──
  const guestData = [
    { guestName: 'Yasmin Ibrahim', email: 'guest@popeyez.com', phone: '+20 108 901 2345', event: event1._id, group: 'VIP', rsvpStatus: 'Attending', dietaryPreferences: ['Vegan'], allergies: ['Nuts'], qrCodeValue: 'QR-YASMIN-001', checkInStatus: true, checkedInAt: new Date('2026-07-15T12:05:00'), checkedInBy: staff2._id },
    { guestName: 'Omar Sayed', email: 'omar.sayed@email.com', phone: '+20 109 012 3456', event: event1._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-OMAR-002', checkInStatus: true, checkedInAt: new Date('2026-07-15T12:15:00'), checkedInBy: staff2._id },
    { guestName: 'Mariam Fathy', email: 'mariam.fathy@email.com', event: event1._id, group: 'Press', rsvpStatus: 'Attending', dietaryPreferences: ['Gluten Free'], allergies: ['Gluten'], qrCodeValue: 'QR-MARIAM-003', checkInStatus: true, checkedInAt: new Date('2026-07-15T12:30:00'), checkedInBy: staff2._id },
    { guestName: 'Tarek Abdallah', email: 'tarek.abdallah@email.com', event: event1._id, group: 'General', rsvpStatus: 'Attending', dietaryPreferences: ['Vegetarian'], qrCodeValue: 'QR-TAREK-004', checkInStatus: false },
    { guestName: 'Dina Mostafa', email: 'dina.mostafa@email.com', event: event1._id, group: 'VIP', rsvpStatus: 'Not Attending', specialRequirements: 'Will attend the next event!', qrCodeValue: 'QR-DINA-005', checkInStatus: false },
    { guestName: 'Hossam Rashid', email: 'hossam.rashid@email.com', event: event1._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-HOSSAM-006', checkInStatus: false },
    { guestName: 'Rania Khaled', email: 'rania.khaled@email.com', event: event1._id, group: 'General', rsvpStatus: 'Attending', dietaryPreferences: ['Dairy Free'], qrCodeValue: 'QR-RANIA-007', checkInStatus: false },
    { guestName: 'Karim Samir', email: 'karim.samir@email.com', event: event1._id, group: 'Press', rsvpStatus: 'Maybe', qrCodeValue: 'QR-KARIM-008', checkInStatus: false },
    { guestName: 'Noura Atef', email: 'noura.atef@email.com', phone: '+20 111 222 3344', event: event1._id, group: 'VIP', rsvpStatus: 'Attending', dietaryPreferences: ['Vegan', 'Gluten Free'], qrCodeValue: 'QR-NOURA-009', checkInStatus: true, checkedInAt: new Date('2026-07-15T12:50:00'), checkedInBy: staff2._id },
    { guestName: 'Bassel Younis', email: 'bassel.younis@email.com', event: event1._id, group: 'General', rsvpStatus: 'Pending', qrCodeValue: 'QR-BASSEL-010', checkInStatus: false },
    { guestName: 'Mona El Sayed', email: 'mona.elsayed@email.com', event: event1._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-MONA-011', checkInStatus: false },
    { guestName: 'Sherif Gamal', email: 'sherif.gamal@email.com', event: event1._id, group: 'Press', rsvpStatus: 'Attending', specialRequirements: 'Photography pass needed', qrCodeValue: 'QR-SHERIF-012', checkInStatus: false },
    // Event 2 guests
    { guestName: 'Salma Wael', email: 'salma.wael@email.com', event: event2._id, group: 'VIP', rsvpStatus: 'Attending', qrCodeValue: 'QR-SALMA-013', checkInStatus: false },
    { guestName: 'Adam Hosny', email: 'adam.hosny@email.com', event: event2._id, group: 'General', rsvpStatus: 'Maybe', qrCodeValue: 'QR-ADAM-014', checkInStatus: false },
    { guestName: 'Rana Farouk', email: 'rana.farouk@email.com', event: event2._id, group: 'General', rsvpStatus: 'Attending', dietaryPreferences: ['Vegetarian'], qrCodeValue: 'QR-RANA-015', checkInStatus: false },
    { guestName: 'Hassan Tawfik', email: 'hassan.tawfik@email.com', event: event2._id, group: 'VIP', rsvpStatus: 'Not Attending', specialRequirements: 'Travelling on that date', qrCodeValue: 'QR-HASSAN-016', checkInStatus: false },
    // Event 3 guests
    { guestName: 'Leila Zaki', email: 'leila.zaki@email.com', event: event3._id, group: 'Press', rsvpStatus: 'Attending', qrCodeValue: 'QR-LEILA-017', checkInStatus: false },
    { guestName: 'Fady Naguib', email: 'fady.naguib@email.com', event: event3._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-FADY-018', checkInStatus: false },
    { guestName: 'Sarah Maher', email: 'sarah.maher@email.com', event: event3._id, group: 'VIP', rsvpStatus: 'Attending', dietaryPreferences: ['Vegan'], qrCodeValue: 'QR-SARAH-019', checkInStatus: false },
    // Event 4 guests (workshop — completed)
    { guestName: 'Amira Soliman', email: 'amira.soliman@email.com', event: event4._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-AMIRA-020', checkInStatus: true, checkedInAt: new Date('2026-06-10T15:05:00'), checkedInBy: staff2._id },
    { guestName: 'Wael Ibrahim', email: 'wael.ibrahim@email.com', event: event4._id, group: 'General', rsvpStatus: 'Attending', qrCodeValue: 'QR-WAEL-021', checkInStatus: true, checkedInAt: new Date('2026-06-10T15:10:00'), checkedInBy: staff2._id },
    { guestName: 'Doaa Ramadan', email: 'doaa.ramadan@email.com', event: event4._id, group: 'General', rsvpStatus: 'Not Attending', specialRequirements: 'Cancelled last minute', qrCodeValue: 'QR-DOAA-022', checkInStatus: false },
    { guestName: 'Shady Peter', email: 'shady@popeyez.com', phone: '+20 109 777 8899', event: event1._id, group: 'VIP', rsvpStatus: 'Attending', qrCodeValue: 'QR-SHADY-023', checkInStatus: true, checkedInAt: new Date('2026-07-15T13:00:00'), checkedInBy: staff2._id },
    { guestName: 'Shady Peter', email: 'shady@popeyez.com', phone: '+20 109 777 8899', event: event3._id, group: 'Press', rsvpStatus: 'Attending', qrCodeValue: 'QR-SHADY-024', checkInStatus: false },
  ];

  const guests = [];
  for (const g of guestData) guests.push(await Guest.create(g));
  console.log('Guests created.');

  // ── INVITATIONS ──
  for (const g of guests) {
    const eventName = [event1, event2, event3, event4, event5].find(e => e._id.toString() === g.event.toString())?.name || 'PopEyez Event';
    await Invitation.create({ event: g.event, guest: g._id, message: `Dear ${g.guestName}, you are cordially invited to ${eventName}. We look forward to seeing you!`, status: g.rsvpStatus !== 'Pending' ? 'Responded' : 'Sent', sentAt: new Date('2026-06-01') });
  }
  console.log('Invitations created.');

  // ── COMMUNICATIONS ──
  const event1Guests = guests.filter(g => g.event.toString() === event1._id.toString());
  const comm1 = await Communication.create({ event: event1._id, sentBy: organizer._id, message: '🎉 Cairo Autumn Brew Café is confirmed for July 15th at Zamalek Garden Terrace! Doors open at 12 PM. We cannot wait to see you!', recipients: event1Guests.map(g => g._id), receivedBy: event1Guests.map(g => g._id), seenBy: event1Guests.slice(0, 7).map(g => g._id) });
  await Communication.create({ event: event1._id, sentBy: organizer._id, message: '⏰ Event starts in 24 hours! Arrive 15 minutes early for check-in. Bring this invite or your QR code.', recipients: event1Guests.map(g => g._id), receivedBy: event1Guests.slice(0, 10).map(g => g._id), seenBy: event1Guests.slice(0, 5).map(g => g._id) });
  await Communication.create({ event: event1._id, sentBy: organizer._id, message: '📍 Parking update: Use the north entrance on Hassan Sabry St. Parking is free for event guests.', recipients: event1Guests.slice(0, 6).map(g => g._id), receivedBy: event1Guests.slice(0, 6).map(g => g._id), seenBy: [], isFollowUp: true, followUpTo: comm1._id });
  const event2Guests = guests.filter(g => g.event.toString() === event2._id.toString());
  await Communication.create({ event: event2._id, sentBy: organizer._id, message: '✨ Maadi Sunset Espresso Night — save the date! August 20th at Maadi Riverside Loft. Cocktail dress code. Tickets will be available soon.', recipients: event2Guests.map(g => g._id), receivedBy: event2Guests.map(g => g._id), seenBy: event2Guests.slice(0, 2).map(g => g._id) });

  console.log('Communications created.');

  // ── FEEDBACK ──
  await Feedback.create({ event: event1._id, guest: guests[0]._id, overallRating: 5, foodRating: 5, venueRating: 5, organizationRating: 5, comments: 'Absolutely amazing! The coffee was world-class and the venue was breathtaking. Will attend every future event.' });
  await Feedback.create({ event: event1._id, guest: guests[1]._id, overallRating: 4, foodRating: 4, venueRating: 5, organizationRating: 4, comments: 'Great event overall. Pastries were delicious and staff very friendly. Check-in queue could be faster.' });
  await Feedback.create({ event: event1._id, guest: guests[2]._id, overallRating: 5, foodRating: 5, venueRating: 4, organizationRating: 5, comments: 'As a press member I was impressed by the professional organization and quality of offerings. Excellent event.' });
  await Feedback.create({ event: event1._id, guest: guests[5]._id, overallRating: 3, foodRating: 3, venueRating: 4, organizationRating: 3, comments: 'Decent event but wait times for coffee were long. Venue was beautiful though. Hope to see more baristas next time.' });
  await Feedback.create({ event: event1._id, guest: guests[8]._id, overallRating: 5, foodRating: 4, venueRating: 5, organizationRating: 5, comments: 'Loved the autumn theme! Centerpieces were gorgeous and the espresso was perfect. Already looking forward to the next one.' });
  await Feedback.create({ event: event4._id, guest: guests[19]._id, overallRating: 5, foodRating: 5, venueRating: 4, organizationRating: 5, comments: 'The brew workshop was incredible! Learned so much about V60 and AeroPress. Highly recommend to any coffee lover.' });
  await Feedback.create({ event: event4._id, guest: guests[20]._id, overallRating: 4, foodRating: 5, venueRating: 4, organizationRating: 4, comments: 'Really informative and the coffees we tasted were outstanding. Would love a longer session next time!' });

  console.log('Feedback created.');

  // ── LAYOUTS ──
  await Layout.create({
    event: event1._id,
    elements: [
      { id: 'el-1', type: 'entrance', label: 'Main Entrance', x: 350, y: 20, width: 100, height: 40, rotation: 0, color: '#2196F3', seats: 0 },
      { id: 'el-2', type: 'bar', label: 'Coffee Bar', x: 50, y: 80, width: 200, height: 60, rotation: 0, color: '#795548', seats: 0 },
      { id: 'el-3', type: 'equipment', label: 'Check-in Desk', x: 600, y: 20, width: 100, height: 60, rotation: 0, color: '#607D8B', seats: 0 },
      { id: 'el-4', type: 'table', label: 'Table A1', x: 50, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-5', type: 'table', label: 'Table A2', x: 180, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-6', type: 'table', label: 'Table B1', x: 310, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-7', type: 'table', label: 'Table B2', x: 440, y: 200, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-8', type: 'booth', label: 'VIP Booth 1', x: 580, y: 150, width: 120, height: 80, rotation: 0, color: '#9C27B0', seats: 6 },
      { id: 'el-9', type: 'booth', label: 'VIP Booth 2', x: 580, y: 280, width: 120, height: 80, rotation: 0, color: '#9C27B0', seats: 6 },
      { id: 'el-10', type: 'stage', label: 'Live Music Stage', x: 50, y: 420, width: 200, height: 100, rotation: 0, color: '#FF5722', seats: 0 },
      { id: 'el-11', type: 'table', label: 'Table C1', x: 310, y: 400, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-12', type: 'table', label: 'Table C2', x: 440, y: 400, width: 80, height: 80, rotation: 0, color: '#4CAF50', seats: 4 },
      { id: 'el-13', type: 'decoration', label: 'Floral Arch', x: 310, y: 20, width: 180, height: 50, rotation: 0, color: '#E91E63', seats: 0 },
      { id: 'el-14', type: 'exit', label: 'Emergency Exit', x: 680, y: 500, width: 80, height: 40, rotation: 0, color: '#F44336', seats: 0 }
    ],
    setupInstructions: '1. Coffee Bar first (needs power)\n2. Check-in Desk at entrance\n3. Tables and chairs per layout\n4. VIP Booths with premium seating\n5. Stage for live music — 3m clearance\n6. Floral arch at entrance last\nKeep emergency exit clear at all times.',
    canvasWidth: 800, canvasHeight: 600, sharedWithStaff: true
  });

  await Layout.create({
    event: event4._id,
    elements: [
      { id: 'el-1', type: 'entrance', label: 'Entrance', x: 300, y: 10, width: 100, height: 40, rotation: 0, color: '#2196F3', seats: 0 },
      { id: 'el-2', type: 'bar', label: 'Station 1 — V60', x: 50, y: 100, width: 120, height: 80, rotation: 0, color: '#795548', seats: 2 },
      { id: 'el-3', type: 'bar', label: 'Station 2 — Chemex', x: 220, y: 100, width: 120, height: 80, rotation: 0, color: '#795548', seats: 2 },
      { id: 'el-4', type: 'bar', label: 'Station 3 — AeroPress', x: 390, y: 100, width: 120, height: 80, rotation: 0, color: '#795548', seats: 2 },
      { id: 'el-5', type: 'table', label: 'Tasting Table', x: 150, y: 280, width: 300, height: 80, rotation: 0, color: '#FF9800', seats: 10 },
      { id: 'el-6', type: 'stage', label: 'Presenter Area', x: 200, y: 420, width: 200, height: 80, rotation: 0, color: '#FF5722', seats: 0 },
    ],
    setupInstructions: 'Set up 6 brewing stations (2 groups × 3 methods). Place tasting table centrally. Presenter area at the front facing students.',
    canvasWidth: 700, canvasHeight: 550, sharedWithStaff: true
  });

  console.log('Layouts created.');

  // ── NOTIFICATIONS ──
  const notifs = [
    { user: organizer._id, title: 'Booking Approved', message: 'Your booking for Zamalek Garden Terrace on July 15 has been approved!', type: 'booking', isRead: true },
    { user: organizer._id, title: 'Booking Approved — Art Fair', message: 'Heliopolis Creative Warehouse confirmed for September 5.', type: 'booking', isRead: true },
    { user: organizer._id, title: 'Invoice Paid', message: 'Invoice INV-2026-001 from Cairo Coffee Supplies has been marked as paid.', type: 'invoice', isRead: true },
    { user: organizer._id, title: 'Invoice for Review', message: 'Nour Floral Design submitted INV-2026-003 for 7,900 EGP. Please review.', type: 'invoice', isRead: false },
    { user: organizer._id, title: 'Invoice Rejected', message: "INV-2026-005 from Atwa's Bakery was rejected — late delivery. Resubmission expected.", type: 'invoice', isRead: false },
    { user: organizer._id, title: 'Budget Alert', message: 'Floral & Decoration category exceeded planned budget by 2,900 EGP for Cairo Autumn Brew Café.', type: 'general', isRead: false },
    { user: organizer._id, title: 'New RSVP', message: 'Yasmin Ibrahim confirmed attendance for Cairo Autumn Brew Café.', type: 'rsvp', isRead: true },
    { user: organizer._id, title: 'Counter Proposal', message: 'Zamalek Garden Terrace sent a counter proposal for your Dec 20 booking — Dec 19 offered instead.', type: 'booking', isRead: false },
    { user: organizer2._id, title: 'Booking Approved', message: 'Dokki Art Studio confirmed for Brew Workshop June 10.', type: 'booking', isRead: true },
    { user: organizer2._id, title: 'Sourcing Request Accepted', message: 'Nile Equipment Rentals accepted your equipment request for the Art Fair.', type: 'general', isRead: false },
    { user: staff1._id, title: 'Task Assigned', message: 'New task: Set up main entrance display for Cairo Autumn Brew Café', type: 'task', isRead: true },
    { user: staff1._id, title: 'Task Assigned', message: 'New task: Venue walkthrough for Maadi Sunset Espresso Night', type: 'task', isRead: true },
    { user: staff1._id, title: 'Task Assigned', message: 'New task: Guest list management for Maadi Sunset Espresso Night', type: 'task', isRead: false },
    { user: staff2._id, title: 'Task Assigned', message: 'New task: Prepare barista station for Cairo Autumn Brew Café', type: 'task', isRead: false },
    { user: staff2._id, title: 'Task Assigned', message: 'New task: Plan espresso master class content', type: 'task', isRead: false },
    { user: staff3._id, title: 'Task Assigned', message: 'New task: Coordinate pastry delivery for Cairo Autumn Brew Café', type: 'task', isRead: true },
    { user: staff3._id, title: 'Task Assigned', message: 'New task: Confirm vendor list for Maadi Sunset Espresso Night', type: 'task', isRead: false },
    { user: staff4._id, title: 'Task Assigned', message: 'New task: Sound system check for Cairo Autumn Brew Café', type: 'task', isRead: false },
    { user: staff4._id, title: 'Task Assigned', message: 'New task: Book DJ for Maadi Sunset Espresso Night', type: 'task', isRead: false },
    { user: vendor1._id, title: 'New Sourcing Request', message: 'Sara Hassan sent a sourcing request for pastries — Cairo Autumn Brew Café', type: 'general', isRead: true },
    { user: vendor1._id, title: 'Invoice Rejected', message: 'Your invoice INV-2026-005 was rejected due to late delivery. Please resubmit.', type: 'invoice', isRead: false },
    { user: vendor2._id, title: 'New Sourcing Request', message: 'Sara Hassan needs coffee supplies for the Autumn Brew Café event.', type: 'general', isRead: true },
    { user: vendor2._id, title: 'Invoice Paid', message: 'Your invoice INV-2026-001 for 3,820 EGP has been paid. Thank you!', type: 'invoice', isRead: true },
    { user: vendor3._id, title: 'New Sourcing Request', message: 'Equipment rental request received from Sara Hassan for July 15 event.', type: 'general', isRead: true },
    { user: vendor4._id, title: 'New Sourcing Request', message: 'Floral arrangement request received for Cairo Autumn Brew Café.', type: 'general', isRead: false },
    { user: vendor5._id, title: 'New Sourcing Request', message: 'Sound and lighting package requested for Cairo Autumn Brew Café.', type: 'general', isRead: false },
    { user: venueOwner1._id, title: 'New Booking Request', message: 'Sara Hassan requested Zamalek Garden Terrace for July 15, 2026.', type: 'booking', isRead: true },
    { user: venueOwner1._id, title: 'New Booking Request', message: 'Sara Hassan requested Zamalek Garden Terrace for December 20, 2026.', type: 'booking', isRead: false },
    { user: venueOwner2._id, title: 'New Booking Request', message: 'Sara Hassan requested Maadi Riverside Loft for August 20, 2026.', type: 'booking', isRead: false },
    { user: venueOwner2._id, title: 'New Booking Request', message: 'Rami Adel requested New Cairo Business Hub for October 15, 2026.', type: 'booking', isRead: false },
    { user: venueOwner3._id, title: 'New Booking Request', message: 'Rami Adel requested Heliopolis Creative Warehouse for September 5, 2026.', type: 'booking', isRead: true },
    { user: guestUser1._id, title: 'You\'re Invited!', message: 'You have been invited to Cairo Autumn Brew Café on July 15, 2026. Please RSVP.', type: 'rsvp', isRead: true },
    { user: guestUser2._id, title: 'You\'re Invited!', message: 'You have been invited to Cairo Autumn Brew Café on July 15, 2026 as a VIP guest. We look forward to seeing you!', type: 'rsvp', isRead: true },
    { user: guestUser2._id, title: 'You\'re Invited!', message: 'You are invited to cover the Heliopolis Coffee & Art Fair on September 5, 2026 as Press. Please confirm your attendance.', type: 'rsvp', isRead: false },
  ];
  for (const n of notifs) await Notification.create(n);
  console.log('Notifications created.');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('DEMO CREDENTIALS (password: password123)');
  console.log('═══════════════════════════════════════');
  console.log('Organizer 1:  organizer@popeyez.com');
  console.log('Organizer 2:  organizer2@popeyez.com');
  console.log('Staff 1:      staff@popeyez.com');
  console.log('Staff 2:      staff2@popeyez.com');
  console.log('Staff 3:      staff3@popeyez.com');
  console.log('Staff 4:      staff4@popeyez.com');
  console.log('Vendor 1:     vendor@popeyez.com  (Atwa\'s Bakery)');
  console.log('Vendor 2:     vendor2@popeyez.com');
  console.log('Vendor 3:     vendor3@popeyez.com');
  console.log('Vendor 4:     vendor4@popeyez.com');
  console.log('Vendor 5:     vendor5@popeyez.com');
  console.log('Venue Own 1:  venueowner@popeyez.com');
  console.log('Venue Own 2:  venueowner2@popeyez.com');
  console.log('Venue Own 3:  venueowner3@popeyez.com');
  console.log('Guest 1:      guest@popeyez.com  (Yasmin Ibrahim)');
  console.log('Guest 2:      shady@popeyez.com  (Shady Peter)');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
