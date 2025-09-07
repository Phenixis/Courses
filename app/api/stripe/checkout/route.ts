import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { userTable, teamTable, teamMemberTable } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';
import { createAccess } from '@/lib/db/queries/access';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'payment_intent'],
    });

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found in database.');
    }

    const userTeam = await db
      .select({
        teamId: teamMemberTable.teamId,
      })
      .from(teamMemberTable)
      .where(eq(teamMemberTable.userId, user[0].id))
      .limit(1);

    if (userTeam.length === 0) {
      throw new Error('User is not associated with any team.');
    }

    console.log(session);

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;

    switch (session.mode) {
      case 'subscription':
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          throw new Error('No subscription found for this session.');
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price.product'],
        });

        const plan = subscription.items.data[0]?.price;

        if (!plan) {
          throw new Error('No plan found for this subscription.');
        }

        const productId = (plan.product as Stripe.Product).id;

        if (!productId) {
          throw new Error('No product ID found for this subscription.');
        }

        await db
          .update(teamTable)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripeProductId: productId,
            planName: (plan.product as Stripe.Product).name,
            subscriptionStatus: subscription.status,
            updatedAt: new Date(),
          })
          .where(eq(teamTable.id, userTeam[0].teamId));

        await setSession(user[0]);
        break;
      case 'payment':
        if (session.payment_status !== 'paid') {
          throw new Error('Payment was not successful.');
        }

        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

        if (!paymentIntentId) {
          throw new Error('No payment intent found for this session.');
        }

        const productIdFromMetadata = session.metadata?.productId;

        if (!productIdFromMetadata) {
          throw new Error('No product ID found in session metadata.');
        }

        const priceIdFromMetadata = session.metadata?.priceId;

        if (!priceIdFromMetadata) {
          throw new Error('No price ID found in session metadata.');
        }

        const result = await createAccess({
          userId: user[0].id,
          stripeProductId: productIdFromMetadata,
          stripeCustomerId: customerId,
          stripePriceId: priceIdFromMetadata,
          paymentIntentId: paymentIntentId,
        });

        if (!result) {
          throw new Error('Failed to create access record.');
        }
        break;
      default:
        throw new Error('Unsupported session mode.');
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
