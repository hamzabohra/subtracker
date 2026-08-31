import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy Stripe initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

// Lazy Nodemailer Transporter initialization
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass },
    });
  }
  return null;
}

// Webhook endpoint needs raw body
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripe();

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    let event: Stripe.Event;

    try {
      if (endpointSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id, 'User:', session.metadata?.uid);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// JSON body parser for normal API routes
app.use(express.json());

// Check Stripe configuration status
app.get('/api/stripe/status', (req, res) => {
  const hasKey = Boolean(process.env.STRIPE_SECRET_KEY);
  res.json({
    isConfigured: hasKey,
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || null,
  });
});

// Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { uid, email, plan, country, currency } = req.body;
    const stripe = getStripe();

    const origin =
      req.headers.origin ||
      (process.env.APP_URL ? `https://${process.env.APP_URL.replace(/^https?:\/\//, '')}` : 'http://localhost:3000');

    if (!stripe) {
      // Return simulated success flag so user can still test in preview
      return res.json({
        simulated: true,
        message: 'STRIPE_SECRET_KEY not set in environment. Running in test simulation mode.',
      });
    }

    const isIndia =
      (country && (country.toLowerCase() === 'india' || country.toLowerCase() === 'in')) ||
      currency === 'INR';

    const currencyCode = isIndia ? 'inr' : 'usd';
    // Amount in cents / paise
    const unitAmount = isIndia
      ? plan === 'monthly'
        ? 19900
        : 349900
      : plan === 'monthly'
      ? 199
      : 3999;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name:
                plan === 'monthly'
                  ? 'SubTracker PRO (Monthly Subscription)'
                  : 'SubTracker PRO (Lifetime License)',
              description:
                plan === 'monthly'
                  ? 'Unlimited subscription tracking, trial cancellation alerts, and 100% ad-free experience.'
                  : 'One-time payment for permanent unlimited access to SubTracker PRO.',
            },
            unit_amount: unitAmount,
            ...(plan === 'monthly' ? { recurring: { interval: 'month' } } : {}),
          },
          quantity: 1,
        },
      ],
      client_reference_id: uid,
      metadata: {
        uid: uid || 'anonymous',
        plan: plan || 'monthly',
      },
      success_url: `${origin}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan=${plan || 'monthly'}`,
      cancel_url: `${origin}/?payment_cancelled=true`,
    };

    if (email && email.includes('@')) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      url: session.url,
      sessionId: session.id,
      simulated: false,
    });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// Verify Checkout Session status
app.get('/api/stripe/verify-session', async (req, res) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.json({ paid: true, simulated: true });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const isPaid = session.payment_status === 'paid' || session.status === 'complete';

    res.json({
      paid: isPaid,
      status: session.status,
      paymentStatus: session.payment_status,
      uid: session.metadata?.uid,
      plan: session.metadata?.plan,
    });
  } catch (error: any) {
    console.error('Error verifying Stripe session:', error);
    res.status(500).json({ error: error.message || 'Failed to verify session' });
  }
});

// Check Notification & Email Configuration Status
app.get('/api/notifications/status', (req, res) => {
  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  res.json({
    emailServiceConfigured: isSmtpConfigured,
    smtpHost: process.env.SMTP_HOST || 'Not configured (Simulated/Ethereal mode)',
    fromAddress: process.env.SMTP_FROM || 'SubTracker Alerts <alerts@subtracker.app>',
  });
});

// Send Test or Real Trial Expiry Email
app.post('/api/notifications/test-email', async (req, res) => {
  try {
    const { email, serviceName = 'Netflix' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const transporter = getMailTransporter();
    const from = process.env.SMTP_FROM || '"SubTracker Alerts" <alerts@subtracker.app>';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #002045; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">SubTracker Alert</h1>
        </div>
        <p style="font-size: 15px; color: #1e293b; line-height: 1.5;">Hello,</p>
        <div style="background-color: #eff4ff; border-left: 4px solid #002045; padding: 14px 16px; margin: 16px 0; border-radius: 4px;">
          <strong style="color: #002045; font-size: 16px;">⚠️ Free Trial Ending Tomorrow!</strong>
          <p style="margin: 6px 0 0; color: #334155; font-size: 14px;">Your <strong>${serviceName}</strong> free trial is scheduled to expire in 24 hours.</p>
        </div>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">
          If you do not plan to keep this subscription, please remember to cancel it today in your account settings to prevent automatic billing.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          Sent by SubTracker &bull; Manage your subscriptions & alerts anytime.
        </div>
      </div>
    `;

    if (transporter) {
      // Real SMTP Dispatch
      await transporter.sendMail({
        from,
        to: email,
        subject: `SubTracker Alert: Your ${serviceName} free trial ends tomorrow`,
        html: htmlBody,
      });

      return res.json({
        success: true,
        message: `Email alert sent successfully to ${email} via SMTP!`,
      });
    } else {
      // Ethereal Test Account fallback for instant interactive testing
      let testAccount;
      try {
        testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await testTransporter.sendMail({
          from: '"SubTracker Alerts" <alerts@subtracker.app>',
          to: email,
          subject: `[Test Alert] Your ${serviceName} free trial ends tomorrow`,
          html: htmlBody,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);

        return res.json({
          success: true,
          message: `Test email dispatched to ${email}! (Preview generated via Ethereal test inbox)`,
          previewUrl: previewUrl || undefined,
        });
      } catch {
        // Fallback simulation
        return res.json({
          success: true,
          message: `Test email alert simulated successfully for ${email}. To receive live inbox emails, configure SMTP_HOST, SMTP_USER, and SMTP_PASS in Settings.`,
        });
      }
    }
  } catch (error: any) {
    console.error('Error sending alert email:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch email' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SubTracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
