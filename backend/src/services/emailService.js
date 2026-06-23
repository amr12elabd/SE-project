const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  // Fallback: log emails to console in development (no real SMTP needed)
  return null;
};

const logoHtml = `<div style="background:#1a6b5c;padding:20px 32px;border-radius:10px 10px 0 0;">
  <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">☕ PopEyez</span>
</div>`;

const wrapHtml = (title, body) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:32px auto;">
  ${logoHtml}
  <div style="background:#fff;padding:32px;border-radius:0 0 10px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    <h2 style="color:#1a6b5c;margin-top:0;">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">PopEyez — Pop-Up Café Event Management Platform<br>This is an automated notification. Please do not reply to this email.</p>
  </div>
</div></body></html>`;

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: `"PopEyez" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
  }
};

const emailService = {
  bookingStatusUpdate: async ({ organizerEmail, organizerName, venueName, eventName, date, status, ownerMessage, counterProposal }) => {
    const statusColors = { Approved: '#38a169', Declined: '#e53e3e', 'Counter-Proposed': '#dd6b20', Pending: '#3182ce' };
    const color = statusColors[status] || '#1a6b5c';
    const body = `
      <p>Hi <strong>${organizerName}</strong>,</p>
      <p>Your booking request for <strong>${venueName}</strong>${eventName ? ` (Event: ${eventName})` : ''} on <strong>${new Date(date).toDateString()}</strong> has been updated.</p>
      <div style="background:#f8fafc;border-left:4px solid ${color};padding:16px;border-radius:4px;margin:20px 0;">
        <strong style="color:${color};font-size:16px;">Status: ${status}</strong>
        ${ownerMessage ? `<p style="margin:10px 0 0;">${ownerMessage}</p>` : ''}
        ${counterProposal?.notes ? `<p style="margin:10px 0 0;"><strong>Counter Proposal:</strong> ${counterProposal.date ? `Date: ${new Date(counterProposal.date).toDateString()}` : ''} ${counterProposal.price ? `| Price: ${counterProposal.price} EGP` : ''} | ${counterProposal.notes}</p>` : ''}
      </div>
      <p>Log in to <strong>PopEyez</strong> to respond to this update.</p>`;
    await sendEmail({ to: organizerEmail, subject: `Booking ${status} — ${venueName} | PopEyez`, html: wrapHtml(`Booking ${status}`, body) });
  },

  taskAssigned: async ({ staffEmail, staffName, taskTitle, taskDescription, eventName, dueDate, priority }) => {
    const priorityColors = { High: '#e53e3e', Medium: '#dd6b20', Low: '#38a169' };
    const body = `
      <p>Hi <strong>${staffName}</strong>,</p>
      <p>You have been assigned a new task for <strong>${eventName}</strong>.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:8px;margin:20px 0;">
        <h3 style="margin:0 0 8px;color:#1a202c;">${taskTitle}</h3>
        ${taskDescription ? `<p style="margin:0 0 12px;color:#64748b;">${taskDescription}</p>` : ''}
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          ${dueDate ? `<span style="font-size:13px;">📅 Due: <strong>${new Date(dueDate).toDateString()}</strong></span>` : ''}
          ${priority ? `<span style="font-size:13px;color:${priorityColors[priority] || '#64748b'};">⚡ Priority: <strong>${priority}</strong></span>` : ''}
        </div>
      </div>
      <p>Log in to PopEyez to view the task details and update your progress.</p>`;
    await sendEmail({ to: staffEmail, subject: `New Task: ${taskTitle} | PopEyez`, html: wrapHtml('New Task Assigned', body) });
  },

  guestInvitation: async ({ guestEmail, guestName, eventName, eventDate, startTime, venueName, venueLocation, organizerName, qrCodeValue }) => {
    const body = `
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>You have been cordially invited to attend <strong>${eventName}</strong> — a curated pop-up café experience by <strong>${organizerName}</strong>.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">☕</div>
        <h3 style="margin:0 0 12px;color:#1a6b5c;">${eventName}</h3>
        <p style="margin:4px 0;color:#374151;">📅 ${new Date(eventDate).toDateString()}${startTime ? ` at ${startTime}` : ''}</p>
        ${venueName ? `<p style="margin:4px 0;color:#374151;">🏛️ ${venueName}${venueLocation ? `, ${venueLocation}` : ''}</p>` : ''}
      </div>
      ${qrCodeValue ? `<p style="text-align:center;color:#64748b;font-size:13px;">Your QR code for check-in: <strong>${qrCodeValue}</strong><br>Please bring this code to the event for quick entry.</p>` : ''}
      <p>Please log in to your PopEyez account to confirm your attendance (RSVP).</p>`;
    await sendEmail({ to: guestEmail, subject: `You're Invited: ${eventName} | PopEyez`, html: wrapHtml(`You're Invited to ${eventName}!`, body) });
  },

  vendorCounterProposalResponse: async ({ venueOwnerEmail, venueName, organizerName, accepted, eventDate }) => {
    const body = `
      <p>The organizer <strong>${organizerName}</strong> has <strong style="color:${accepted ? '#38a169' : '#e53e3e'};">${accepted ? 'accepted' : 'declined'}</strong> your counter proposal for a booking on <strong>${new Date(eventDate).toDateString()}</strong> at <strong>${venueName}</strong>.</p>
      ${accepted ? '<p style="color:#38a169;">🎉 The booking is now confirmed. Please prepare the venue accordingly.</p>' : '<p>The booking has been declined. The organizer may submit a new request in the future.</p>'}
      <p>Log in to PopEyez to view the booking details.</p>`;
    await sendEmail({ to: venueOwnerEmail, subject: `Counter Proposal ${accepted ? 'Accepted' : 'Declined'} — ${venueName} | PopEyez`, html: wrapHtml(`Counter Proposal ${accepted ? 'Accepted ✓' : 'Declined'}`, body) });
  },

  invoiceStatusUpdate: async ({ vendorEmail, vendorName, invoiceNumber, amount, status, eventName, message }) => {
    const statusColors = { Paid: '#38a169', Approved: '#3182ce', Rejected: '#e53e3e', 'Pending Review': '#dd6b20' };
    const color = statusColors[status] || '#64748b';
    const body = `
      <p>Hi <strong>${vendorName}</strong>,</p>
      <p>Your invoice <strong>${invoiceNumber}</strong> for <strong>${eventName}</strong> has been updated.</p>
      <div style="background:#f8fafc;border-left:4px solid ${color};padding:16px;border-radius:4px;margin:20px 0;">
        <p style="margin:0;"><strong style="color:${color};">Status: ${status}</strong></p>
        <p style="margin:8px 0 0;">Amount: <strong>${amount?.toLocaleString()} EGP</strong></p>
        ${message ? `<p style="margin:8px 0 0;">${message}</p>` : ''}
      </div>`;
    await sendEmail({ to: vendorEmail, subject: `Invoice ${status} — ${invoiceNumber} | PopEyez`, html: wrapHtml(`Invoice ${status}`, body) });
  },
};

module.exports = emailService;
