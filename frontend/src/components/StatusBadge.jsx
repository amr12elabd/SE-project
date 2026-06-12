const statusMap = {
  // Task statuses
  'Not Assigned': 'badge-muted',
  'Pending': 'badge-warning',
  'In Progress': 'badge-info',
  'Done': 'badge-success',
  // Booking / general
  'Approved': 'badge-success',
  'Declined': 'badge-danger',
  'Counter-Proposed': 'badge-warning',
  // Sourcing
  'Accepted': 'badge-success',
  'Preparing': 'badge-info',
  'Out for Delivery': 'badge-warning',
  'Delivered': 'badge-success',
  // Invoices
  'Pending Review': 'badge-warning',
  'Rejected': 'badge-danger',
  'Paid': 'badge-primary',
  // RSVP
  'Attending': 'badge-success',
  'Not Attending': 'badge-danger',
  'Maybe': 'badge-warning',
  // Events
  'Planning': 'badge-info',
  'Confirmed': 'badge-primary',
  'Completed': 'badge-success',
  'Cancelled': 'badge-danger',
  // Invitation
  'Sent': 'badge-info',
  'Viewed': 'badge-warning',
  'Responded': 'badge-success',
  // Feedback sentiment
  'Positive': 'badge-success',
  'Neutral': 'badge-warning',
  'Negative': 'badge-danger',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${statusMap[status] || 'badge-muted'}`}>{status}</span>
);

export default StatusBadge;
