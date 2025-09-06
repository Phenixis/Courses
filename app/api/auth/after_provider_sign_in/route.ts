import { NextRequest, NextResponse } from "next/server"
import { getTeamForUser, getUser } from "@/lib/db/queries"
import { NewTeam, teamTable, ActivityType, NewTeamMember, teamMemberTable, invitationTable, userTable } from "@/lib/db/schema"
import { logActivity } from "@/lib/db/queries"
import { and, db, eq } from "@/lib/db/queries/library";
import { setSession } from "@/lib/auth/session";
import { createCheckoutSession } from "@/lib/payments/stripe";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const inviteId = searchParams.get('inviteId');
    const priceId = searchParams.get('priceId');
    const redirect = searchParams.get('redirect');

    const user = await getUser();

    if (!user) {
        // impossible because the user is created by NextAuth and signed in before calling this function
        return NextResponse.redirect(process.env.BASE_URL + '/');
    }

    // If coming from sign-up or from login and the user was created less than 5 minutes ago
    if (from === 'sign-up' || from === 'login' && ((new Date().getTime() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000)) {
        let teamId: number;
        let userRole: string;
        let createdTeam: typeof teamTable.$inferSelect | null = null;

        if (inviteId && inviteId !== 'null') {
            // Check if there's a valid invitation
            const [invitation] = await db
                .select()
                .from(invitationTable)
                .where(
                    and(
                        eq(invitationTable.id, parseInt(inviteId)),
                        eq(invitationTable.email, user.email),
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

                await logActivity(teamId, user.id, ActivityType.ACCEPT_INVITATION);

                [createdTeam] = await db
                    .select()
                    .from(teamTable)
                    .where(eq(teamTable.id, teamId))
                    .limit(1);
            } else {
                return { error: 'Invalid or expired invitation.' };
            }
        } else {
            // Create a new team if there's no invitation
            const newTeam: NewTeam = {
                name: `${user.email}'s Team`,
            };

            [createdTeam] = await db.insert(teamTable).values(newTeam).returning();

            if (!createdTeam) {
                return { error: 'Failed to create team. Please try again.' };
            }

            teamId = createdTeam.id;
            userRole = 'owner';

            // Make the user the owner of the new team
            await db.update(userTable).set({ role: 'owner' }).where(eq(userTable.id, user.id));


            await logActivity(teamId, user.id, ActivityType.CREATE_TEAM);
        }

        const newTeamMember: NewTeamMember = {
            userId: user.id,
            teamId: teamId,
            role: userRole,
        };

        await Promise.all([
            db.insert(teamMemberTable).values(newTeamMember),
            logActivity(teamId, user.id, ActivityType.SIGN_UP),
            setSession(user),
        ]);

        if (redirect === 'checkout') {
            if (!priceId) {
                // impossible because the link with redirect=checkout has always a priceId
                return NextResponse.redirect(process.env.BASE_URL + '/dashboard');
            }
            return createCheckoutSession({ priceId });
        }

        return NextResponse.redirect('/onboard/sign-up/step-2');
    } else {
        if (redirect === 'checkout') {
            if (!priceId) {
                // impossible because the link with redirect=checkout has always a priceId
                return NextResponse.redirect(process.env.BASE_URL + '/dashboard');
            }
            return createCheckoutSession({ priceId });
        } else {
            return NextResponse.redirect(process.env.BASE_URL + (redirect && redirect !== 'null' ? redirect : '/dashboard'));
        }
    }
}