'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  userTable,
  teamTable,
  teamMemberTable,
  invitationTable,
  ActivityType,
  type User,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam, logActivity } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
import { validatePasswordStrength } from '@/lib/utils';

// Custom password validation schema
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long")
    .refine((password) => {
        const validation = validatePasswordStrength(password);
        return validation.isValid;
    }, (password) => {
        const validation = validatePasswordStrength(password);
        return { message: validation.errors.join(', ') };
    });

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: passwordSchema,
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: userTable,
      team: teamTable,
    })
    .from(userTable)
    .leftJoin(teamMemberTable, eq(userTable.id, teamMemberTable.userId))
    .leftJoin(teamTable, eq(teamMemberTable.teamId, teamTable.id))
    .where(eq(userTable.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  if (!foundUser.passwordHash) {
    return { error: "You signed in with a provider. Please use that provider's sign-in method." };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  confirmPassword: z.string(),
  inviteId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: 'Failed to create user. Please try again.' };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'owner', // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(userTable).values(newUser).returning();

  if (!createdUser) {
    return { error: 'Failed to create user. Please try again.' };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teamTable.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitationTable)
      .where(
        and(
          eq(invitationTable.id, parseInt(inviteId)),
          eq(invitationTable.email, email),
          eq(invitationTable.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitationTable)
        .set({ status: 'accepted' })
        .where(eq(invitationTable.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teamTable)
        .where(eq(teamTable.id, teamId))
        .limit(1);

      await db.update(userTable).set({ role: userRole }).where(eq(userTable.id, createdUser.id));
    } else {
      return { error: 'Invalid or expired invitation.' };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`,
    };

    [createdTeam] = await db.insert(teamTable).values(newTeam).returning();

    if (!createdTeam) {
      return { error: 'Failed to create team. Please try again.' };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole,
  };

  await Promise.all([
    db.insert(teamMemberTable).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ priceId });
  }

  redirect('/onboard/sign-up/step-2');
});

import { signOut as googleSignOut } from "@/auth"

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
  await googleSignOut();
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    if (!user.passwordHash) {
      return { error: "You signed in with a provider. Please use that provider's sign-in method." };
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(userTable)
        .set({ passwordHash: newPasswordHash })
        .where(eq(userTable.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return { success: 'Password updated successfully.' };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    if (!user.passwordHash) {
      return { error: "You signed in with a provider. Please use that provider's sign-in method." };
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(userTable)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(userTable.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMemberTable)
        .where(
          and(
            eq(teamMemberTable.userId, user.id),
            eq(teamMemberTable.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  context: z.string().optional(),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email, context } = data;

    const userWithTeam = await getUserWithTeam(user.id);


    await Promise.all([
      db.update(userTable).set({ name, email }).where(eq(userTable.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT),
    ]);

    if (context === 'step2') {
      redirect('/dashboard');
    }

    return { success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMemberTable)
      .where(
        and(
          eq(teamMemberTable.id, memberId),
          eq(teamMemberTable.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const teamMembers = await db
      .select()
      .from(userTable)
      .leftJoin(teamMemberTable, eq(userTable.id, teamMemberTable.userId))
      .where(eq(teamMemberTable.teamId, userWithTeam.teamId));

    if (teamMembers.find(member => member.user.email === email)) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitationTable)
      .where(
        and(
          eq(invitationTable.email, email),
          eq(invitationTable.teamId, userWithTeam.teamId),
          eq(invitationTable.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    if (teamMembers.length >= 5) {
      return { error: 'Team member limit reached.' };
    }

    // Create a new invitation
    await db.insert(invitationTable).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending',
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);

enum emailValidationResult {
  KNOWN = 1,
  UNKNOWN = 2,
  PROVIDER = -1,
};

export const validateEmail = async (email: string) => {
  const data = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (data.length === 0) {
    return emailValidationResult.UNKNOWN;
  }

  if (data[0].passwordHash === null) {
    return emailValidationResult.PROVIDER;
  }

  return emailValidationResult.KNOWN;
}

// Forgot Password Actions
const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255),
});

export const forgotPassword = validatedAction(forgotPasswordSchema, async (data) => {
  const { email } = data;

  // Check if user exists and has a password (not provider-only account)
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (user.length === 0) {
    // Don't reveal if email exists or not for security
    return { success: 'If an account with that email exists, we have sent you a password reset link.' };
  }

  const foundUser = user[0];

  if (!foundUser.passwordHash) {
    // User signed up with a provider
    return { error: 'This account uses a provider sign-in. Please sign in with your provider.' };
  }

  // Import password reset session functions
  const { createPasswordResetSession, deletePasswordResetSessionsForUser } = await import('@/lib/db/queries/password-reset-session');
  const { sendEmail } = await import('@/components/email/send_email');

  // Clean up any existing reset sessions for this user
  await deletePasswordResetSessionsForUser(foundUser.id);

  // Create new reset session (expires in 1 hour)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const resetSession = await createPasswordResetSession({
    userId: foundUser.id,
    email: foundUser.email,
    expiresAt,
  });

  // Send reset email
  const resetUrl = `${process.env.BASE_URL}/forgot-password?session-id=${resetSession.sessionId}`;
  const emailContent = `
    <h2>Password Reset Request</h2>
    <p>You have requested to reset your password. Click the link below to reset your password:</p>
    <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this password reset, please ignore this email.</p>
  `;

  try {
    await sendEmail(email, 'Password Reset Request', emailContent);
    return { success: 'If an account with that email exists, we have sent you a password reset link.' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { error: 'Failed to send password reset email. Please try again.' };
  }
});

const resetPasswordSchema = z
  .object({
    sessionId: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const resetPassword = validatedAction(resetPasswordSchema, async (data) => {
  const { sessionId, password } = data;

  // Import password reset session functions
  const { getPasswordResetSession, markPasswordResetSessionAsUsed } = await import('@/lib/db/queries/password-reset-session');

  // Validate session
  const resetSession = await getPasswordResetSession(sessionId);

  if (!resetSession) {
    return { error: 'Invalid or expired reset link. Please request a new password reset.' };
  }

  // Get user and update password
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, resetSession.userId))
    .limit(1);

  if (user.length === 0) {
    return { error: 'User not found.' };
  }

  const foundUser = user[0];

  // Hash new password
  const newPasswordHash = await hashPassword(password);

  // Update password and mark session as used
  await Promise.all([
    db
      .update(userTable)
      .set({ passwordHash: newPasswordHash })
      .where(eq(userTable.id, foundUser.id)),
    markPasswordResetSessionAsUsed(sessionId),
  ]);

  // Log activity
  const userWithTeam = await getUserWithTeam(foundUser.id);
  await logActivity(userWithTeam?.teamId, foundUser.id, ActivityType.UPDATE_PASSWORD);

  return { success: 'Password reset successfully. You can now sign in with your new password.' };
});