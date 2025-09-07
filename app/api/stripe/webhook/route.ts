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
    return NextResponse.json({ received: true });
  }

  const eventType = event.type.split('.');

  switch (eventType[0]) {
    case 'checkout':
      switch (eventType[1]) {
        case 'session':
          switch (eventType[2]) {
            case 'async_payment_failed':
              // Stripe Doc : Occurs when a payment intent using a delayed payment method fails.
              console.log("Event received:", event.type)
              break;
            case 'async_payment_succeeded':
              // Stripe Doc : Occurs when a payment intent using a delayed payment method finally succeeds.
              console.log("Event received:", event.type)
              break;
            case 'completed':
              // Stripe Doc : Occurs when a Checkout Session has been successfully completed.
              console.log("Event received:", event.type)
              break;
            case 'expired':
              // Stripe Doc : Occurs when a Checkout Session is expired.
              console.log("Event received:", event.type)
              console.log(event)
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
              // Stripe Doc : Occurs whenever a customer is signed up for a new plan.
              console.log("Event received:", event.type)
              break;
            case 'updated':
              // Stripe Doc : Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).
              console.log("Event received:", event.type)
              await handleSubscriptionChange(subscription);
              break;
            case 'paused':
              // Stripe Doc : Occurs whenever a customer's subscription is paused. Only applies when subscriptions enter status=paused, not when payment collection is paused.
              console.log("Event received:", event.type)
              await handleSubscriptionChange(subscription);
              break;
            case 'deleted':
              // Stripe Doc : Occurs whenever a customer's subscription ends.
              console.log("Event received:", event.type)
              await handleSubscriptionChange(subscription);
              break;
            case 'resumed':
              // Stripe Doc : Occurs whenever a customer's subscription is no longer paused. Only applies when a status=paused subscription is resumed, not when payment collection is resumed.
              console.log("Event received:", event.type)
              break;
            case 'trial_will_end':
              // Stripe Doc : Occurs three days before a subscription's trial period is scheduled to end, or when a trial is ended immediately (using trial_end=now).
              console.log("Event received:", event.type)
              break;
            case 'pending_update_applied':
              // Stripe Doc : Occurs whenever a customer's subscription's pending update is applied, and the subscription is updated.
              console.log("Event received:", event.type)
              break;
            case 'pending_update_expired':
              // Stripe Doc : Occurs whenever a customer's subscription's pending update expires before the related invoice is paid.
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
