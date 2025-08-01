"use client";

import { useState } from "react";
import { useApp } from "@/context/app-context";
import { FileUpload } from "./file-upload";

export function PostCreator() {
  const { addPost, currentUser } = useApp();
  const [postContent, setPostContent] = useState("");
  const [remainingChars, setRemainingChars] = useState(140);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      addPost(postContent);
      setPostContent("");
      setRemainingChars(140);
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
    <form
      onSubmit={handlePostSubmit}
      className="border-b border-gray-800 p-3 md:p-4"
    >
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={postContent}
            onChange={handlePostChange}
            placeholder={`What's happening ${
              currentUser?.displayName.split(" ")[0]
            }?`}
            className="w-full bg-transparent text-base md:text-xl placeholder-gray-500 resize-none outline-none border-none"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <span
              className={`text-xs md:text-sm select-none ${
                remainingChars == 0 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {remainingChars} characters remaining
            </span>
            <button
              type="submit"
              disabled={!postContent.trim() || remainingChars < 0}
              className="bg-orange-500 text-white px-3 py-1 md:px-6 md:py-2 rounded-full text-sm md:text-base font-bold hover:bg-orange-400 disabled:opacity-50"
            >
              Post
            </button>
            <FileUpload />
          </div>
        </div>
      </div>
    </form>
  );
}
