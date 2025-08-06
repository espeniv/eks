"use client";

import { useApp } from "@/context/app-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRelativeTime, truncateWithQuote } from "@/lib/utils";

export default function NotificationsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { notifications, markAllNotificationsAsRead } = useApp();

  //Mark notifs as read when component unmounts
  useEffect(() => {
    document.title = "Notifications / Eks";
    return () => {
      markAllNotificationsAsRead();
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 bg-black border-gray-800">
        <div
          className={`border-b border-gray-800 ${
            isMobile ? "p-3 py-1 justify-around" : "p-4"
          } flex items-center`}
        >
          <h1 className="text-xl font-bold select-none">Notifications</h1>
        </div>
      </div>
      <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar bg-black">
        {notifications.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No notifications yet...
          </div>
        )}
        {notifications.map((notification) => {
          if (notification.type === "like") {
            return (
              <Link key={notification.id} href={`/post/${notification.postId}`}>
                <div
                  className={`mx-2 p-4 border rounded-xl flex items-center mb-4 text-sm md:text-base bg-black ${
                    !notification.isRead
                      ? "border-orange-400"
                      : "border-gray-900"
                  }`}
                >
                  {!notification.isRead && (
                    <svg
                      className="inline-block mr-2"
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="orange"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ verticalAlign: "middle" }}
                    >
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                  )}
                  <span
                    className="font-semibold hover:underline cursor-pointer inline-flex items-center mr-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/profile/${notification.sender.username}`;
                    }}
                    tabIndex={0}
                    role="link"
                  >
                    {notification.sender.avatar || "👤"}{" "}
                    {notification.sender.displayName}
                  </span>
                  liked your post.
                  <span className="ml-auto text-xs text-gray-600">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </Link>
            );
          }
          if (notification.type === "comment") {
            return (
              <Link key={notification.id} href={`/post/${notification.postId}`}>
                <div
                  className={`mx-2 p-4 border rounded-xl flex items-center mb-4 text-sm md:text-base bg-black ${
                    !notification.isRead
                      ? "border-orange-400"
                      : "border-gray-900"
                  }`}
                >
                  {!notification.isRead && (
                    <svg
                      className="inline-block mr-2"
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="orange"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ verticalAlign: "middle" }}
                    >
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                  )}
                  <span
                    className="font-semibold hover:underline cursor-pointer inline-flex items-center mr-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/profile/${notification.sender.username}`;
                    }}
                    tabIndex={0}
                    role="link"
                  >
                    {`${notification.sender.avatar || "👤"} ${
                      notification.sender.displayName
                    }`}
                  </span>
                  <span className="truncate overflow-hidden whitespace-nowrap max-w-[400px]">{`commented on your post: "${truncateWithQuote(
                    notification.message,
                    8
                  )}`}</span>
                  <span className="ml-auto text-xs text-gray-600">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </Link>
            );
          }
          if (notification.type === "follow") {
            return (
              <div
                key={notification.id}
                className={`mx-2 p-4 border rounded-xl flex items-center mb-4 text-sm md:text-base bg-black ${
                  !notification.isRead ? "border-orange-400" : "border-gray-900"
                }`}
              >
                {!notification.isRead && (
                  <svg
                    className="inline-block mr-2"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="orange"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ verticalAlign: "middle" }}
                  >
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                )}
                <span
                  className="font-semibold hover:underline cursor-pointer inline-flex items-center mr-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/profile/${notification.sender.username}`;
                  }}
                  tabIndex={0}
                  role="link"
                >
                  {notification.sender.avatar || "👤"}{" "}
                  {notification.sender.displayName}
                </span>
                started following you.
                <span className="ml-auto text-xs text-gray-600">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            );
          }
          if (notification.type === "welcome") {
            return (
              <div
                key={notification.id}
                className={`mx-2 p-4 border rounded-xl flex items-center mb-4 text-sm md:text-base bg-black ${
                  !notification.isRead ? "border-orange-400" : "border-gray-900"
                }`}
              >
                {!notification.isRead && (
                  <svg
                    className="inline-block mr-2"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="orange"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ verticalAlign: "middle" }}
                  >
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                )}
                <span className="inline-flex items-center mr-1">
                  {notification.message}
                </span>
                <span className="ml-auto text-xs text-gray-600">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            );
          }
          if (notification.type === "reply") {
            return (
              <Link key={notification.id} href={`/post/${notification.postId}`}>
                <div
                  className={`mx-2 p-4 border rounded-xl flex items-center mb-4 text-sm md:text-base bg-black ${
                    !notification.isRead
                      ? "border-orange-400"
                      : "border-gray-900"
                  }`}
                >
                  {!notification.isRead && (
                    <svg
                      className="inline-block mr-2"
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="orange"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ verticalAlign: "middle" }}
                    >
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                  )}
                  <span
                    className="font-semibold hover:underline cursor-pointer inline-flex items-center mr-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/profile/${notification.sender.username}`;
                    }}
                    tabIndex={0}
                    role="link"
                  >
                    {`${notification.sender.avatar || "👤"} ${
                      notification.sender.displayName
                    }`}
                  </span>
                  <span className="truncate overflow-hidden whitespace-nowrap max-w-[400px]">{`has replied to you: "${truncateWithQuote(
                    notification.message,
                    20
                  )}`}</span>
                  <span className="ml-auto text-xs text-gray-600">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </Link>
            );
          }
          if (notification.type === "mention") {
            return (
              <Link key={notification.id} href={`/post/${notification.postId}`}>
                <div
                  className={`mx-2 p-4 border rounded-xl flex items-center mb-4 text-sm md:text-base bg-black ${
                    !notification.isRead
                      ? "border-orange-400"
                      : "border-gray-900"
                  }`}
                >
                  {!notification.isRead && (
                    <svg
                      className="inline-block mr-2"
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="orange"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ verticalAlign: "middle" }}
                    >
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                  )}
                  <span
                    className="font-semibold hover:underline cursor-pointer inline-flex items-center mr-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/profile/${notification.sender.username}`;
                    }}
                    tabIndex={0}
                    role="link"
                  >
                    {notification.sender.avatar || "👤"}{" "}
                    {notification.sender.displayName}
                  </span>
                  {notification.message}
                  <span className="ml-auto text-xs text-gray-600">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
}
