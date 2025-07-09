"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Post, User } from "@/lib/types";
import { useAuth } from "./auth-context";

interface AppContextType {
  posts: Post[];
  addPost: (content: string) => void;
  likePost: (postId: string) => void;
  getPostById: (id: string) => Post | null;
  currentUser: User | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  //useMemo instead of setCurrentUser
  const currentUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.user_metadata?.username || user.email,
      displayName: user.user_metadata?.display_name || user.email,
      avatar: user.user_metadata?.avatar,
      bio: user.user_metadata?.bio || "",
      followers: 0,
      following: 0,
    };
  }, [user]);

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

  const getPostById = (id: string): Post | null => {
    return posts.find((post) => post.id === id) || null;
  };

  const value: AppContextType = {
    posts,
    addPost,
    likePost,
    getPostById,
    currentUser,
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
