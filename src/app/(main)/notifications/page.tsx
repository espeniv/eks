"use client";

import { useApp } from "@/context/app-context";
import Link from "next/link";
import { useEffect } from "react";

export default function NotificationsPage() {
  const { notifications, markAllNotificationsAsRead } = useApp();

  //Mark notifs as read when component unmounts
  useEffect(() => {
    return () => {
      markAllNotificationsAsRead();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 bg-black border-b border-gray-800">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <div>
          {notifications.map((notification) => {
            if (notification.type === "like") {
              return (
                <Link
                  key={notification.id}
                  href={`/post/${notification.postId}`}
                >
                  <div className="p-4 py-6 border-b border-gray-800">
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
                      {notification.sender.avatar}{" "}
                      {notification.sender.displayName}
                    </span>
                    liked your post.
                  </div>
                </Link>
              );
            }
            if (notification.type === "comment") {
              return (
                <Link
                  key={notification.id}
                  href={`/post/${notification.postId}`}
                >
                  <div className="p-4 py-6 border-b border-gray-800">
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
                    <span className="font-semibold hover:underline cursor-pointer">
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
                        {notification.sender.avatar}{" "}
                        {notification.sender.displayName}
                      </span>
                    </span>
                    commented on your post.
                  </div>
                </Link>
              );
            }
            if (notification.type === "follow") {
              return (
                <div
                  key={notification.id}
                  className="p-4 py-6 border-b border-gray-800"
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
                    {notification.sender.avatar}{" "}
                    {notification.sender.displayName}
                  </span>
                  started following you.
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
