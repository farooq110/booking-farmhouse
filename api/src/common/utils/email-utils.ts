import nodemailer from "nodemailer"
import { Booking } from "../../models/booking.model"

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

const getTransporter = () => {
  const mailUser = process.env.MAIL_USER
  const mailAppPassword = process.env.MAIL_APP_PASSWORD

  if (!mailUser || !mailAppPassword) {
    console.warn("SMTP credentials (MAIL_USER / MAIL_APP_PASSWORD) are not configured. Skipping email delivery.")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailUser,
      pass: mailAppPassword,
    },
  })
}

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  const transporter = getTransporter()
  if (!transporter) return

  const mailUser = process.env.MAIL_USER
  try {
    const info = await transporter.sendMail({
      from: mailUser,
      to,
      subject,
      html: htmlContent,
    })
    console.log(`Email successfully sent: ${info.messageId}`)
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}

const getBaseTemplate = (title: string, accentColor: string, contentHtml: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #e2e8f0;
      background-color: #080c0a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #080c0a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #121815;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid #1d2822;
      border-top: 5px solid ${accentColor};
    }
    .header {
      padding: 40px 30px 20px 30px;
      text-align: center;
    }
    .header h1 {
      font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
      color: ${accentColor};
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .content {
      padding: 20px 40px 40px 40px;
    }
    .content p {
      font-size: 15px;
      color: #94a3b8;
    }
    .content strong {
      color: #ffffff;
    }
    .booking-card {
      background-color: #080c0a;
      border: 1px solid #1d2822;
      border-radius: 8px;
      padding: 24px;
      margin: 30px 0;
    }
    .booking-title {
      font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 20px;
      border-bottom: 1px solid #1d2822;
      padding-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
      font-size: 14px;
      text-align: left;
      padding: 6px 0;
    }
    .detail-value {
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      text-align: right;
      padding: 6px 0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      font-size: 12px;
      color: #475569;
      border-top: 1px solid #1d2822;
      background-color: #0d1210;
    }
    .reason-box {
      background-color: #1a0f0e;
      border-left: 4px solid #d93829;
      padding: 18px;
      border-radius: 0 8px 8px 0;
      margin: 25px 0;
      color: #e2e8f0;
      font-size: 14px;
      border-top: 1px solid #1d2822;
      border-right: 1px solid #1d2822;
      border-bottom: 1px solid #1d2822;
    }
    .reason-title {
      font-family: 'Barlow Condensed', sans-serif;
      color: #d93829;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        This is an automated message regarding your Elixir Arena booking.<br>
        &copy; ${new Date().getFullYear()} Elixir Arena. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`

export const sendBookingPendingEmail = async (booking: Booking, serviceName: string) => {
  if (!booking.customer.email) return

  const subject = `Booking Pending Review: ${serviceName}`
  const content = `
    <p>Hi <strong>${booking.customer.name}</strong>,</p>
    <p>Thank you for submitting your booking request. Our team is currently reviewing your requested slot. We will notify you as soon as the booking is confirmed.</p>
    
    <div class="booking-card">
      <div class="booking-title">Appointment Summary</div>
      <table class="detail-table">
        <tr>
          <td class="detail-label">Service</td>
          <td class="detail-value">${serviceName}</td>
        </tr>
        <tr>
          <td class="detail-label">Date</td>
          <td class="detail-value">${booking.date}</td>
        </tr>
        <tr>
          <td class="detail-label">Time Slot</td>
          <td class="detail-value">${booking.slot.start} - ${booking.slot.end}</td>
        </tr>
        <tr>
          <td class="detail-label">Amount</td>
          <td class="detail-value">${formatMoney(booking.price_charged, booking.currency)}</td>
        </tr>
      </table>
    </div>
    
    <p>If you need to make any changes or have questions, please reach out to us directly.</p>
  `

  const html = getBaseTemplate("Booking Request Received", "#fbbf24", content)
  await sendEmail(booking.customer.email, subject, html)
}

export const sendBookingConfirmedEmail = async (booking: Booking, serviceName: string) => {
  if (!booking.customer.email) return

  const subject = `Booking Confirmed: ${serviceName}`
  const content = `
    <p>Hi <strong>${booking.customer.name}</strong>,</p>
    <p>Great news! Your booking has been officially confirmed. We look forward to seeing you at your scheduled time.</p>
    
    <div class="booking-card">
      <div class="booking-title">Booking Details</div>
      <table class="detail-table">
        <tr>
          <td class="detail-label">Service</td>
          <td class="detail-value">${serviceName}</td>
        </tr>
        <tr>
          <td class="detail-label">Date</td>
          <td class="detail-value">${booking.date}</td>
        </tr>
        <tr>
          <td class="detail-label">Time Slot</td>
          <td class="detail-value">${booking.slot.start} - ${booking.slot.end}</td>
        </tr>
        <tr>
          <td class="detail-label">Amount</td>
          <td class="detail-value">${formatMoney(booking.price_charged, booking.currency)}</td>
        </tr>
      </table>
    </div>
    
    <p>Please make sure to arrive on time. Thank you for choosing us!</p>
  `

  const html = getBaseTemplate("Booking Confirmed!", "#ccff00", content)
  await sendEmail(booking.customer.email, subject, html)
}

export const sendBookingCancelledEmail = async (booking: Booking, serviceName: string, reason?: string) => {
  if (!booking.customer.email) return

  const subject = `Booking Cancelled: ${serviceName}`
  const reasonHtml = reason
    ? `<div class="reason-box">
        <div class="reason-title">Reason for cancellation</div>
        <div>${reason}</div>
       </div>`
    : ""

  const content = `
    <p>Hi <strong>${booking.customer.name}</strong>,</p>
    <p>We regret to inform you that your booking has been cancelled.</p>
    
    ${reasonHtml}
    
    <div class="booking-card">
      <div class="booking-title">Cancelled Appointment</div>
      <table class="detail-table">
        <tr>
          <td class="detail-label">Service</td>
          <td class="detail-value">${serviceName}</td>
        </tr>
        <tr>
          <td class="detail-label">Date</td>
          <td class="detail-value">${booking.date}</td>
        </tr>
        <tr>
          <td class="detail-label">Time Slot</td>
          <td class="detail-value">${booking.slot.start} - ${booking.slot.end}</td>
        </tr>
      </table>
    </div>
    
    <p>If you believe this is in error, or if you would like to reschedule, please feel free to book a new appointment or contact us.</p>
  `

  const html = getBaseTemplate("Booking Cancelled", "#d93829", content)
  await sendEmail(booking.customer.email, subject, html)
}
