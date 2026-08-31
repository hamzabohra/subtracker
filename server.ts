import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
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
