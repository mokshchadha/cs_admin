// src/components/Navbar.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { User } from "../lib/types";

interface NavbarProps {
  user?: User;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsLoggingOut(false);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      current: pathname === "/dashboard",
    },
    {
      name: "Companies",
      href: "/companies",
      current: pathname === "/companies",
    },
  ];

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>

            {/* Navigation */}
            <nav className="flex space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user.username}</span>!
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
