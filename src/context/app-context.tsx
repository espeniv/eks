"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Post, User } from "@/lib/types";

interface AppContextType {
  posts: Post[];
  addPost: (content: string) => void;
  likePost: (postId: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  //will be fetched from backend/auth later, sample for now
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "current-user",
    username: "you",
    displayName: "You",
    avatar: undefined,
    bio: "Just joined!",
    followers: 0,
    following: 0,
  });

  //Sample posts state, will also be implemnted properly later
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      content: "Just built my first Next.js app! The App Router is amazing 🚀",
      author: {
        id: "user1",
        username: "johndoe",
        displayName: "John Doe",
        avatar: undefined,
        bio: "Full-stack developer",
        followers: 1250,
        following: 890,
      },
      likes: 24,
      createdAt: "2h",
    },
    {
      id: "2",
      content:
        "Learning React step by step. The component model makes so much sense! 💡",
      author: {
        id: "user2",
        username: "janesmith",
        displayName: "Jane Smith",
        avatar: undefined,
        bio: "UI/UX Designer",
        followers: 750,
        following: 430,
      },
      likes: 15,
      createdAt: "4h",
    },
  ]);

  const addPost = (content: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      likes: 0,
      createdAt: "now",
    };
    setPosts([newPost, ...posts]);
  };

  const likePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // The value object that will be provided to all children
  const value: AppContextType = {
    posts,
    addPost,
    likePost,
    currentUser,
    setCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
