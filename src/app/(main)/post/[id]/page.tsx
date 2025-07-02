export default function PostPage({ params }: { params: { postId: string } }) {
  return (
    <div>
      <h1>Profile: {params.postId}</h1>
    </div>
  );
}
