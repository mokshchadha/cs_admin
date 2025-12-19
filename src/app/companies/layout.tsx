// src/app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/login");
  }

  const decoded = verifyToken(token);
  const user = decoded ? { username: decoded.username } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar user={user} /> */}
      <main>{children}</main>
    </div>
  );
}
