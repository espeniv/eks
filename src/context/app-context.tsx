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
import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTION_IDS,
  BUCKET_ID,
} from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { extractMentions } from "@/lib/utils";

// Typed document interfaces for Appwrite collections
interface ProfileDoc {
  $id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  [key: string]: unknown;
}

interface PostDoc {
  $id: string;
  content: string;
  author_id: string;
  created_at: string;
  likes_count: number;
  comment_count: number;
  image_url: string | null;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CommentDoc {
  $id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  parent_comment_id: string | null;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NotificationDoc {
  $id: string;
  recipient_id: string;
  sender_id: string;
  post_id: string | null;
  comment_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  [key: string]: unknown;
}

interface AppContextType {
  currentUser: User | null;
  posts: Post[];
  fetchPosts: () => void;
  addPost: (
    content: string,
    file: File | null,
  ) => Promise<{ success: boolean; post?: Post; error?: Error }>;
  getPostById: (id: string) => Post | null;
  togglePostLike: (postId: string) => Promise<void>;
  isPostLikedByUser: (postId: string) => boolean;
  comments: Comment[];
  fetchComments: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    content: string,
    parentCommentId?: string | null,
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
  deletePost: (
    postId: string,
    imageUrl?: string | null,
  ) => Promise<{ success: boolean; error?: Error }>;
  deleteComment: (
    commentId: string,
  ) => Promise<{ success: boolean; error?: Error }>;
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

// Helper to convert a profile document to a User
function profileDocToUser(doc: ProfileDoc): User {
  return {
    id: doc.$id,
    username: doc.username,
    displayName: doc.display_name,
    avatar: doc.avatar_url || null,
    bio: doc.bio || "",
    followers: doc.followers_count || 0,
    following: doc.following_count || 0,
  };
}

// Helper to batch-fetch profiles by IDs
async function fetchProfilesByIds(ids: string[]): Promise<Map<string, User>> {
  const profilesMap = new Map<string, User>();
  if (ids.length === 0) return profilesMap;

  const uniqueIds = [...new Set(ids)];
  const results = await Promise.all(
    uniqueIds.map((id) =>
      databases
        .getDocument(DATABASE_ID, COLLECTION_IDS.profiles, id)
        .catch(() => null),
    ),
  );

  results.forEach((doc) => {
    if (doc) {
      profilesMap.set(doc.$id, profileDocToUser(doc as unknown as ProfileDoc));
    }
  });

  return profilesMap;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [profileData, setProfileData] = useState<ProfileDoc | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileData(null);
        return;
      }

      try {
        const profile = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_IDS.profiles,
          user.$id,
        );
        setProfileData(profile as unknown as ProfileDoc);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileData(null);
      }
    };

    fetchProfile();
  }, [user]);

  //useMemo instead of setCurrentUser
  const currentUser = useMemo(() => {
    if (!user || !profileData) return null;
    return profileDocToUser(profileData);
  }, [user, profileData]);

  const refreshCurrentUser = async () => {
    if (!user) return;

    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.profiles,
        user.$id,
      );
      setProfileData(profile as unknown as ProfileDoc);
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
        const result = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.follows,
          [Query.equal("follower_id", currentUser.id), Query.limit(500)],
        );

        const followingIds = new Set(
          result.documents.map((doc) => doc.following_id as string),
        );
        setFollowing(followingIds);
      } catch (error) {
        console.error("Error loading following:", error);
      }
    };

    loadFollowingData();
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      const postsResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.posts,
        [Query.orderDesc("created_at"), Query.limit(100)],
      );

      if (postsResult.documents.length === 0) {
        console.log("No posts found");
        setPosts([]);
        return;
      }

      // Batch-fetch all author profiles
      const authorIds = [
        ...new Set(postsResult.documents.map((doc) => doc.author_id as string)),
      ];
      const profilesMap = await fetchProfilesByIds(authorIds);

      const typedPosts = postsResult.documents as unknown as PostDoc[];

      const formattedPosts: Post[] = typedPosts.map((post) => ({
        id: post.$id,
        content: post.content,
        author: profilesMap.get(post.author_id) || {
          id: post.author_id,
          username: "Unknown",
          displayName: "Unknown User",
          avatar: null,
          bio: "",
          followers: 0,
          following: 0,
        },
        likes: post.likes_count || 0,
        createdAt: post.created_at,
        commentCount: post.comment_count || 0,
        imageUrl: post.image_url || null,
      }));

      setPosts(formattedPosts);

      //To get a set of currentusers liked posts for correct like tracking on frontend
      if (currentUser) {
        const likesResult = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.likes,
          [Query.equal("user_id", currentUser.id), Query.limit(500)],
        );

        const likedPostIds = new Set(
          likesResult.documents.map((doc) => doc.post_id as string),
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
          : post,
      ),
    );

    setFollowingPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.author.id === updatedUser.id
          ? { ...post, author: updatedUser }
          : post,
      ),
    );
  };

  const addPost = async (
    content: string,
    file?: File | null,
  ): Promise<{ success: boolean; post?: Post; error?: Error }> => {
    if (!currentUser) {
      return { success: false, error: new Error("No user logged in") };
    }
    try {
      const now = new Date().toISOString();

      const rawPostDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.posts,
        ID.unique(),
        {
          content: content.trim(),
          author_id: currentUser.id,
          created_at: now,
          likes_count: 0,
          comment_count: 0,
        },
      );
      const postDoc = rawPostDoc as unknown as PostDoc;

      let imageUrl: string | null = null;

      if (file) {
        try {
          const uploadedFile = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file,
          );

          imageUrl = storage
            .getFileView(BUCKET_ID, uploadedFile.$id)
            .toString();

          // Update the post with the image URL
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_IDS.posts,
            postDoc.$id,
            { image_url: imageUrl },
          );
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return { success: false, error: uploadError as Error };
        }
      }

      const newPost: Post = {
        id: postDoc.$id,
        content: postDoc.content,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          followers: currentUser.followers,
          following: currentUser.following,
        },
        likes: 0,
        createdAt: now,
        imageUrl: imageUrl || null,
      };

      setPosts((prev) => [newPost, ...prev]);

      //To trigger notifications for mentions in new post
      const mentionedUsernames = extractMentions(newPost.content);

      for (const username of mentionedUsernames) {
        try {
          const profileResult = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_IDS.profiles,
            [Query.equal("username", username.toLowerCase()), Query.limit(1)],
          );

          const mentionedUser = profileResult.documents[0];
          if (mentionedUser && mentionedUser.$id !== currentUser.id) {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_IDS.notifications,
              ID.unique(),
              {
                recipient_id: mentionedUser.$id,
                sender_id: currentUser.id,
                post_id: newPost.id,
                type: "mention",
                message: "mentioned you in a post.",
                is_read: false,
                created_at: new Date().toISOString(),
              },
            );
          }
        } catch (err) {
          console.error("Error creating mention notification:", err);
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
        // Check if like exists
        const likesResult = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.likes,
          [
            Query.equal("post_id", postId),
            Query.equal("user_id", currentUser.id),
            Query.limit(1),
          ],
        );

        const existingLike =
          likesResult.documents.length > 0 ? likesResult.documents[0] : null;
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
          }),
        );

        if (existingLike) {
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_IDS.likes,
            existingLike.$id,
          );

          const currentPost = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_IDS.posts,
            postId,
          );

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_IDS.posts,
            postId,
            {
              likes_count: Math.max(
                ((currentPost.likes_count as number) || 1) - 1,
                0,
              ),
            },
          );
        } else {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_IDS.likes,
            ID.unique(),
            {
              post_id: postId,
              user_id: currentUser.id,
            },
          );

          const currentPost = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_IDS.posts,
            postId,
          );

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_IDS.posts,
            postId,
            {
              likes_count: ((currentPost.likes_count as number) || 0) + 1,
            },
          );

          //Notification creation on like
          if (postAuthorId && postAuthorId !== currentUser.id) {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_IDS.notifications,
              ID.unique(),
              {
                recipient_id: postAuthorId,
                sender_id: currentUser.id,
                post_id: postId,
                type: "like",
                message: "liked your post",
                is_read: false,
                created_at: new Date().toISOString(),
              },
            );
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
      databases
        .listDocuments(DATABASE_ID, COLLECTION_IDS.likes, [
          Query.equal("user_id", currentUser.id),
          Query.limit(500),
        ])
        .then((result) => {
          const likedPostIds = new Set(
            result.documents.map((doc) => doc.post_id as string),
          );
          setUserLikes(likedPostIds);
        });
    } else {
      setUserLikes(new Set());
    }
  }, [currentUser]);

  //-----Comment functionality-----
  const fetchComments = async (postId: string) => {
    try {
      const commentsResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.comments,
        [
          Query.equal("post_id", postId),
          Query.orderAsc("created_at"),
          Query.limit(500),
        ],
      );

      if (commentsResult.documents.length === 0) {
        setComments((prev) =>
          prev.filter((comment) => comment.postId !== postId),
        );
        return;
      }

      const authorIds = [
        ...new Set(
          commentsResult.documents.map((doc) => doc.author_id as string),
        ),
      ];
      const authorsMap = await fetchProfilesByIds(authorIds);

      const formattedComments: Comment[] = commentsResult.documents.map(
        (doc) => ({
          id: doc.$id,
          content: doc.content as string,
          postId: doc.post_id as string,
          author: authorsMap.get(doc.author_id as string) || {
            id: doc.author_id as string,
            username: "Unknown",
            displayName: "Unknown User",
            avatar: null,
            bio: "",
            followers: 0,
            following: 0,
          },
          createdAt: doc.created_at as string,
          parentCommentId: (doc.parent_comment_id as string) || null,
        }),
      );

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
    parentCommentId?: string | null,
  ): Promise<{ success: boolean; comment?: Comment; error?: Error }> => {
    if (!currentUser) {
      return { success: false, error: new Error("No user logged in") };
    }

    try {
      const now = new Date().toISOString();

      const commentDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.comments,
        ID.unique(),
        {
          content: content.trim(),
          post_id: postId,
          author_id: currentUser.id,
          created_at: now,
          parent_comment_id: parentCommentId ?? undefined,
        },
      );

      const newComment: Comment = {
        id: commentDoc.$id,
        content: commentDoc.content as string,
        postId: commentDoc.post_id as string,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          followers: currentUser.followers,
          following: currentUser.following,
        },
        createdAt: now,
        parentCommentId: (commentDoc.parent_comment_id as string) || null,
      };

      setComments((prev) => [...prev, newComment]);

      //Notifications for mentions in new comment
      const mentionedUsernames = extractMentions(newComment.content);

      for (const username of mentionedUsernames) {
        try {
          const profileResult = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_IDS.profiles,
            [Query.equal("username", username.toLowerCase()), Query.limit(1)],
          );

          const mentionedUser = profileResult.documents[0];
          if (mentionedUser && mentionedUser.$id !== currentUser.id) {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_IDS.notifications,
              ID.unique(),
              {
                recipient_id: mentionedUser.$id,
                sender_id: currentUser.id,
                post_id: newComment.postId,
                comment_id: newComment.id,
                type: "mention",
                message: "mentioned you in a comment.",
                is_read: false,
                created_at: new Date().toISOString(),
              },
            );
          }
        } catch (err) {
          console.error("Error creating mention notification:", err);
        }
      }

      const post = getPostById(postId);
      const postAuthorId = post?.author.id;

      let parentCommentAuthorId: string | null = null;
      if (newComment.parentCommentId) {
        try {
          const parentComment = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_IDS.comments,
            newComment.parentCommentId,
          );

          parentCommentAuthorId = parentComment.author_id as string;
          //Only notify reply if not replying to self
          if (parentCommentAuthorId !== currentUser.id) {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_IDS.notifications,
              ID.unique(),
              {
                recipient_id: parentCommentAuthorId,
                sender_id: currentUser.id,
                post_id: postId,
                comment_id: newComment.id,
                type: "reply",
                message: newComment.content,
                is_read: false,
                created_at: new Date().toISOString(),
              },
            );
          }
        } catch (err) {
          console.error("Error creating reply notification:", err);
        }
      }

      //Only notify post author if not replying to authors comment (to avoid double notification)
      if (
        postAuthorId &&
        postAuthorId !== currentUser.id &&
        postAuthorId !== parentCommentAuthorId
      ) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_IDS.notifications,
          ID.unique(),
          {
            recipient_id: postAuthorId,
            sender_id: currentUser.id,
            post_id: postId,
            comment_id: newComment.id,
            type: "comment",
            message: newComment.content,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        );
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
      const followingResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.follows,
        [Query.equal("follower_id", currentUser.id), Query.limit(500)],
      );

      if (followingResult.documents.length === 0) {
        setFollowingPosts([]);
        return;
      }

      const followingIds = followingResult.documents.map(
        (doc) => doc.following_id as string,
      );

      // Fetch posts from followed users
      const postsResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.posts,
        [
          Query.equal("author_id", followingIds),
          Query.orderDesc("created_at"),
          Query.limit(100),
        ],
      );

      if (postsResult.documents.length > 0) {
        const authorIds = [
          ...new Set(
            postsResult.documents.map((doc) => doc.author_id as string),
          ),
        ];
        const profilesMap = await fetchProfilesByIds(authorIds);

        const transformedPosts: Post[] = postsResult.documents.map((post) => ({
          id: post.$id,
          content: post.content as string,
          createdAt: post.created_at as string,
          likes: (post.likes_count as number) || 0,
          commentCount: (post.comment_count as number) || 0,
          imageUrl: (post.image_url as string) || null,
          author: profilesMap.get(post.author_id as string) || {
            id: post.author_id as string,
            username: "Unknown",
            displayName: "Unknown User",
            avatar: null,
            bio: "",
            followers: 0,
            following: 0,
          },
        }));

        setFollowingPosts(transformedPosts);
      } else {
        setFollowingPosts([]);
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
        //Unfollow - find and delete the follow document
        const followResult = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.follows,
          [
            Query.equal("follower_id", currentUser.id),
            Query.equal("following_id", userId),
            Query.limit(1),
          ],
        );

        if (followResult.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_IDS.follows,
            followResult.documents[0].$id,
          );
        }

        setFollowing((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        //Follow
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_IDS.follows,
          ID.unique(),
          {
            follower_id: currentUser.id,
            following_id: userId,
          },
        );

        setFollowing((prev) => new Set(prev).add(userId));

        //Notification creation on follow
        if (userId !== currentUser.id) {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_IDS.notifications,
            ID.unique(),
            {
              recipient_id: userId,
              sender_id: currentUser.id,
              type: "follow",
              message: "started following you",
              is_read: false,
              created_at: new Date().toISOString(),
            },
          );
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
      const notificationsResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        [
          Query.equal("recipient_id", currentUser.id),
          Query.orderDesc("created_at"),
          Query.limit(50),
        ],
      );

      if (notificationsResult.documents.length === 0) {
        setNotifications([]);
        setUnreadNotificationCount(0);
        return;
      }

      //Get unique sender IDs
      const senderIds = [
        ...new Set(
          notificationsResult.documents.map((doc) => doc.sender_id as string),
        ),
      ];

      //Then get sender profiles separately
      const profilesMap = await fetchProfilesByIds(senderIds);

      const formattedNotifications: Notification[] =
        notificationsResult.documents.map((notif) => {
          const senderProfile = profilesMap.get(notif.sender_id as string);
          return {
            id: notif.$id,
            type: notif.type as "like" | "comment" | "follow",
            message: notif.message as string,
            isRead: notif.is_read as boolean,
            createdAt: notif.created_at as string,
            postId: (notif.post_id as string) || undefined,
            sender: {
              id: notif.sender_id as string,
              username: senderProfile?.username || "Unknown",
              displayName: senderProfile?.displayName || "Unknown User",
              avatar: senderProfile?.avatar || null,
            },
          };
        });

      setNotifications(formattedNotifications);
      setUnreadNotificationCount(
        formattedNotifications.filter((n) => !n.isRead).length,
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        notificationId,
        { is_read: true },
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;

    try {
      const unreadResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        [
          Query.equal("recipient_id", currentUser.id),
          Query.equal("is_read", false),
          Query.limit(100),
        ],
      );

      await Promise.all(
        unreadResult.documents.map((doc) =>
          databases.updateDocument(
            DATABASE_ID,
            COLLECTION_IDS.notifications,
            doc.$id,
            { is_read: true },
          ),
        ),
      );

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
    postId: string,
    imageUrl?: string | null,
  ): Promise<{ success: boolean; error?: Error }> => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.posts, postId);

      //To delete attached image from bucket
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split("/");
          const filesIndex = pathParts.indexOf("files");
          if (filesIndex !== -1 && pathParts[filesIndex + 1]) {
            const fileId = pathParts[filesIndex + 1];
            await storage.deleteFile(BUCKET_ID, fileId);
            console.log("Image deleted from storage:", fileId);
          }
        } catch (storageError) {
          console.error("Failed to delete image from storage:", storageError);
        }
      }

      // Clean up related documents (likes, comments, notifications)
      try {
        const relatedLikes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.likes,
          [Query.equal("post_id", postId), Query.limit(500)],
        );
        await Promise.all(
          relatedLikes.documents.map((doc) =>
            databases.deleteDocument(
              DATABASE_ID,
              COLLECTION_IDS.likes,
              doc.$id,
            ),
          ),
        );

        const relatedComments = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.comments,
          [Query.equal("post_id", postId), Query.limit(500)],
        );
        await Promise.all(
          relatedComments.documents.map((doc) =>
            databases.deleteDocument(
              DATABASE_ID,
              COLLECTION_IDS.comments,
              doc.$id,
            ),
          ),
        );
      } catch (cleanupError) {
        console.error("Error cleaning up related documents:", cleanupError);
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setFollowingPosts((prev) => prev.filter((post) => post.id !== postId));
      setComments((prev) =>
        prev.filter((comment) => comment.postId !== postId),
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting post:", error);
      return { success: false, error: error as Error };
    }
  };

  //Deleting comments
  const deleteComment = async (
    commentId: string,
  ): Promise<{ success: boolean; error?: Error }> => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_IDS.comments,
        commentId,
      );

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
