// src/app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth";
import { redirect } from "next/navigation";

interface CompaniesLayoutProps {
  children: React.ReactNode;
}

export default async function CompaniesLayout({
  children,
}: CompaniesLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/login");
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar user={user} /> */}
      <main>{children}</main>
    </div>
  );
}
