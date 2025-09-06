'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';

export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ priceId });
};

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
