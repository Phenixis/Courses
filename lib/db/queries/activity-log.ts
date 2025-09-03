import * as lib from "./library"
import { activityLogTable, ActivityType, NewActivityLog } from "../schema/activity-log";
import { userTable } from "../schema/user";
import { getUser } from "./user";

export async function getActivityLogs(limit: number = 10) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await lib.db
    .select({
      id: activityLogTable.id,
      action: activityLogTable.action,
      timestamp: activityLogTable.timestamp,
      ipAddress: activityLogTable.ipAddress,
      userName: userTable.name,
    })
    .from(activityLogTable)
    .leftJoin(userTable, lib.eq(activityLogTable.userId, userTable.id))
    .where(lib.eq(activityLogTable.userId, user.id))
    .orderBy(lib.desc(activityLogTable.timestamp))
    .limit(limit);
}

export async function logActivity(
  teamId: number | null | undefined,
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await lib.db.insert(activityLogTable).values(newActivity);
}