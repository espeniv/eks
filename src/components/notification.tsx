interface NotificationProps {
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

export function Notification({
  sender,
  type,
  message,
  isRead,
  createdAt,
  postId,
}: NotificationProps) {
  return <p>Test Notification</p>;
}
