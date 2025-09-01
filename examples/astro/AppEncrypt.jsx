import { useVormiaQuery } from "vormiaqueryjs/astro";

export default function AppEncrypt() {
  const { data, isLoading, error } = useVormiaQuery({
    endpoint: "/categories",
    method: "GET",
    setEncrypt: true,
  });

  if (isLoading) return <div>Loading (encrypted)...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.response?.map((cat) => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  );
} 