export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  bio?: string;
  followers: number;
  following: number;
}
export interface Post {
  id: string;
  content: string;
  author: User;
  likes: number;
  createdAt: string;
  commentCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  createdAt: string;
  parentCommentId?: string | null;
}
