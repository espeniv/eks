"use client";

import { PostCard } from "@/components/post-card";
import { useApp } from "@/context/app-context";
import { use } from "react";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { getPostById } = useApp();

  const { id } = use(params);
  const post = getPostById(id);

  //Case if post is not found
  if (!post) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-gray-500">
            The post you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PostCard post={post} singlePostView={true} />

      <div className="p-4">
        <div className="border-b border-gray-800 pb-4 mb-4 -mx-4 scroll-px-44">
          <h2 className="text-lg font-bold">Replies</h2>
        </div>

        {/* Dummy data for now */}
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold">Alice Johnson</span>
                <span className="text-gray-500">@alicej</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">1h</span>
              </div>
              <p className="mt-1">This is so helpful! Thanks for sharing 👍</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
