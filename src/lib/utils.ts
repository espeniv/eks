//Helper function to see age of posts and comments
export const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d`;
  } else {
    return postTime.toLocaleDateString();
  }
};
