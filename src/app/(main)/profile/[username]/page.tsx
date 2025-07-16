"use client";

import { PostFeed } from "@/components/post-feed";
import { User } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { currentUser, toggleFollow, isFollowing } = useApp();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error) {
          setUser(null);
        } else {
          setUser({
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            avatar: data.avatar_url,
            bio: data.bio || "",
            followers: data.followers_count || 0,
            following: data.following_count || 0,
          });
        }
      } catch {
        console.error("Error fetching user from database");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading profile..</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="text-gray-500">
            No profile found for user with username @{`${username}`}
          </p>
        </div>
      </div>
    );
  }

  const handleFollowClick = () => {
    toggleFollow(user.id);
  };

  return (
    <div className="max-w-2xl">
      <div className="p-4">
        <div className="relative">
          <div className="flex justify-center pt-8 pb-6">
            <div className="w-32 h-32 bg-orange-600 rounded-full border-4 border-black flex items-center justify-center">
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
                <Link href={`/profile/${username}/edit`}>
                  <button className="border border-gray-600 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-900 transition-colors cursor-pointer">
                    Edit Profile
                  </button>
                </Link>
              ) : (
                <button
                  onClick={handleFollowClick}
                  className="border cursor-pointer border-gray-600 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-900 transition-colors"
                >
                  {!isFollowing(user.id) ? "Follow" : "Unfollow"}
                </button>
              )}
            </div>

            {user.bio ? (
              <p className="text-white">{user.bio}</p>
            ) : (
              <p className="text-gray-500">(No bio has been set)</p>
            )}

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
