export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <div>
      <h1>Profile: {params.username}</h1>
    </div>
  );
}
