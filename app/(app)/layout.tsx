import { SidebarProvider } from '@/components/ui/sidebar';
import Breadcrumb from '@/components/big/breadcrumb';
import { Sidebar, MobileSidebar } from '@/components/big/sidebar';
import { cookies } from "next/headers"

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
            <SidebarProvider defaultOpen={defaultOpen}>
                <Sidebar />
                <main className="flex-1 p-0 md:p-4">
                    <MobileSidebar />
                    <Breadcrumb />
                    {children}
                </main>
            </SidebarProvider>
        </main>
    )
}