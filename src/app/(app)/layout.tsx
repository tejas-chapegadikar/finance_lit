import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        xpTotal={user.xpTotal}
        displayName={getDisplayName(user)}
        isAdmin={user.role === "ADMIN"}
      />
      {/* Bottom padding on mobile keeps content clear of the fixed tab bar. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-28 sm:p-6">
        {children}
        <p className="mt-12 text-center text-xs text-neutral-500">
          StockStreak is for education only and doesn&apos;t give personal financial advice.
        </p>
      </main>
      <MobileTabBar />
    </div>
  );
}
