import * as lib from "./library"
import { getSession } from '@/lib/auth/session';
import { userTable } from "../schema/user"

export async function getUser(id?: string) {
  if (!id) {
    const session = await getSession();

    if (!session) {
      return null;
    }

    if (new Date(session.expires) < new Date()) {
      return null;
    }

    const user = await lib.db
      .select()
      .from(userTable)
      .where(lib.and(
        (session.user.id ? lib.eq(userTable.id, session.user?.id) : lib.eq(userTable.email, session.user?.email)),
        lib.isNull(userTable.deletedAt))
      )
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } else {
    const user = await lib.db
      .select()
      .from(userTable)
      .where(lib.and(
        lib.eq(userTable.id, id),
        lib.isNull(userTable.deletedAt))
      )
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  }
}

export async function getUserImages(n: number) {
  const data = await lib.db
    .select({
      name: userTable.name,
      image: userTable.image,
    })
    .from(userTable)
    .where(lib.and(lib.isNull(userTable.deletedAt), lib.isNotNull(userTable.image)))
    .limit(n * 2);

  return data
    .map(d => ({ name: d.name, image: d.image }))
    .filter(image => image.name !== null && image.image !== null) as { name: string; image: string }[];
}

export async function getNumberUsers() {
  return await lib.db
    .select({
      count: lib.count(userTable.id),
    })
    .from(userTable)
    .where(lib.isNull(userTable.deletedAt));
}