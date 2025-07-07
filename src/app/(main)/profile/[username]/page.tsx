"use client";

import { PostFeed } from "@/components/post-feed";
import { User } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { use } from "react";

//Temp before endpoints/proper fetching
function getUserByUsername(username: string): User | null {
  const sampleUsers: { [key: string]: User } = {
    johndoe: {
      id: "user1",
      username: "johndoe",
      displayName: "John Doe",
      avatar: undefined,
      bio: "Full-stack developer passionate about React and Next.js 🚀",
      followers: 1250,
      following: 890,
    },
    janesmith: {
      id: "user2",
      username: "janesmith",
      displayName: "Jane Smith",
      avatar: undefined,
      bio: "UI/UX Designer • Coffee enthusiast ☕ • Building beautiful experiences",
      followers: 750,
      following: 430,
    },
    testuser: {
      id: "current-user",
      username: "testuser",
      displayName: "Test User",
      avatar: undefined,
      bio: "Testbio",
      followers: 123,
      following: 321,
    },
  };

  return sampleUsers[username] || null;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const user = getUserByUsername(username);
  const { currentUser } = useApp();
  //Check if user exists
  if (!user) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="text-gray-500">No user with username @{username}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="p-4">
        <div className="relative">
          <div className="flex justify-center pt-8 pb-6">
            <div className="w-32 h-32 bg-gray-600 rounded-full border-4 border-black flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{user.displayName}</h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>
              {currentUser?.id == user.id ? (
                <button className="border border-gray-600 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-900 transition-colors">
                  Edit Profile
                </button>
              ) : (
                <button className="border border-gray-600 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-900 transition-colors">
                  Follow
                </button>
              )}
            </div>

            {user.bio && <p className="text-white">{user.bio}</p>}

            <div className="flex gap-6 text-sm">
              <span>
                <span className="font-bold text-white">{user.following}</span>
                <span className="text-gray-500"> Following</span>
              </span>
              <span>
                <span className="font-bold text-white">{user.followers}</span>
                <span className="text-gray-500"> Followers</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-800" />

      <PostFeed filterByUserId={user.id} />
    </div>
  );
}
