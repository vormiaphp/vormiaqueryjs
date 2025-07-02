import React from "react";
import { VormiaQueryProvider, useVrmQuery } from "vormiaqueryjs";

function CategoriesList() {
  const { data, isLoading, error } = useVrmQuery({
    endpoint: "/categories",
    method: "GET",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.response?.map((cat) => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <VormiaQueryProvider config={{ baseURL: "https://api.example.com" }}>
      <CategoriesList />
    </VormiaQueryProvider>
  );
}
