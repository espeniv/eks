"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { Post, User } from "@/lib/types";
import { useAuth } from "./auth-context";
import { supabase } from "@/lib/supabase";

interface AppContextType {
  posts: Post[];
  addPost: (content: string) => void;
  likePost: (postId: string) => void;
  getPostById: (id: string) => Post | null;
  currentUser: User | null;
}

interface SupabaseProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number | null;
  following_count: number | null;
}

interface SupabasePost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number | null;
  author_id: string;
  profiles: SupabaseProfile;
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
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
        id,
        content,
        created_at,
        likes_count,
        author_id,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          followers_count,
          following_count
        )
      `
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No posts found");
        setPosts([]);
        return;
      }

      const typedData = data as unknown as SupabasePost[];

      const formattedPosts: Post[] = typedData.map((post) => ({
        id: post.id,
        content: post.content,
        author: {
          id: post.profiles.id,
          username: post.profiles.username,
          displayName: post.profiles.display_name,
          avatar: post.profiles.avatar_url,
          bio: post.profiles.bio || "",
          followers: post.profiles.followers_count || 0,
          following: post.profiles.following_count || 0,
        },
        likes: post.likes_count || 0,
        createdAt: post.created_at,
      }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const addPost = async (content: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          content: content.trim(),
          author_id: currentUser.id,
          created_at: new Date().toISOString(),
        })
        .select(
          `
          id,
          content,
          created_at,
          likes_count,
          author_id
        `
        )
        .single();

      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }
      const newPost: Post = {
        id: data.id,
        content: data.content,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          followers: currentUser.followers,
          following: currentUser.following,
        },
        likes: data.likes_count || 0,
        createdAt: data.created_at,
      };

      setPosts((prev) => [newPost, ...prev]);
      return { success: true, post: newPost };
    } catch (error) {
      console.error("Failed to create post:", error);
      return { success: false, error };
    }
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
