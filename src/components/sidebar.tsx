"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useApp } from "@/context/app-context";
import { Unbounded } from "next/font/google";

const unbounded = Unbounded();

export function Sidebar() {
  const { signOut } = useAuth();
  const { currentUser } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="w-64 p-4 border-r border-gray-800 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className={`text-4xl ${unbounded.className} font-bold ml-3`}>
          Eks
        </h1>
      </div>
      <nav className="space-y-2">
        <Link href="/home" className="block p-3 rounded-full hover:bg-gray-900">
          🏠 Home
        </Link>
        <Link
          href="/notifications"
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          🔔 Notifications
        </Link>
        <Link
          href={`/profile/${currentUser?.username}`}
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          👤 Profile {/*currentUser ? `(${currentUser.username})` : null */}
        </Link>
      </nav>
      <div className="mt-auto flex justify-center">
        {/*<ProfileSelector profileId={props.profileId} />*/}
        {mounted && (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-4xl text-sm"
          >
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
