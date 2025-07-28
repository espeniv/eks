import Link from "next/link";

//Helper function to see age of posts and comments
export const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d`;
  } else {
    return postTime.toLocaleDateString();
  }
};

//To end notifications with a quotation mark after ...
export function truncateWithQuote(str: string, maxLength: number) {
  if (str.length <= maxLength) return str + '"';
  return str.slice(0, maxLength - 1) + '…"';
}

//Function to parse all text content that can possibly include a "@username" mention to create a link
export function parseMentions(text: string) {
  const mentionRegex = /@([a-zA-Z0-9_]{3,32})/g;
  const result = [];
  let lastIndex = 0;

  text.replace(mentionRegex, (match, username, index) => {
    if (index > lastIndex) {
      result.push(text.slice(lastIndex, index));
    }
    result.push(
      <Link
        key={index}
        href={`/profile/${username.toLowerCase()}`}
        className="text-orange-400 hover:text-orange-500"
      >
        @{username}
      </Link>
    );
    lastIndex = index + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}
