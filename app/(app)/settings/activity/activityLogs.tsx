import {
    Settings,
    LogOut,
    UserPlus,
    Lock,
    UserCog,
    AlertCircle,
    UserMinus,
    Mail,
    CheckCircle,
    type LucideIcon,
    CircleAlert,
    ShoppingCart,
    CircleX
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

const iconMap: Record<ActivityType, LucideIcon> = {
    [ActivityType.SIGN_UP]: UserPlus,
    [ActivityType.SIGN_IN]: UserCog,
    [ActivityType.SIGN_OUT]: LogOut,

    [ActivityType.PASSWORD_RESET]: Lock,
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

const messageMap: Record<ActivityType, string> = {
    [ActivityType.SIGN_UP]: 'You signed up.',
    [ActivityType.SIGN_IN]: 'You signed in.',
    [ActivityType.SIGN_OUT]: 'You signed out.',

    [ActivityType.PASSWORD_RESET]: 'You reset your password.',
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

function formatAction(action: ActivityType): string {
    return messageMap[action] || 'Unknown action occurred';
}

function getRelativeTime(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
}
export default async function ActivityLogs() {
    const logs = await getActivityLogs();

    return (
        logs.length > 0 ? (
            <ul className="space-y-4">
                {logs.map((log) => {
                    const Icon = iconMap[log.action as ActivityType] || Settings;
                    const formattedAction = formatAction(
                        log.action as ActivityType
                    );

                    return (
                        <li key={log.id} className="flex items-center space-x-4">
                            <div className="bg-primary/10 rounded-full p-2">
                                <Icon className="w-5 h-5 text-primary/90" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formattedAction}
                                    {log.ipAddress && ` from IP ${log.ipAddress}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {getRelativeTime(new Date(log.timestamp))}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
                <AlertCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No activity yet
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                    When you perform actions like signing in or updating your
                    account, they'll appear here.
                </p>
            </div>
        )
    )
}