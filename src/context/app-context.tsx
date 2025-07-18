"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { Post, User, Comment } from "@/lib/types";
import { useAuth } from "./auth-context";
import { supabase } from "@/lib/supabase";

interface AppContextType {
  currentUser: User | null;
  posts: Post[];
  addPost: (
    content: string
  ) => Promise<{ success: boolean; post?: Post; error?: Error }>;
  getPostById: (id: string) => Post | null;
  togglePostLike: (postId: string) => Promise<void>;
  isPostLikedByUser: (postId: string) => boolean;
  comments: Comment[];
  fetchComments: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    content: string
  ) => Promise<{ success: boolean; comment?: Comment; error?: Error }>;
  getCommentsByPostId: (postId: string) => Comment[];
  followingPosts: Post[];
  fetchFollowingPosts: () => Promise<void>;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => Promise<void>;
  refreshUserInPosts: (updatedUser: User) => void;
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
  is_liked_by_user: boolean;
  author_id: string;
  profiles: SupabaseProfile;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [profileData, setProfileData] = useState<SupabaseProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileData(null);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            username,
            display_name,
            avatar_url,
            bio,
            followers_count,
            following_count
          `
          )
          .eq("id", user.id)
          .single();

        if (!error && profile) {
          setProfileData(profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  //useMemo instead of setCurrentUser
  const currentUser = useMemo(() => {
    if (!user || !profileData) return null;
    return {
      id: profileData.id,
      username: profileData.username,
      displayName: profileData.display_name,
      avatar: profileData.avatar_url,
      bio: profileData.bio || "",
      followers: profileData.followers_count || 0,
      following: profileData.following_count || 0,
    };
  }, [user, profileData]);

  useEffect(() => {
    fetchPosts();
    fetchFollowingPosts();
    const loadFollowingData = async () => {
      if (!currentUser) return;

      try {
        const { data } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUser.id);

        const followingIds = new Set(data?.map((f) => f.following_id) || []);
        setFollowing(followingIds);
      } catch (error) {
        console.error("Error loading following:", error);
      }
    };

    loadFollowingData();
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts_with_likes")
        .select(
          `
        id,
        content,
        created_at,
        likes_count,
        is_liked_by_user,
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

      //To get a set of currentusers liked posts for correct like tracking on frontend
      if (currentUser) {
        const postIds = formattedPosts.map((post) => post.id);
        const { data: userLikesData } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", currentUser.id)
          .in("post_id", postIds);

        const likedPostIds = new Set(
          userLikesData?.map((like) => like.post_id) || []
        );
        setUserLikes(likedPostIds);
      } else {
        setUserLikes(new Set());
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  //Required to immediately see changes after editing user profile
  const refreshUserInPosts = (updatedUser: User) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.author.id === updatedUser.id
          ? { ...post, author: updatedUser }
          : post
      )
    );

    setFollowingPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.author.id === updatedUser.id
          ? { ...post, author: updatedUser }
          : post
      )
    );
  };

  const addPost = async (
    content: string
  ): Promise<{ success: boolean; post?: Post; error?: Error }> => {
    if (!currentUser) {
      return { success: false, error: new Error("No user logged in") };
    }
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
      return { success: false, error: error as Error };
    }
  };

  const getPostById = (id: string): Post | null => {
    return posts.find((post) => post.id === id) || null;
  };

  //To see if provided postId is liked by current user
  const isPostLikedByUser = (postId: string): boolean => {
    if (!currentUser) return false;
    return userLikes.has(postId);
  };

  const togglePostLike = async (postId: string) => {
    if (currentUser) {
      try {
        const { data: existingLike } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)
          .maybeSingle();

        const isCurrentlyLiked = !!existingLike;

        setUserLikes((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });

        //Optimistic updating for instant UI changes
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: existingLike ? post.likes - 1 : post.likes + 1,
              };
            }
            return post;
          })
        );

        if (existingLike) {
          await supabase
            .from("likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", currentUser.id);

          const { data: currentPost } = await supabase
            .from("posts")
            .select("likes_count")
            .eq("id", postId)
            .single();

          await supabase
            .from("posts")
            .update({
              likes_count: Math.max((currentPost?.likes_count || 1) - 1, 0),
            })
            .eq("id", postId);
        } else {
          await supabase.from("likes").insert({
            post_id: postId,
            user_id: currentUser.id,
          });
          const { data: currentPost } = await supabase
            .from("posts")
            .select("likes_count")
            .eq("id", postId)
            .single();

          await supabase
            .from("posts")
            .update({ likes_count: (currentPost?.likes_count || 0) + 1 })
            .eq("id", postId);
        }
      } catch (error) {
        console.error(error);
        //Revert in case of error
        await fetchPosts();
      }
    }
  };

  //Refetch likes again when user or posts changes
  useEffect(() => {
    if (currentUser && posts.length > 0) {
      const postIds = posts.map((post) => post.id);
      supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUser.id)
        .in("post_id", postIds)
        .then(({ data }) => {
          const likedPostIds = new Set(data?.map((like) => like.post_id) || []);
          setUserLikes(likedPostIds);
        });
    } else {
      setUserLikes(new Set());
    }
  }, [currentUser]);

  //-----Comment functionality-----
  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
        id,
        content,
        created_at,
        post_id,
        author_id
      `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setComments((prev) =>
          prev.filter((comment) => comment.postId !== postId)
        );
        return;
      }

      //Get author IDs
      const authorIds = [...new Set(data.map((comment) => comment.author_id))];

      //Fetch author profiles
      const { data: authorsData, error: authorsError } = await supabase
        .from("profiles")
        .select(
          `
        id,
        username,
        display_name,
        avatar_url,
        bio,
        followers_count,
        following_count
      `
        )
        .in("id", authorIds);

      if (authorsError) throw authorsError;

      //Map for authors
      const authorsMap = new Map();
      authorsData?.forEach((author) => {
        authorsMap.set(author.id, {
          id: author.id,
          username: author.username,
          displayName: author.display_name,
          avatar: author.avatar_url,
          bio: author.bio || "",
          followers: author.followers_count || 0,
          following: author.following_count || 0,
        });
      });

      const formattedComments: Comment[] = data.map((comment) => ({
        id: comment.id,
        content: comment.content,
        postId: comment.post_id,
        author: authorsMap.get(comment.author_id) || {
          id: comment.author_id,
          username: "Unknown",
          displayName: "Unknown User",
          avatar: null,
          bio: "",
          followers: 0,
          following: 0,
        },
        createdAt: comment.created_at,
      }));

      setComments((prev) => [
        ...prev.filter((comment) => comment.postId !== postId),
        ...formattedComments,
      ]);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const addComment = async (
    postId: string,
    content: string
  ): Promise<{ success: boolean; comment?: Comment; error?: Error }> => {
    if (!currentUser) {
      return { success: false, error: new Error("No user logged in") };
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          content: content.trim(),
          post_id: postId,
          author_id: currentUser.id,
          created_at: new Date().toISOString(),
        })
        .select(
          `
          id,
          content,
          created_at,
          post_id,
          author_id
        `
        )
        .single();

      if (error) {
        console.error("Error creating comment:", error);
        throw error;
      }

      const newComment: Comment = {
        id: data.id,
        content: data.content,
        postId: data.post_id,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          followers: currentUser.followers,
          following: currentUser.following,
        },
        createdAt: data.created_at,
      };

      setComments((prev) => [...prev, newComment]);

      return { success: true, comment: newComment };
    } catch (error) {
      console.error("Failed to create comment:", error);
      return { success: false, error: error as Error };
    }
  };

  const getCommentsByPostId = (postId: string): Comment[] => {
    return comments.filter((comment) => comment.postId === postId);
  };

  //-----Following functionality------
  const fetchFollowingPosts = async () => {
    if (!currentUser) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from("posts_with_likes")
        .select(
          `
          id,
          content,
          created_at,
          likes_count,
          is_liked_by_user,
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
        .in("author_id", Array.from(following))
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      //Similar to fetchPosts
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

      setFollowingPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching following posts:", error);
    }
  };

  //Simple check for following
  const isFollowing = (userId: string): boolean => {
    return following.has(userId);
  };

  //Toggle follow
  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      const isCurrentlyFollowing = following.has(userId);

      if (isCurrentlyFollowing) {
        //Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);

        setFollowing((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        //Follow
        await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: userId,
        });

        setFollowing((prev) => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const value: AppContextType = {
    posts,
    addPost,
    getPostById,
    currentUser,
    togglePostLike,
    isPostLikedByUser,
    comments,
    fetchComments,
    addComment,
    getCommentsByPostId,
    followingPosts,
    fetchFollowingPosts,
    isFollowing,
    toggleFollow,
    refreshUserInPosts,
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
