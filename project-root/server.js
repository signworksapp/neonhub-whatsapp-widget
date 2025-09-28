require('dotenv').config();
const express = require('express');
const cors = require('cors');
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

// Lead submission endpoint
app.post('/api/submit-lead', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing email or phone number',
      });
    }

    try {
      // Owner notification email
      const ownerEmailData = {
        from: 'NeonHub Widget <no-reply@' + process.env.MAILGUN_DOMAIN + '>',
        to: process.env.STORE_OWNER_EMAIL,
        subject: 'New WhatsApp Widget Lead',
        html: `
          <h2 style="color:#2b26fe;">📩 New Lead Captured</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <hr />
          <p style="font-size:14px;color:#555;">Lead captured from NeonHub WhatsApp Widget</p>
        `,
      };

      await mg.messages.create(process.env.MAILGUN_DOMAIN, ownerEmailData);

      // Auto-response to lead (this keeps your full template intact)
      const leadEmailData = {
        from: 'NeonHub <no-reply@' + process.env.MAILGUN_DOMAIN + '>',
        to: email,
        subject: 'Thanks for contacting NeonHub!',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color:#2b26fe;">Thanks for reaching out 🚀</h2>
            <p>We’ve received your details. One of our team members will connect with you via WhatsApp shortly.</p>
            <p><strong>Your details:</strong></p>
            <ul>
              <li>Email: ${email}</li>
              <li>Phone: ${phone}</li>
            </ul>

            <!-- Divider -->
            <div style="border-bottom: 2px solid #f0f0f0; margin: 30px 0;"></div>

            <!-- Footer -->
            <div style="text-align: center;">
              <p style="color: #2b26fe; font-weight: 600; margin: 0 0 15px 0; font-size: 16px;">
                ★ NeonHub.com – Dubai's #1 Custom LED Neon Brand
              </p>
              <p style="color: #666; font-size: 14px; margin: 0;">
                Follow us for daily inspo & customer stories:<br>
                <a href="https://neonhub.com" style="color: #2b26fe; margin: 0 8px; text-decoration: none;">Website</a>
                <a href="#" style="color: #2b26fe; margin: 0 8px; text-decoration: none;">Instagram</a>
                <a href="https://wa.me/971502528436" style="color: #2b26fe; margin: 0 8px; text-decoration: none;">WhatsApp</a>
              </p>
            </div>
          </div>
        `,
      };

      await mg.messages.create(process.env.MAILGUN_DOMAIN, leadEmailData);

    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
    }

    res.json({
      success: true,
      message: 'Lead submitted successfully',
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'NeonHub WhatsApp Widget API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      submit: '/api/submit-lead',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mailgun: !!mg,
    mailgun_domain: process.env.MAILGUN_DOMAIN || 'not_configured',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: ['/', '/health', '/api/submit-lead'],
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ✅ Important for Vercel
module.exports = app;
