const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with error handling
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Mailgun setup with better error handling
let mg;
try {
  const formData = require('form-data');
  const Mailgun = require('mailgun.js');
  const mailgun = new Mailgun(formData);

  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY
    });
    console.log('📧 Mailgun configured: Yes');
    console.log('📨 Domain:', process.env.MAILGUN_DOMAIN);
  } else {
    console.log('📧 Mailgun configured: No (missing API key or domain)');
    console.log('📧 Available env vars:', Object.keys(process.env).filter(key => key.includes('MAILGUN')));
  }
} catch (error) {
  console.error('❌ Mailgun initialization failed:', error.message);
  mg = null;
}

console.log('📨 Notification emails: notifications@neonhub.com → info@neonhub.com');

// API endpoint for lead submission
app.post('/api/submit-lead', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and phone are required' 
      });
    }

    console.log('📝 New lead received:', { email, phone });

    // Send email notification if Mailgun is configured
    if (mg) {
      try {
        const emailData = {
          from: 'NeonHub Notifications <notifications@neonhub.com>',
          to: 'info@neonhub.com',
          subject: `New WhatsApp Lead - ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">🔔 New WhatsApp Lead</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Lead captured from NeonHub website</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
                <h3 style="color: #333; margin-top: 0;">Customer Details:</h3>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #555; width: 100px;">📧 Email:</td>
                      <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #25D366; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #555;">📱 Phone:</td>
                      <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #25D366; text-decoration: none;">${phone}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #555;">⏰ Time:</td>
                      <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" 
                     style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-weight: bold; 
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">
                    💬 Start WhatsApp Chat
                  </a>
                </div>
                
                <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 30px;">
                  <p style="color: #888; font-size: 14px; margin: 0; text-align: center;">
                    <strong>Next Steps:</strong><br>
                    1. Reply to <strong>${email}</strong> with project details<br>
                    2. Or click the WhatsApp button above to start chatting<br>
                    3. Follow up within 24 hours for best conversion
                  </p>
                </div>
              </div>
            </div>
          `
        };

        console.log('📧 Sending notification to info@neonhub.com...');
        const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
        console.log('✅ Notification email sent:', result.id);

        // Send welcome email to the lead
        const leadEmailData = {
          from: 'NeonHub <info@neonhub.com>',
          to: email,
          subject: '★ NeonHub – Custom Neon Signs That Light Up Your World',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
              
              <!-- Header with Logo -->
              <div style="background: #2b26fe; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <img src="https://cdn.shopify.com/s/files/1/0466/1352/8731/files/30_2.png?v=1758872534" alt="NeonHub" style="max-width: 200px; height: auto; margin-bottom: 15px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Custom Neon Signs That Light Up Your World</h1>
              </div>
              
              <!-- Main Content -->
              <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.08);">
                
                <!-- Divider -->
                <div style="border-bottom: 2px solid #f0f0f0; margin-bottom: 25px;"></div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                  Hi there!
                </p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 25px 0;">
                  Thanks for reaching out to NeonHub.com! Our design team has received your request and will connect with you on WhatsApp within 2 hours.
                </p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0; font-weight: 600;">
                  Here's what happens next:
                </p>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2b26fe;">
                  <p style="color: #333; margin: 0 0 12px 0; line-height: 1.6;">✓ We'll discuss your design ideas, size, and color preferences</p>
                  <p style="color: #333; margin: 0 0 12px 0; line-height: 1.6;">✓ You'll receive a custom quote + design mockup</p>
                  <p style="color: #333; margin: 0; line-height: 1.6;">✓ Production begins once you're 100% happy with the design</p>
                </div>
                
                <!-- Divider -->
                <div style="border-bottom: 2px solid #f0f0f0; margin: 30px 0;"></div>
                
                <h3 style="color: #2b26fe; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">▶ Why choose NeonHub?</h3>
                
                <div style="margin: 20px 0;">
                  <p style="color: #333; margin: 0 0 8px 0; line-height: 1.6;">• <strong>Fast Delivery:</strong> 7–14 days (usually in just 4–8 days)</p>
                  <p style="color: #333; margin: 0 0 8px 0; line-height: 1.6;">• <strong>Trusted by 13,000+ customers worldwide</strong></p>
                  <p style="color: #333; margin: 0 0 8px 0; line-height: 1.6;">• ★ <a href="https://neonhub.com/pages/reviews" style="color: #2b26fe; text-decoration: none;"><strong>2,000+ verified reviews</strong> → See all reviews</a></p>
                  <p style="color: #333; margin: 0 0 8px 0; line-height: 1.6;">• <strong>2-Year Warranty</strong> for complete peace of mind</p>
                  <p style="color: #333; margin: 0; line-height: 1.6;">• <strong>HubBright™ LED Technology</strong> – energy-efficient, long-lasting, eco-friendly</p>
                </div>
                
                <!-- Divider -->
                <div style="border-bottom: 2px solid #f0f0f0; margin: 30px 0;"></div>
                
                <!-- WhatsApp Button -->
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://wa.me/971502528436?text=Hi! I just submitted my details on your website. I'm interested in a custom neon sign!" 
                     style="background: #2b26fe; 
                            color: white; 
                            padding: 18px 35px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-weight: bold; 
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(43, 38, 254, 0.3);
                            transition: all 0.3s ease;">
                    Chat with us on WhatsApp
                  </a>
                </div>
                
                <!-- Contact Info -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                  <h4 style="color: #2b26fe; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Need quick help?</h4>
                  <p style="color: #333; margin: 0 0 8px 0; line-height: 1.6;">WhatsApp: <a href="https://wa.me/971502528436" style="color: #2b26fe; text-decoration: none;">+971 50 252 8436</a></p>
                  <p style="color: #333; margin: 0 0 8px 0; line-height: 1.6;">Email: <a href="mailto:info@neonhub.com" style="color: #2b26fe; text-decoration: none;">info@neonhub.com</a></p>
                  <p style="color: #333; margin: 0; line-height: 1.6;">Website: <a href="https://neonhub.com" style="color: #2b26fe; text-decoration: none;">neonhub.com</a></p>
                </div>
                
                <!-- Divider -->
                <div style="border-bottom: 2px solid #f0f0f0; margin: 30px 0;"></div>
                
                <!-- Footer -->
                <div style="text-align: center;">
                  <p style="color: #2b26fe; font-weight: 600; margin: 0 0 15px 0; font-size: 16px;">★ NeonHub.com – Dubai's #1 Custom LED Neon Brand</p>
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Follow us for daily inspo & customer stories:<br>
                    <a href="https://neonhub.com" style="color: #2b26fe; margin: 0 8px; text-decoration: none;">Website</a>
                    <a href="#" style="color: #2b26fe; margin: 0 8px; text-decoration: none;">Instagram</a>
                    <a href="https://wa.me/971502528436" style="color: #2b26fe; margin: 0 8px; text-decoration: none;">WhatsApp</a>
                  </p>
                </div>
                
              </div>
            </div>
          `
        };

        console.log('📧 Sending welcome email to lead...');
        const leadResult = await mg.messages.create(process.env.MAILGUN_DOMAIN, leadEmailData);
        console.log('✅ Welcome email sent to lead:', leadResult.id);
      } catch (error) {
        console.error('❌ Email sending failed:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'Lead submitted successfully'
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
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
      submit: '/api/submit-lead'
    }
  });
});

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mailgun: !!mg,
    mailgun_domain: process.env.MAILGUN_DOMAIN || 'not_configured',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: ['/', '/health', '/api/submit-lead']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NeonHub WhatsApp Widget Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/submit-lead`);
});

// Handle server startup errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server startup error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});