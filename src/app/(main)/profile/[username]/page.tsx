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
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    document.title = `${username[0].toUpperCase() + username.slice(1)} / Eks`;
  }, [username]);

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
          const userData = {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            avatar: data.avatar_url,
            bio: data.bio || "",
            followers: data.followers_count || 0,
            following: data.following_count || 0,
          };

          setUser(userData);

          await fetchFollowCounts(userData.id);
        }
      } catch {
        console.error("Error fetching user from database");
      } finally {
        setLoading(false);
      }
    };
    const fetchFollowCounts = async (userId: string) => {
      try {
        //Get followers
        const { count: followers } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);

        //Get following count
        const { count: following } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId);

        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);
      } catch (error) {
        console.error("Error fetching follow counts:", error);
      }
    };
    fetchUser();
  }, [username]);

  //Needed to trigger useEffect below for instant followers count change on unfollow
  const isUserFollowed = isFollowing(user?.id || "");

  useEffect(() => {
    if (user) {
      const fetchFollowCounts = async () => {
        try {
          const { count: followers } = await supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", user.id);

          setFollowerCount(followers || 0);
        } catch (error) {
          console.error("Error fetching follow counts:", error);
        }
      };

      fetchFollowCounts();
    }
  }, [user, isUserFollowed]);

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
            No profile found for user with username @
            {`${username.toLowerCase()}`}
          </p>
        </div>
      </div>
    );
  }

  const handleFollowClick = () => {
    toggleFollow(user.id);
  };

  return (
    <div className="h-screen flex flex-col max-w-2xl">
      <div className="flex-shrink-0 bg-black border-b border-gray-800">
        <div className="p-4">
          <div className="relative">
            <div className="flex justify-center pt-8 pb-6">
              <Link
                href={
                  currentUser?.id === user.id
                    ? `/profile/${username.toLowerCase()}/edit`
                    : `/profile/${username.toLowerCase()}`
                }
              >
                <div
                  className={`w-32 h-32 bg-orange-600 rounded-full border-4 border-black flex items-center justify-center cursor-default ${
                    currentUser?.id === user.id
                      ? "hover:opacity-80 cursor-pointer"
                      : null
                  }`}
                >
                  {user.avatar ? (
                    <span className="text-7xl">{user.avatar}</span>
                  ) : (
                    <span className="text-7xl">👤</span>
                  )}
                </div>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">{user.displayName}</h1>
                  <p className="text-gray-500">
                    @{user.username.toLowerCase()}
                  </p>
                </div>
                {currentUser?.id === user.id ? (
                  <Link href={`/profile/${username.toLowerCase()}/edit`}>
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
                <p className="text-gray-500">
                  {currentUser?.id === user.id
                    ? "(Click edit profile to set a bio)"
                    : "(No bio has been set)"}
                </p>
              )}

              <div className="flex gap-6 text-sm select-none">
                <span>
                  <span className="font-bold text-white">{followingCount}</span>
                  <span className="text-gray-500 ml-1"> Following</span>
                </span>
                <span>
                  <span className="font-bold text-white">{followerCount}</span>
                  <span className="text-gray-500 ml-1"> Followers</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <PostFeed onProfile={true} filterByUserId={user.id} />
      </div>
    </div>
  );
}
