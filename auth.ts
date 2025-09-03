import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db/drizzle"
import authConfig from "./auth.config"
import { getTeamForUser } from "./lib/db/queries"
import { userTable, accountTable, authenticatorTable, sessionTable, NewTeam, teamTable, ActivityType, NewTeamMember, teamMemberTable } from "@/lib/db/schema"
import { logActivity } from "@/lib/db/queries"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: userTable,
    accountsTable: accountTable,
    authenticatorsTable: authenticatorTable,
    sessionsTable: sessionTable,
  }),
  pages: {
    signIn: "sign-in",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn(params) {
      if (!params?.user.id) {
        return false;
      }

      const userWithTeam = await getTeamForUser(params?.user.id);

      if (!userWithTeam) {
        const newTeam: NewTeam = {
          name: `${params?.user.email}'s Team`,
        };

        const [createdTeam] = await db.insert(teamTable).values(newTeam).returning();

        if (!createdTeam) {
          return false;
        }

        const teamId = createdTeam.id;
        const userRole = 'owner';

        await logActivity(teamId, params?.user.id, ActivityType.CREATE_TEAM);

        const newTeamMember: NewTeamMember = {
          userId: params?.user.id,
          teamId: teamId,
          role: userRole,
        };

        await Promise.all([
          db.insert(teamMemberTable).values(newTeamMember),
          logActivity(teamId, params?.user.id, ActivityType.SIGN_UP),
        ]);
      } else {
        await Promise.all([
          logActivity(userWithTeam.id, params?.user.id, ActivityType.SIGN_IN),
        ]);

      }

      return true
    }
  },
  ...authConfig,
})
