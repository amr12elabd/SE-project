import { useState, useEffect } from 'react';

const TOURS = {
  organizer: [
    { title: '👋 Welcome to PopEyez!', body: 'You\'re logged in as an Event Organizer. This quick tour will show you the key features to manage your pop-up café events like a pro. Let\'s go!', icon: '☕' },
    { title: '📅 Create Your First Event', body: 'Start by going to Events → Create Event. Fill in your event name, date, time, expected guests, dress code, and agenda. You can create multiple events and manage them all from here.', icon: '🎉' },
    { title: '🏛️ Book a Venue', body: 'Visit Venue Search to browse available spaces. Filter by area, capacity, and price. Found the perfect venue? Submit a booking request — the venue owner will respond within 24 hours.', icon: '📍' },
    { title: '👥 Manage Staff & Tasks', body: 'Assign staff members to your event under Staff Management. Then create tasks under Tasks & Workflow and assign them to specific staff with priorities and deadlines.', icon: '✅' },
    { title: '🚚 Source Vendors', body: 'Browse the Vendor Directory to find pastry suppliers, coffee equipment, florists, and more. Send sourcing requests directly from each vendor profile.', icon: '🛒' },
    { title: '📊 Track Budget & Reports', body: 'Budget Management lets you plan and track all expenses. Reports & Analytics gives you real-time charts on attendance, financials, task completion, and guest feedback.', icon: '💰' },
    { title: '🎟️ Invite Guests', body: 'Add guests under Guest Management, then send invitations. Each guest gets a unique QR code for check-in. You can send mass communications to all attendees.', icon: '✉️' },
    { title: '🌟 You\'re Ready!', body: 'You now know the essentials. Explore the sidebar to discover all features. Need help? Check the README or contact your administrator. Happy organizing!', icon: '🚀' },
  ],
  staff: [
    { title: '👋 Welcome, Staff Member!', body: 'You\'re logged in as a Staff Member. This tour will walk you through your key responsibilities for event day. Let\'s get started!', icon: '🧑‍💼' },
    { title: '📋 Your Assigned Tasks', body: 'Head to My Tasks to see all tasks assigned to you. Each task has a priority level (High/Medium/Low), a due date, and a status. Update your task status as you complete each one.', icon: '✅' },
    { title: '📅 Your Events', body: 'My Events shows all events you\'ve been assigned to. You can see event details, dates, and status. You can also update an event\'s status on the day (e.g., Upcoming → In Progress → Completed).', icon: '🎪' },
    { title: '🗺️ Venue Layout', body: 'Venue Layout shows the floor plan your organizer has designed. Use it to understand where tables, stations, entrances, and key areas are located before event day.', icon: '🗺️' },
    { title: '🎟️ Guest Check-In', body: 'On event day, use Guest Check-In to scan QR codes or search guest names. Check guests in with one tap — their RSVP is automatically set to Attending. Track live attendance numbers.', icon: '📲' },
    { title: '🚛 Vendor Arrivals', body: 'Vendor Arrivals lets you mark when each vendor has arrived and delivered their items. Keep this updated so the organizer can track supply deliveries in real-time.', icon: '🚚' },
    { title: '🌟 You\'re Ready!', body: 'You know your key tools! Always keep your tasks updated, check in guests promptly, and communicate any issues to your organizer immediately. Have a great event!', icon: '🚀' },
  ],
  vendor: [
    { title: '👋 Welcome, Vendor!', body: 'You\'re logged in as a Vendor/Supplier. This tour will show you how to manage your profile, respond to sourcing requests, and submit invoices. Let\'s go!', icon: '🏪' },
    { title: '👤 Set Up Your Profile', body: 'First, complete your Vendor Profile. Add your company name, supplies offered, pricing list, delivery regions, lead time, and contact info. A complete profile gets more sourcing requests!', icon: '📝' },
    { title: '📦 Your Product Catalogue', body: 'Product Catalogue lets you showcase your full inventory with photos, descriptions, and prices. Keep this updated to help organizers understand what you offer.', icon: '🛍️' },
    { title: '📥 Incoming Sourcing Requests', body: 'When an organizer needs your products, you\'ll receive a Sourcing Request. Review the items needed, quantity, and delivery date. You can Accept, Decline, or send a clarification note.', icon: '📨' },
    { title: '🚚 Delivery Status', body: 'Once you accept a request, update your delivery status as you prepare and ship items. Keep it current — organizers rely on this to plan their event day.', icon: '📦' },
    { title: '🧾 Submit Invoices', body: 'After delivery, submit an invoice through Submit Invoice. The organizer will review and approve or request changes. Once approved, payment is processed.', icon: '💳' },
    { title: '🌟 You\'re Ready!', body: 'Your account is set up for success! Keep your profile updated, respond to requests quickly, and maintain your delivery ratings. Good luck!', icon: '🚀' },
  ],
  guest: [
    { title: '👋 Welcome to PopEyez!', body: 'You\'re a Guest at an upcoming pop-up café event. This quick tour will show you how to use your account to RSVP, get your QR code, and stay informed.', icon: '🎉' },
    { title: '✉️ Your Invitations', body: 'Visit My Invitations to see all events you\'ve been invited to. Each invitation shows event details, date, venue, and your current RSVP status. Confirm your attendance here!', icon: '📩' },
    { title: '📱 Your QR Code', body: 'Once you RSVP as Attending, your unique QR code is generated. Show it to staff at the event entrance for instant check-in. You can find it under My QR Code.', icon: '📲' },
    { title: '💬 Day-of Messages', body: 'On event day, check Day-of Messages for real-time updates from the organizer — parking info, schedule changes, special announcements, and more.', icon: '📢' },
    { title: '⭐ Share Your Feedback', body: 'After the event, share your experience through Feedback. Your ratings help organizers improve future events. We read every review!', icon: '⭐' },
    { title: '🌟 Enjoy the Event!', body: 'That\'s it! RSVP, show your QR code at the door, enjoy the coffee and ambiance, and share your feedback afterwards. See you there!', icon: '☕' },
  ],
  venueOwner: [
    { title: '👋 Welcome, Venue Owner!', body: 'You\'re logged in as a Venue Owner. This tour will guide you through listing your venues, managing booking requests, and tracking your venue performance.', icon: '🏛️' },
    { title: '🏢 List Your Venues', body: 'Go to My Venues to add all your available spaces. For each venue, provide photos, capacity, amenities, dimensions, and pricing (per hour and per day). A rich profile attracts more bookings!', icon: '📸' },
    { title: '📥 Booking Requests', body: 'When an organizer wants to book your venue, you\'ll see a new Booking Request. Review the event details, expected attendees, special requirements, and respond promptly.', icon: '📨' },
    { title: '✅ Approve, Decline, or Counter', body: 'You can Approve a booking as-is, Decline with a message, or send a Counter Proposal with an alternative date or price. Organizers can accept or counter back — it\'s a full negotiation flow!', icon: '🤝' },
    { title: '📆 Confirmed Bookings', body: 'Confirmed Bookings shows all approved reservations. You can track event status and see which events are upcoming, in progress, or completed.', icon: '✔️' },
    { title: '📊 Venue Reports', body: 'Venue Reports shows your booking history, revenue trends, and occupancy rates. Use this data to optimize your pricing and availability calendar.', icon: '📈' },
    { title: '🌟 You\'re Ready!', body: 'Your venues are ready to receive bookings! Respond promptly to requests, keep your listings updated with accurate availability, and grow your reputation on PopEyez.', icon: '🚀' },
  ],
};

const OnboardingTour = ({ role }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const steps = TOURS[role] || [];

  useEffect(() => {
    const key = `popeyez_tour_${role}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => setVisible(true), 800);
    }
  }, [role]);

  const dismiss = () => {
    localStorage.setItem(`popeyez_tour_${role}`, 'done');
    setVisible(false);
  };

  if (!visible || steps.length === 0) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease' }}>
        {/* Progress bar */}
        <div style={{ height: 4, background: '#e2e8f0' }}>
          <div style={{ height: '100%', background: 'var(--primary)', width: `${((step + 1) / steps.length) * 100}%`, transition: 'width 0.4s ease', borderRadius: 2 }} />
        </div>

        {/* Content */}
        <div style={{ padding: 36 }}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>{current.icon}</div>
          <h2 style={{ margin: '0 0 12px', color: '#1a202c', textAlign: 'center', fontSize: 20 }}>{current.title}</h2>
          <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7, textAlign: 'center', fontSize: 14 }}>{current.body}</p>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{step + 1} of {steps.length}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={dismiss} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, padding: '8px 12px' }}>Skip tour</button>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
            )}
            <button onClick={() => isLast ? dismiss() : setStep(s => s + 1)}
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              {isLast ? '🚀 Get Started' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 20 }}>
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 4, background: i === step ? 'var(--primary)' : '#e2e8f0', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
