"use client";

import { useRef, useState } from "react";
import { useApp } from "@/context/app-context";

export function PostCreator() {
  const { addPost, currentUser } = useApp();
  const [postContent, setPostContent] = useState("");
  const [remainingChars, setRemainingChars] = useState(140);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileError, setShowFileError] = useState<boolean>(false);
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
    if (file) {
      //Limit is 3MB on backend
      if (file.size > 3 * 1024 * 1024) {
        setShowFileError(true);
      }
      setSelectedFile(file);
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
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center py-1.5 px-3 md:px-6 md:py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs md:text-sm font-medium transition cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586"
                    />
                  </svg>
                  Attach Image
                </button>
              ) : (
                <div
                  className={`flex items-center bg-gray-900 px-3 py-0.5 md:py-2 md:px-6 rounded-full ${
                    showFileError ? "bg-red-700" : "bg-green-600"
                  } text-xs md:text-sm text-white font-medium`}
                >
                  <span className="truncate max-w-[80px] md:max-w-[110px] select-none">
                    {showFileError ? "File is too big" : selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setShowFileError(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className={`ml-2 text-white ${
                      showFileError
                        ? "hover:text-red-300"
                        : "hover:text-red-600"
                    }
                     text-base cursor-pointer`}
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={
                  !postContent.trim() || remainingChars < 0 || showFileError
                }
                className="bg-orange-500 text-white px-3 py-1 md:px-6 md:py-2 rounded-full text-sm md:text-base font-bold hover:bg-orange-400 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
