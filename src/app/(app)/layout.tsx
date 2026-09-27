import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { Navbar } from "@/components/layout/Navbar";

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
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
