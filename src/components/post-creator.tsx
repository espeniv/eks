"use client";

import { useState } from "react";

export function PostCreator({
  onPostCreated,
}: {
  onPostCreated: (postContent: string) => void;
}) {
  const [postContent, setPostContent] = useState("");

  const [remainingChars, setRemainingChars] = useState(140);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      onPostCreated(postContent);
      setPostContent("");
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= postContent.length || newValue.length <= 140) {
      setPostContent(newValue);
      setRemainingChars(140 - newValue.length);
    }
  };

  return (
    <form onSubmit={handlePostSubmit} className="border-b border-gray-800 p-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={postContent}
            onChange={handlePostChange}
            placeholder="What's happening?"
            className="w-full bg-transparent text-xl placeholder-gray-500 resize-none outline-none border-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-4setPostContent(e.target.value)">
            <span
              className={`text-sm ${
                remainingChars == 0 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {remainingChars} characters remaining
            </span>
            <button
              type="submit"
              disabled={!postContent.trim() || remainingChars < 0}
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
