"use client";

import { useApp } from "@/context/app-context";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { emojis } from "@/lib/avatars";

export default function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { currentUser, refreshUserInPosts, refreshCurrentUser } = useApp();
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("👤");

  useEffect(() => {
    document.title = "Edit Profile / Eks";
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.username !== username) {
      router.push(`/profile/${username}`);
      return;
    }
    if (currentUser) {
      setBio(currentUser.bio || "");
      setSelectedEmoji(currentUser.avatar || "👤");
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser, username, router]);

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio: bio.trim(),
          avatar_url: selectedEmoji,
          display_name: displayName.trim(),
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      const updatedUser = {
        ...currentUser,
        bio: bio.trim(),
        avatar: selectedEmoji,
        displayName: displayName.trim(),
      };

      //To instantly see changes made after editing
      refreshCurrentUser();
      refreshUserInPosts(updatedUser);

      router.push(`/profile/${username}`);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
    }
  };

  const handleCancel = () => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="border-b border-gray-800 p-4 sticky top-0 bg-black flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Choose Avatar
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-30 h-30 bg-orange-600 rounded-full border-4 border-black flex items-center justify-center">
              <span className="text-7xl">{selectedEmoji}</span>
            </div>
          </div>
          <div className="grid grid-cols-8 gap-3">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-colors cursor-pointer ${
                  selectedEmoji === emoji
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm  font-bold text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
            maxLength={15}
            placeholder="Your display name"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 resize-none transition-colors"
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={140}
          />
          <p className="text-sm text-gray-500 mt-1">
            {bio.length}/140 characters
          </p>
        </div>
      </div>
    </div>
  );
}
