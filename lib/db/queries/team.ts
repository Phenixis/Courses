import * as lib from "./library"
import { teamTable } from "../schema/team"
import { userTable } from "../schema/user"
import { teamMemberTable } from "../schema/team"

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await lib.db
    .select()
    .from(teamTable)
    .where(lib.eq(teamTable.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await lib.db
    .update(teamTable)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(lib.eq(teamTable.id, teamId));
}

export async function getUserWithTeam(userId: string) {
  const result = await lib.db
    .select({
      user: userTable,
      teamId: teamTable.id,
      role: teamMemberTable.role,
      joinedAt: teamMemberTable.joinedAt,
    })
    .from(userTable)
    .leftJoin(teamMemberTable, lib.eq(userTable.id, teamMemberTable.userId))
    .leftJoin(teamTable, lib.eq(teamMemberTable.teamId, teamTable.id))
    .where(lib.eq(userTable.id, userId))
    .limit(1);
    
  return result[0];
}

export async function getTeamForUser(userId: string) {
  const result = await lib.db.query.userTable.findFirst({
    where: lib.eq(userTable.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}