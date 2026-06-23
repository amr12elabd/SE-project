import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Public
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import PublicRSVP from './pages/public/PublicRSVP';

// Shared
import Profile from './pages/shared/Profile';
import Notifications from './pages/shared/Notifications';
import NotFound from './pages/shared/NotFound';

// Organizer
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import EventsList from './pages/organizer/EventsList';
import EventForm from './pages/organizer/EventForm';
import EventDetails from './pages/organizer/EventDetails';
import VenueSearch from './pages/organizer/VenueSearch';
import BookingRequests from './pages/organizer/BookingRequests';
import Tasks from './pages/organizer/Tasks';
import StaffManagement from './pages/organizer/StaffManagement';
import BudgetManagement from './pages/organizer/BudgetManagement';
import VenueLayoutDesigner from './pages/organizer/VenueLayoutDesigner';
import VendorDirectory from './pages/organizer/VendorDirectory';
import SourcingRequests from './pages/organizer/SourcingRequests';
import InvoiceReview from './pages/organizer/InvoiceReview';
import GuestManagement from './pages/organizer/GuestManagement';
import Invitations from './pages/organizer/Invitations';
import DayOfOperations from './pages/organizer/DayOfOperations';
import Communications from './pages/organizer/Communications';
import FeedbackReview from './pages/organizer/FeedbackReview';
import Reports from './pages/organizer/Reports';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import AssignedEvents from './pages/staff/AssignedEvents';
import AssignedTasks from './pages/staff/AssignedTasks';
import SharedLayout from './pages/staff/SharedLayout';
import GuestCheckin from './pages/staff/GuestCheckin';
import VendorArrival from './pages/staff/VendorArrival';

// Vendor
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import ProductCatalogue from './pages/vendor/ProductCatalogue';
import IncomingSourcing from './pages/vendor/IncomingSourcing';
import DeliveryStatus from './pages/vendor/DeliveryStatus';
import SubmitInvoice from './pages/vendor/SubmitInvoice';
import InvoiceStatus from './pages/vendor/InvoiceStatus';

// Guest
import GuestDashboard from './pages/guest/GuestDashboard';
import GuestInvitation from './pages/guest/GuestInvitation';
import DayOfMessages from './pages/guest/DayOfMessages';
import QRCheckin from './pages/guest/QRCheckin';
import FeedbackForm from './pages/guest/FeedbackForm';

// Venue Owner
import VenueOwnerDashboard from './pages/venue/VenueOwnerDashboard';
import VenueListings from './pages/venue/VenueListings';
import VenueForm from './pages/venue/VenueForm';
import VenueBookingRequests from './pages/venue/VenueBookingRequests';
import ConfirmedBookings from './pages/venue/ConfirmedBookings';
import VenueReports from './pages/venue/VenueReports';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/rsvp/:qrCode" element={<PublicRSVP />} />

    {/* Protected - all roles */}
    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

      {/* Shared */}
      <Route path="/dashboard" element={<DashboardSwitch />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />

      {/* Organizer */}
      <Route path="/events" element={<ProtectedRoute roles={['organizer']}><EventsList /></ProtectedRoute>} />
      <Route path="/events/new" element={<ProtectedRoute roles={['organizer']}><EventForm /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute roles={['organizer']}><EventForm /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute roles={['organizer']}><EventDetails /></ProtectedRoute>} />
      <Route path="/venues" element={<ProtectedRoute roles={['organizer']}><VenueSearch /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute roles={['organizer']}><BookingRequests /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute roles={['organizer']}><Tasks /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute roles={['organizer']}><StaffManagement /></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute roles={['organizer']}><BudgetManagement /></ProtectedRoute>} />
      <Route path="/layout" element={<ProtectedRoute roles={['organizer']}><VenueLayoutDesigner /></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute roles={['organizer']}><VendorDirectory /></ProtectedRoute>} />
      <Route path="/sourcing" element={<ProtectedRoute roles={['organizer']}><SourcingRequests /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute roles={['organizer']}><InvoiceReview /></ProtectedRoute>} />
      <Route path="/guests" element={<ProtectedRoute roles={['organizer']}><GuestManagement /></ProtectedRoute>} />
      <Route path="/invitations" element={<ProtectedRoute roles={['organizer']}><Invitations /></ProtectedRoute>} />
      <Route path="/day-of" element={<ProtectedRoute roles={['organizer']}><DayOfOperations /></ProtectedRoute>} />
      <Route path="/communications" element={<ProtectedRoute roles={['organizer']}><Communications /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute roles={['organizer']}><FeedbackReview /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['organizer']}><Reports /></ProtectedRoute>} />

      {/* Staff */}
      <Route path="/my-events" element={<ProtectedRoute roles={['staff']}><AssignedEvents /></ProtectedRoute>} />
      <Route path="/my-tasks" element={<ProtectedRoute roles={['staff']}><AssignedTasks /></ProtectedRoute>} />
      <Route path="/layout-view" element={<ProtectedRoute roles={['staff']}><SharedLayout /></ProtectedRoute>} />
      <Route path="/checkin" element={<ProtectedRoute roles={['staff']}><GuestCheckin /></ProtectedRoute>} />
      <Route path="/vendor-arrivals" element={<ProtectedRoute roles={['staff']}><VendorArrival /></ProtectedRoute>} />

      {/* Vendor */}
      <Route path="/vendor/profile" element={<ProtectedRoute roles={['vendor']}><VendorProfile /></ProtectedRoute>} />
      <Route path="/vendor/catalogue" element={<ProtectedRoute roles={['vendor']}><ProductCatalogue /></ProtectedRoute>} />
      <Route path="/vendor/sourcing" element={<ProtectedRoute roles={['vendor']}><IncomingSourcing /></ProtectedRoute>} />
      <Route path="/vendor/delivery" element={<ProtectedRoute roles={['vendor']}><DeliveryStatus /></ProtectedRoute>} />
      <Route path="/vendor/submit-invoice" element={<ProtectedRoute roles={['vendor']}><SubmitInvoice /></ProtectedRoute>} />
      <Route path="/vendor/invoices" element={<ProtectedRoute roles={['vendor']}><InvoiceStatus /></ProtectedRoute>} />

      {/* Guest */}
      <Route path="/guest/invitation" element={<ProtectedRoute roles={['guest']}><GuestInvitation /></ProtectedRoute>} />
      <Route path="/guest/messages" element={<ProtectedRoute roles={['guest']}><DayOfMessages /></ProtectedRoute>} />
      <Route path="/guest/qr" element={<ProtectedRoute roles={['guest']}><QRCheckin /></ProtectedRoute>} />
      <Route path="/guest/feedback" element={<ProtectedRoute roles={['guest']}><FeedbackForm /></ProtectedRoute>} />

      {/* Venue Owner */}
      <Route path="/venue/listings" element={<ProtectedRoute roles={['venueOwner']}><VenueListings /></ProtectedRoute>} />
      <Route path="/venue/new" element={<ProtectedRoute roles={['venueOwner']}><VenueForm /></ProtectedRoute>} />
      <Route path="/venue/edit/:id" element={<ProtectedRoute roles={['venueOwner']}><VenueForm /></ProtectedRoute>} />
      <Route path="/venue/bookings" element={<ProtectedRoute roles={['venueOwner']}><VenueBookingRequests /></ProtectedRoute>} />
      <Route path="/venue/confirmed" element={<ProtectedRoute roles={['venueOwner']}><ConfirmedBookings /></ProtectedRoute>} />
      <Route path="/venue/reports" element={<ProtectedRoute roles={['venueOwner']}><VenueReports /></ProtectedRoute>} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const DashboardSwitch = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const dashboards = {
    organizer: <OrganizerDashboard />,
    staff: <StaffDashboard />,
    vendor: <VendorDashboard />,
    guest: <GuestDashboard />,
    venueOwner: <VenueOwnerDashboard />,
  };
  return dashboards[user.role] || <Navigate to="/login" />;
};

export default App;
