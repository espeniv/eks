export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  likes: number;
  replies: number;
  createdAt: string;
}
