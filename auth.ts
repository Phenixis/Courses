import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db/drizzle"
import { eq } from "drizzle-orm"
import authConfig from "./auth.config"
import { getTeamForUser, getUser, createUser } from "./lib/db/queries"
import { userTable, accountTable, authenticatorTable, sessionTable, NewTeam, teamTable, ActivityType, NewTeamMember, teamMemberTable, NewAccount } from "@/lib/db/schema"
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
    // async signIn(params) {
    //   const userId = params?.user.id;
    //   const email = params?.user.email;

    //   if (!email) {
    //     return false;
    //   }
      
    //   if (!userId) {
    //     return false;
    //   }

    //   const isUserCreated = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

    //   const userWithTeam = await getTeamForUser(userId);

    //   if (!userWithTeam) {
    //     const newTeam: NewTeam = {
    //       name: `${params?.user.email}'s Team`,
    //     };

    //     const [createdTeam] = await db.insert(teamTable).values(newTeam).returning();

    //     if (!createdTeam) {
    //       return false;
    //     }

    //     const teamId = createdTeam.id;
    //     const userRole = 'owner';

    //     await logActivity(teamId, userId, ActivityType.CREATE_TEAM);

    //     const newTeamMember: NewTeamMember = {
    //       userId: userId,
    //       teamId: teamId,
    //       role: userRole,
    //     };

    //     await Promise.all([
    //       db.insert(teamMemberTable).values(newTeamMember),
    //       logActivity(teamId, userId, ActivityType.SIGN_UP),
    //     ]);
    //   } else {
    //     await Promise.all([
    //       logActivity(userWithTeam.id, userId, ActivityType.SIGN_IN),
    //     ]);
    //   }

    //   return true
    // }
  },
  ...authConfig,
})
