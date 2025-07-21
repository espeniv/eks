"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { useApp } from "@/context/app-context";
import { Unbounded } from "next/font/google";

const unbounded = Unbounded({
  subsets: ["latin"],
});

export function Sidebar() {
  const { signOut } = useAuth();
  const { currentUser, unreadNotificationCount } = useApp();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    signOut();
    setShowLogoutPopup(false);
  };

  //Used to hide signout popup after 2 secs
  useEffect(() => {
    if (showLogoutPopup) {
      const timer = setTimeout(() => {
        setShowLogoutPopup(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showLogoutPopup]);

  return (
    <aside className="w-64 p-4 border-r border-gray-800 flex flex-col h-screen">
      <div className="mb-8">
        <h1
          className={`text-4xl ${unbounded.className} font-bold ml-3 select-none`}
        >
          Eks
        </h1>
      </div>
      <nav className="space-y-2">
        <Link href="/home" className="block p-3 rounded-full hover:bg-gray-900">
          🏠 Home
        </Link>
        <Link
          href="/notifications"
          className="block p-3 rounded-full hover:bg-gray-900 relative"
        >
          🔔 Notifications
          {unreadNotificationCount > 0 && (
            <span className="ml-2 align-middle">
              <span
                className="inline-flex items-center justify-center bg-orange-500 text-black text-[10px] font-bold rounded-full w-2.5 h-2.5 mb-0.25"
                style={{ minWidth: 8 }}
              >
                {/*unreadNotificationCount > 99 ? "99+" : unreadNotificationCount */}
              </span>
            </span>
          )}
        </Link>

        <Link
          href={`/profile/${currentUser?.username}`}
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          👤 Profile
        </Link>
      </nav>
      <div className="mt-auto flex justify-center relative">
        {showLogoutPopup && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
            <button
              onClick={() => {
                handleLogout();
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-full transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}
        <div
          className="flex items-center py-3 px-4 rounded-full hover:bg-gray-900 cursor-pointer"
          onClick={() => setShowLogoutPopup(!showLogoutPopup)}
        >
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-lg select-none">
              {currentUser?.avatar || "👤"}
            </span>
          </div>
          <div className="ml-3 select-none">
            <h2 className="text-sm font-medium">{currentUser?.displayName}</h2>
            <p className="text-xs text-gray-400">@{currentUser?.username}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
