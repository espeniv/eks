"use client";

import Link from "next/link";
import { useApp } from "@/context/app-context";

//Used for mobile
export function Navbar() {
  const { currentUser, unreadNotificationCount } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center py-2 z-50 md:hidden select-none">
      <Link
        href="/home"
        className="flex flex-col items-center px-4 py-1 hover:text-orange-400 rounded-full active:scale-90 transition"
      >
        <span className="text-xl">🏠</span>
        <span className="text-xs">Home</span>
      </Link>
      <Link
        href="/notifications"
        className="flex flex-col items-center px-4 py-1 hover:text-orange-400 relative rounded-full active:scale-90 transition"
      >
        <span className="text-xl relative inline-block">🔔</span>
        {unreadNotificationCount > 0 && (
          <span className="absolute top-[5px] right-[35px] bg-orange-500 rounded-full w-2.5 h-2.5"></span>
        )}
        <span className="text-xs">Notifications</span>
      </Link>
      <Link
        href={`/profile/${currentUser?.username}`}
        className="flex flex-col items-center px-4 py-1 hover:text-orange-400 rounded-full active:scale-90 transition"
      >
        <span className="text-xl">{currentUser?.avatar || "👤"}</span>
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
}
