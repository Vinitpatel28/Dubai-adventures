import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingNotification(booking: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials missing. Skipping email notification.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dubai-adventures.com';

  const mailOptions = {
    from: `"DXB Adventures | Alerts" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `[NEW] ${booking.bookingId} - ${booking.activityTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #111; padding: 30px; background: #070707; color: #fff;">
        <h2 style="color: #D4962A; text-transform: uppercase; letter-spacing: 2px;">New Reservation Alert</h2>
        <p style="color: #999; font-size: 14px;">A new luxury experience has been confirmed on the registry.</p>
        <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;"/>
        <table style="width: 100%;">
          <tr><td style="color: #666; font-size: 12px; padding: 5px 0;">REF:</td><td style="font-weight: bold;">${booking.bookingId}</td></tr>
          <tr><td style="color: #666; font-size: 12px; padding: 5px 0;">EXPERIENCE:</td><td style="font-weight: bold;">${booking.activityTitle}</td></tr>
          <tr><td style="color: #666; font-size: 12px; padding: 5px 0;">GUEST:</td><td style="font-weight: bold;">${booking.fullName}</td></tr>
          <tr><td style="color: #666; font-size: 12px; padding: 5px 0;">DATE:</td><td style="font-weight: bold;">${new Date(booking.date).toDateString()}</td></tr>
          <tr><td style="color: #666; font-size: 12px; padding: 5px 0;">TOTAL:</td><td style="font-weight: bold; color: #D4962A;">AED ${booking.totalPrice.toLocaleString()}</td></tr>
        </table>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.ADMIN_APP_URL || 'http://localhost:3001'}/dashboard/bookings" 
             style="background: #D4962A; color: #000; padding: 12px 25px; text-decoration: none; font-weight: 900; border-radius: 4px; font-size: 12px; display: inline-block;">
             OPEN OPERATIONAL DASHBOARD
          </a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking notification sent for ${booking.bookingId}`);
  } catch (error) {
    console.error('Failed to send booking notification email:', error);
  }
}

// ── CUSTOMER VOUCHER EMAIL ──
export async function sendVoucherToCustomer(booking: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const mailOptions = {
    from: `"Dubai Adventures" <${process.env.SMTP_USER}>`,
    to: booking.email,
    subject: `Your Dubai Adventure Ticket: ${booking.bookingId}`,
    html: `
      <div style="background: #000; padding: 40px 20px; font-family: 'Helvetica', sans-serif; color: #fff; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #111, #000);">
            <div style="color: #D4962A; text-transform: uppercase; letter-spacing: 5px; font-size: 12px; font-weight: 900; margin-bottom: 20px;">
              Premium Choice
            </div>
            <h1 style="font-size: 28px; font-weight: 300; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              Your Adventure is <span style="color: #D4962A;">Confirmed</span>
            </h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px;">
            <p style="color: #ccc; text-align: center; margin-bottom: 40px;">
              Greetings ${booking.fullName.split(' ')[0]},<br/>
              Your luxury experience in Dubai is ready for departure. We've reserved your place for <strong>${booking.activityTitle}</strong>.
            </p>

            <!-- Voucher Box -->
            <div style="padding: 30px; background: #111; border: 1px solid #222; border-radius: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                 <div style="width: 50%;">
                    <span style="color: #666; font-size: 10px; text-transform: uppercase; tracking: 1px;">Booking ID</span><br/>
                    <strong style="color: #D4962A;">${booking.bookingId}</strong>
                 </div>
                 <div style="width: 50%; text-align: right;">
                    <span style="color: #666; font-size: 10px; text-transform: uppercase; tracking: 1px;">Status</span><br/>
                    <strong style="color: #22c55e;">CONFIRMED</strong>
                 </div>
              </div>
              <hr style="border: none; border-top: 1px solid #222; margin: 15px 0;"/>
              <table style="width: 100%; border-spacing: 0;">
                <tr>
                  <td style="padding: 10px 0; color: #999; font-size: 13px;">Experience</td>
                  <td style="text-align: right; font-weight: bold;">${booking.activityTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #999; font-size: 13px;">Date</td>
                  <td style="text-align: right; font-weight: bold;">${new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #999; font-size: 13px;">Departure</td>
                  <td style="text-align: right; font-weight: bold;">${booking.timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #999; font-size: 13px;">Party Size</td>
                  <td style="text-align: right; font-weight: bold;">${booking.adults} Adults ${booking.children ? `· ${booking.children} Children` : ""}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 40px; text-align: center;">
              <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Please have your digital booking Reference ready upon arrival at the meeting point.</p>
              <div style="padding: 20px; border: 1px dashed #333; border-radius: 12px; display: inline-block;">
                 <span style="color: #D4962A; font-family: monospace; font-size: 18px; font-weight: 900; letter-spacing: 2px;">VOUCHER-${booking.bookingId}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 40px; background: #050505; text-align: center; border-top: 1px solid #111;">
            <p style="color: #444; font-size: 11px; margin: 0;">
              Dubai Adventures LLC · Premium Desert Services · United Arab Emirates<br/>
              Support: concierge@dubai-adventures.com
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Customer email failed:', err);
  }
}

export async function sendNewsletterAdminAlert(subscriber: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dubai-adventures.com';

  const mailOptions = {
    from: `"DXB | Inner Circle" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `[LEAD] New Newsletter Subscriber: ${subscriber.email}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 30px; background: #070707; color: #fff; border: 1px solid #D4962A;">
        <h2 style="color: #D4962A; text-transform: uppercase; font-size: 18px;">New Lead Captured</h2>
        <p style="color: #999;">A new guest has requested to join the Elite Circle.</p>
        <div style="padding: 20px; background: #111; border-radius: 8px; margin-top: 20px;">
          <span style="color: #666; font-size: 10px;">EMAIL ADDRESS</span><br/>
          <strong style="font-size: 16px;">${subscriber.email}</strong>
        </div>
        <p style="font-size: 12px; color: #444; margin-top: 30px;">Dubai Adventures Concierge Engine v4.2</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Admin Newsletter Alert Error:', err);
  }
}

export async function sendNewsletterWelcomeEmail(email: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const mailOptions = {
    from: `"Dubai Adventures" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to the Inner Circle - Dubai Adventures`,
    html: `
      <div style="background: #000; padding: 40px 20px; font-family: 'Helvetica', sans-serif; color: #fff; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 24px; overflow: hidden; text-align: center;">
          <div style="padding: 60px 40px;">
            <div style="color: #D4962A; text-transform: uppercase; letter-spacing: 5px; font-size: 12px; font-weight: 900; margin-bottom: 30px;">
              Elite Circle Access
            </div>
            <h1 style="font-size: 32px; font-weight: 300; margin: 0 0 20px 0; letter-spacing: -0.5px; line-height: 1.2;">
              The Secrets of Dubai <br /><span style="color: #D4962A;">Are Now Yours.</span>
            </h1>
            <p style="color: #999; font-size: 15px; margin-bottom: 40px; max-width: 400px; margin-left: auto; margin-right: auto;">
              Thank you for joining our exclusive registry. As a member of the Inner Circle, you will be the first to receive private early-access to new adventures and bespoke seasonal guides.
            </p>
            <div style="height: 1px; background: linear-gradient(90deg, transparent, #222, transparent); margin: 40px 0;"></div>
            <p style="color: #666; font-size: 12px; font-style: italic;">"Not all who wander are lost, but those who wander with us find the extraordinary."</p>
          </div>
          <div style="padding: 40px; background: #050505; border-top: 1px solid #111;">
            <p style="color: #444; font-size: 11px; margin: 0;">You are receiving this because you subscribed to Dubai Adventures.<br/>To exit the circle, simply reply "Unsubscribe".</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Customer Welcome Email Error:', err);
  }
}
