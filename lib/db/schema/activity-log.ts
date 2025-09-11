import * as lib from "./library"
import { userTable } from "./user"
import { teamTable } from "./team"
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  UserMinus,
  Mail,
  CheckCircle,
  type LucideIcon,
  CircleAlert,
  ShoppingCart,
  CircleX
} from 'lucide-react';

export const activityLogTable = lib.pgTable('activity_log', {
  id: lib.serial('id').primaryKey(),
  teamId: lib.integer('team_id')
    .notNull()
    .references(() => teamTable.id),
  userId: lib.text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  action: lib.text('action').notNull(),
  timestamp: lib.timestamp('timestamp').notNull().defaultNow(),
  ipAddress: lib.varchar('ip_address', { length: 45 }),
});

export const activityLogRelations = lib.relations(activityLogTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [activityLogTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [activityLogTable.userId],
    references: [userTable.id],
  }),
}));

export type ActivityLog = typeof activityLogTable.$inferSelect;
export type NewActivityLog = typeof activityLogTable.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',

  REQUEST_PASSWORD_RESET = 'REQUEST_PASSWORD_RESET',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',

  CREATE_TEAM = 'CREATE_TEAM',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',

  PRODUCT_BOUGHT = 'PRODUCT_BOUGHT',
  PRODUCT_REFUNDED = 'PRODUCT_REFUNDED',
  PRODUCT_REFUND_FAILED = 'PRODUCT_REFUND_FAILED',
}

export const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,

  [ActivityType.REQUEST_PASSWORD_RESET]: Lock,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,

  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,

  [ActivityType.PRODUCT_BOUGHT]: ShoppingCart,
  [ActivityType.PRODUCT_REFUNDED]: CircleX,
  [ActivityType.PRODUCT_REFUND_FAILED]: CircleAlert,
};

export const messageMap: Record<ActivityType, string> = {
  [ActivityType.SIGN_UP]: 'You signed up.',
  [ActivityType.SIGN_IN]: 'You signed in.',
  [ActivityType.SIGN_OUT]: 'You signed out.',

  [ActivityType.REQUEST_PASSWORD_RESET]: 'You requested a password reset.',
  [ActivityType.UPDATE_PASSWORD]: 'You changed your password.',
  [ActivityType.UPDATE_ACCOUNT]: 'You updated your account.',
  [ActivityType.DELETE_ACCOUNT]: 'You deleted your account.',

  [ActivityType.CREATE_TEAM]: 'You created a new team.',
  [ActivityType.INVITE_TEAM_MEMBER]: 'You invited a team member.',
  [ActivityType.ACCEPT_INVITATION]: 'You accepted an invitation.',
  [ActivityType.REMOVE_TEAM_MEMBER]: 'You removed a team member.',

  [ActivityType.PRODUCT_BOUGHT]: 'You bought a product.',
  [ActivityType.PRODUCT_REFUNDED]: 'A refund was issued for a product',
  [ActivityType.PRODUCT_REFUND_FAILED]: 'The refund of a product failed. You got access back to the product.',
};