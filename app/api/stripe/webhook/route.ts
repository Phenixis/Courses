import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const eventListenedTo = [
  { eventName: 'checkout.session.async_payment_failed' },
  { eventName: 'checkout.session.async_payment_succeeded' },
  { eventName: 'checkout.session.completed' },
  { eventName: 'checkout.session.expired' },
  { eventName: 'customer.subscription.created' },
  { eventName: 'customer.subscription.deleted' },
  { eventName: 'customer.subscription.paused' },
  { eventName: 'customer.subscription.pending_update_applied' },
  { eventName: 'customer.subscription.pending_update_expired' },
  { eventName: 'customer.subscription.resumed' },
  { eventName: 'customer.subscription.trial_will_end' },
  { eventName: 'customer.subscription.updated' }
]

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  if (!eventListenedTo.find(e => e.eventName === event.type)) {
    // console.log(`Event ${event.type} not listened to.`);
    return NextResponse.json({ received: true });
  }

  const eventType = event.type.split('.');

  switch (eventType[0]) {
    case 'checkout':
      switch (eventType[1]) {
        case 'session':
          switch (eventType[2]) {
            case 'async_payment_failed':
              console.log("Event received:", event.type)
              break;
            case 'async_payment_succeeded':
              console.log("Event received:", event.type)
              break;
            case 'completed':
              console.log("Event received:", event.type)
              break;
            case 'expired':
              console.log("Event received:", event.type)
              break;
          }
          break;
      }
      break;
    case 'customer':
      switch (eventType[1]) {
        case 'subscription':
          const subscription = event.data.object as Stripe.Subscription;
          switch (eventType[2]) {
            case 'created':
              console.log("Event received:", event.type)
              break;
            case 'paused':
              console.log("Event received:", event.type)
              await handleSubscriptionChange(subscription);
              break;
            case 'deleted':
              console.log("Event received:", event.type)  
              await handleSubscriptionChange(subscription);
              break;
            case 'resumed':
              console.log("Event received:", event.type)
              break;
            case 'trial_will_end':
              console.log("Event received:", event.type)
              break;
            case 'pending_update_applied':
              console.log("Event received:", event.type)
              break;
            case 'pending_update_expired':
              console.log("Event received:", event.type)
              break;
          }
          break;
      }
      break;
  }

  // switch (event.type) {
  //   case 'customer.subscription.updated':
  //   case 'customer.subscription.deleted':
  //     const subscription = event.data.object as Stripe.Subscription;
  //     await handleSubscriptionChange(subscription);
  //     break;
  //   default:
  //     console.log(`Unhandled event type ${event.type}`);
  // }

  return NextResponse.json({ received: true });
}
