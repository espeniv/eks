"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Post, User, Comment } from "@/lib/types";
import { useAuth } from "./auth-context";
import { supabase } from "@/lib/supabase";
import { extractMentions } from "@/lib/utils";

interface AppContextType {
  currentUser: User | null;
  posts: Post[];
  fetchPosts: () => void;
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
    content: string,
    parentCommentId?: string | null
  ) => Promise<{ success: boolean; comment?: Comment; error?: Error }>;
  getCommentsByPostId: (postId: string) => Comment[];
  followingPosts: Post[];
  fetchFollowingPosts: () => Promise<void>;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => Promise<void>;
  refreshUserInPosts: (updatedUser: User) => void;
  refreshCurrentUser: () => void;
  notifications: Notification[];
  unreadNotificationCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deletePost: (postId: string) => Promise<{ success: boolean; error?: Error }>;
  deleteComment: (
    commentId: string
  ) => Promise<{ success: boolean; error?: Error }>;
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
  comment_count: number | null;
  is_liked_by_user: boolean;
  author_id: string;
  profiles: SupabaseProfile;
}

interface Notification {
  id: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
  type: "like" | "comment" | "follow";
  message: string;
  isRead: boolean;
  createdAt: string;
  postId?: string;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

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

  const refreshCurrentUser = async () => {
    if (!user) return;

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
      console.error("Error refreshing profile:", error);
    }
  };

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
        .from("posts_with_likes_and_comments")
        .select(
          `
        id,
        content,
        created_at,
        likes_count,
        is_liked_by_user,
        author_id,
        comment_count,
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
        commentCount: post.comment_count || 0,
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

      //To trigger notifications for mentions in new post
      const mentionedUsernames = extractMentions(newPost.content);

      for (const username of mentionedUsernames) {
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username.toLowerCase())
          .single();

        if (user && user.id !== currentUser.id) {
          await supabase.from("notifications").insert([
            {
              recipient_id: user.id,
              sender_id: currentUser.id,
              post_id: newPost.id,
              type: "mention",
              message: `mentioned you in a post.`,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }

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

        const post = getPostById(postId);
        const postAuthorId = post?.author.id;

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

          //Notification creation on like
          if (postAuthorId && postAuthorId !== currentUser.id) {
            await supabase.from("notifications").insert({
              recipient_id: postAuthorId,
              sender_id: currentUser.id,
              post_id: postId,
              type: "like",
              message: "liked your post",
              is_read: false,
            });
          }
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
      author_id,
      parent_comment_id
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

      const authorIds = [...new Set(data.map((comment) => comment.author_id))];

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
        parentCommentId: comment.parent_comment_id,
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
    content: string,
    parentCommentId?: string | null
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
          parent_comment_id: parentCommentId ?? null,
        })
        .select(
          `
          id,
          content,
          created_at,
          post_id,
          author_id,
          parent_comment_id
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
        parentCommentId: data.parent_comment_id,
      };

      setComments((prev) => [...prev, newComment]);

      //Notifications for mentions in new comment
      const mentionedUsernames = extractMentions(newComment.content);

      for (const username of mentionedUsernames) {
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username.toLowerCase())
          .single();

        if (user && user.id !== currentUser.id) {
          await supabase.from("notifications").insert([
            {
              recipient_id: user.id,
              sender_id: currentUser.id,
              post_id: newComment.postId,
              comment_id: newComment.id,
              type: "mention",
              message: `mentioned you in a comment.`,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }

      const post = getPostById(postId);
      const postAuthorId = post?.author.id;

      let parentCommentAuthorId: string | null = null;
      if (newComment.parentCommentId) {
        const { data: parentComment, error: parentError } = await supabase
          .from("comments")
          .select("author_id")
          .eq("id", newComment.parentCommentId)
          .single();

        if (!parentError && parentComment) {
          parentCommentAuthorId = parentComment.author_id;
          //Only notify reply if not replying to self
          if (parentComment.author_id !== currentUser.id) {
            await supabase.from("notifications").insert({
              recipient_id: parentComment.author_id,
              sender_id: currentUser.id,
              post_id: postId,
              comment_id: newComment.id,
              type: "reply",
              message: newComment.content,
              is_read: false,
            });
          }
        }
      }

      //Only notify post author if not replying to authors comment (to avoid double notification)
      if (
        postAuthorId &&
        postAuthorId !== currentUser.id &&
        postAuthorId !== parentCommentAuthorId
      ) {
        await supabase.from("notifications").insert({
          recipient_id: postAuthorId,
          sender_id: currentUser.id,
          post_id: postId,
          comment_id: newComment.id,
          type: "comment",
          message: newComment.content,
          is_read: false,
        });
      }

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
  const fetchFollowingPosts = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Get following user IDs
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      if (!followingData || followingData.length === 0) {
        setFollowingPosts([]);
        return;
      }

      const followingIds = followingData.map((f) => f.following_id);

      // Fetch posts from followed users
      const { data: posts } = await supabase
        .from("posts_with_likes_and_comments")
        .select(
          `
          id,
          content,
          created_at,
          likes_count,
          is_liked_by_user,
          author_id,
          comment_count,
          profiles!posts_author_id_fkey(
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
        .in("author_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (posts) {
        const transformedPosts: Post[] = (
          posts as unknown as SupabasePost[]
        ).map((post) => ({
          id: post.id,
          content: post.content,
          createdAt: post.created_at,
          likes: post.likes_count || 0,
          commentCount: post.comment_count || 0,
          author: {
            id: post.profiles.id,
            username: post.profiles.username,
            displayName: post.profiles.display_name,
            avatar: post.profiles.avatar_url,
            bio: post.profiles.bio || "",
            followers: post.profiles.followers_count || 0,
            following: post.profiles.following_count || 0,
          },
        }));

        setFollowingPosts(transformedPosts);
      }
    } catch (error) {
      console.error("Error fetching following posts:", error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchFollowingPosts();
    }
  }, [currentUser?.id, fetchFollowingPosts]);

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

        //Notification creation on follow
        if (userId !== currentUser.id) {
          await supabase.from("notifications").insert({
            recipient_id: userId,
            sender_id: currentUser.id,
            type: "follow",
            message: "started following you",
            is_read: false,
          });
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  //-------Notifications------
  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }
    try {
      //First, get notifications without the join
      const { data: notificationsData, error: notificationsError } =
        await supabase
          .from("notifications")
          .select("*")
          .eq("recipient_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(50);

      if (notificationsError) throw notificationsError;

      if (!notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        setUnreadNotificationCount(0);
        return;
      }

      //Get unique sender IDs
      const senderIds = [...new Set(notificationsData.map((n) => n.sender_id))];

      //Then get sender profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", senderIds);

      if (profilesError) throw profilesError;

      //Create a map for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach((profile) => {
        profilesMap.set(profile.id, profile);
      });

      const formattedNotifications: Notification[] = notificationsData.map(
        (notif) => {
          const senderProfile = profilesMap.get(notif.sender_id);
          return {
            id: notif.id,
            type: notif.type,
            message: notif.message,
            isRead: notif.is_read,
            createdAt: notif.created_at,
            postId: notif.post_id,
            sender: {
              id: notif.sender_id,
              username: senderProfile?.username || "Unknown",
              displayName: senderProfile?.display_name || "Unknown User",
              avatar: senderProfile?.avatar_url || null,
            },
          };
        }
      );

      setNotifications(formattedNotifications);
      setUnreadNotificationCount(
        formattedNotifications.filter((n) => !n.isRead).length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", currentUser.id)
        .eq("is_read", false);

      //Commented out to avoid automatically clearing new mark of notifications on frontend, should only cleared as read on next fetch/render
      /* setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      ); */
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();

      //Check for new notifications every 60s
      const interval = setInterval(() => {
        fetchNotifications();
      }, 60000);

      return () => {
        clearInterval(interval);
      };
    } else {
      setNotifications([]);
      setUnreadNotificationCount(0);
    }
  }, [currentUser]);

  //Deleting posts
  const deletePost = async (
    postId: string
  ): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) {
        console.error("Error deleting post:", error);
        return { success: false, error };
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setFollowingPosts((prev) => prev.filter((post) => post.id !== postId));
      setComments((prev) =>
        prev.filter((comment) => comment.postId !== postId)
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting post:", error);
      return { success: false, error: error as Error };
    }
  };

  //Deleting comments
  const deleteComment = async (
    commentId: string
  ): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        return { success: false, error };
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { success: false, error: error as Error };
    }
  };

  const value: AppContextType = {
    posts,
    addPost,
    fetchPosts,
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
    refreshCurrentUser,
    notifications,
    unreadNotificationCount,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deletePost,
    deleteComment,
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
