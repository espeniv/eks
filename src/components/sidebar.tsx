"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { useApp } from "@/context/app-context";
import { Unbounded } from "next/font/google";
import { usePathname } from "next/navigation";

const unbounded = Unbounded({
  subsets: ["latin"],
});

//Used for desktop
export function Sidebar() {
  const { signOut } = useAuth();
  const { currentUser, unreadNotificationCount } = useApp();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const pathname = usePathname();

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
    <aside className="hidden md:flex w-64 p-4 border-r border-gray-800 flex-col h-screen">
      <div className="mb-8">
        <Link
          href="/home"
          onClick={() => {
            sessionStorage.removeItem("homeScroll");
            sessionStorage.removeItem("fromPost");
          }}
        >
          <h1
            className={`text-4xl ${unbounded.className} font-bold ml-3 select-none`}
          >
            Eks
          </h1>
        </Link>
      </div>
      <nav className="space-y-2">
        <Link
          href="/home"
          onClick={() => {
            sessionStorage.removeItem("homeScroll");
            sessionStorage.removeItem("fromPost");
          }}
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          <span className="flex">
            {pathname === "/home" ||
            pathname.startsWith("/post/") ||
            (pathname.startsWith("/profile/") &&
              !pathname.startsWith(`/profile/${currentUser?.username}`)) ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-4 text-orange-500"
                viewBox="0 0 20 20"
              >
                <path
                  fill="currentColor"
                  d="M11.002 2.388a1.5 1.5 0 0 0-2.005 0l-5.5 4.942A1.5 1.5 0 0 0 3 8.445V15.5A1.5 1.5 0 0 0 4.5 17h2A1.5 1.5 0 0 0 8 15.5v-4a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 0 1.5 1.5h2a1.5 1.5 0 0 0 1.5-1.5V8.445a1.5 1.5 0 0 0-.497-1.115l-5.5-4.942Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-4 "
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M6.133 21C4.955 21 4 20.02 4 18.81v-8.802c0-.665.295-1.295.8-1.71l5.867-4.818a2.09 2.09 0 0 1 2.666 0l5.866 4.818c.506.415.801 1.045.801 1.71v8.802c0 1.21-.955 2.19-2.133 2.19H6.133Z" />
                  <path d="M9.5 21v-5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V21" />
                </g>
              </svg>
            )}
            <span
              className={
                pathname === "/home" ||
                pathname.startsWith("/post/") ||
                (pathname.startsWith("/profile/") &&
                  !pathname.startsWith(`/profile/${currentUser?.username}`))
                  ? "text-orange-500"
                  : ""
              }
            >
              Home
            </span>
          </span>
        </Link>
        <Link
          href="/notifications"
          className="block p-3 rounded-full hover:bg-gray-900 relative group"
        >
          <span className="flex">
            {pathname === "/notifications" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-4 text-orange-500"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M21.161 16.656a2.26 2.26 0 0 1-.41 1.088a2.27 2.27 0 0 1-1.89 1h-2.94a4.44 4.44 0 0 1-.23.788a3.996 3.996 0 0 1-2.18 2.178c-.495.2-1.026.298-1.56.29h-.08a3.862 3.862 0 0 1-1.44-.29a3.751 3.751 0 0 1-1.32-.87a3.846 3.846 0 0 1-.87-1.308a4.44 4.44 0 0 1-.23-.789h-2.82a2.242 2.242 0 0 1-1.94-.849a2.784 2.784 0 0 1-.26-2.367a6.72 6.72 0 0 1 .88-1.618a3.833 3.833 0 0 0 .82-1.768c0-2.886 0-3.865 1.58-5.743a5.719 5.719 0 0 1 1.9-1.478l.78-.38a.41.41 0 0 0 .1-.09a.31.31 0 0 0 .06-.13a2.995 2.995 0 0 1 1.905-2.142a3.003 3.003 0 0 1 2.835.434a2.716 2.716 0 0 1 1 1.758v.1a.35.35 0 0 0 .11.1l.72.35c.73.35 1.378.85 1.9 1.468c1.58 1.888 1.58 2.867 1.58 5.753c.134.69.44 1.336.89 1.878c.36.481.652 1.009.87 1.568c.164.332.247.698.24 1.069"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-4"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M11.962 17.986h6.81a1.555 1.555 0 0 0 1.512-2.175c-.36-1.088-1.795-2.393-1.795-3.677c0-2.85 0-3.6-1.404-5.276a5.025 5.025 0 0 0-1.653-1.283l-.783-.38a1.089 1.089 0 0 1-.511-.73a2.023 2.023 0 0 0-2.176-1.707a2.023 2.023 0 0 0-2.12 1.707a1.089 1.089 0 0 1-.567.73l-.783.38A5.025 5.025 0 0 0 6.84 6.858c-1.403 1.676-1.403 2.426-1.403 5.276c0 1.284-1.37 2.458-1.73 3.611c-.217.697-.337 2.241 1.48 2.241z" />
                  <path d="M15.225 17.986a3.198 3.198 0 0 1-3.263 3.263A3.195 3.195 0 0 1 8.7 17.986" />
                </g>
              </svg>
            )}
            <span
              className={pathname === "/notifications" ? "text-orange-500" : ""}
            >
              Notifications
            </span>
            {unreadNotificationCount > 0 && (
              <span className="ml-[-130] mt-[-10] align-middle">
                <span
                  className="inline-flex items-center justify-center bg-orange-500 text-white text-[10px] border-black group-hover:border-gray-900 border-4 font-bold rounded-full w-5 h-5 mb-0.25"
                  style={{ minWidth: 8 }}
                >
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              </span>
            )}
          </span>
        </Link>

        <Link
          href={`/profile/${currentUser?.username}`}
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          <span className="flex">
            {pathname.startsWith(`/profile/${currentUser?.username}`) ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-4 text-orange-500"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0Zm0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5H8Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-4"
                viewBox="0 0 24 24"
              >
                <g fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinejoin="round"
                    d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
                  />
                  <circle cx="12" cy="7" r="3" />
                </g>
              </svg>
            )}
            <span
              className={
                pathname.startsWith(`/profile/${currentUser?.username}`)
                  ? "text-orange-500"
                  : ""
              }
            >
              Profile
            </span>
          </span>
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
