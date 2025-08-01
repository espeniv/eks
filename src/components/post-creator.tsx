"use client";

import { useRef, useState } from "react";
import { useApp } from "@/context/app-context";

export function PostCreator() {
  const { addPost, currentUser } = useApp();
  const [postContent, setPostContent] = useState("");
  const [remainingChars, setRemainingChars] = useState(140);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      addPost(postContent, selectedFile);
      setPostContent("");
      setSelectedFile(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
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
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={!!selectedFile}
                onClick={() => fileInputRef.current?.click()}
                className="border px-4 py-2 rounded"
              >
                {selectedFile ? "File attached" : "Upload File"}
              </button>
            </div>
            <button
              type="submit"
              disabled={!postContent.trim() || remainingChars < 0}
              className="bg-orange-500 text-white px-3 py-1 md:px-6 md:py-2 rounded-full text-sm md:text-base font-bold hover:bg-orange-400 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
