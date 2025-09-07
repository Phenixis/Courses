/*
 * This file is used as the schema of the database.
 * Comment and uncomment the table as needed
 */

import { Stripe } from "stripe"

/* Account for google, github, ... authentification */
export * from "./account"
export * from "./authenticator"

/* Actions logging*/
export * from "./activity-log"

/* Team management // Required for Stripe integration */
export * from "./invitation"
export * from "./team"

/* Single user table and session management // Required for authentication */
export * from "./user"
export * from "./session"

/* Tickets reporting */
export * from "./ticket-comment"
export * from "./ticket"

/* Chapters */
export * from "./chapter"


export type PersonalizedPrice = {
  id: string;
  productId: string;
  unit_amount: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval | undefined;
  trialPeriodDays: number | null | undefined;
};