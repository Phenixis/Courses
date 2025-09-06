import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db/drizzle"
import authConfig from "./auth.config"
import { userTable, accountTable, authenticatorTable, sessionTable } from "@/lib/db/schema"

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
  ...authConfig,
})
