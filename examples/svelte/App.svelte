<script>
  import { createVormiaStore } from "vormiaquery/adapters/svelte";
  const store = createVormiaStore({ endpoint: "/categories", method: "GET" });
</script>

{#if $store.loading}
  <p>Loading...</p>
{:else if $store.error}
  <p>Error: {$store.error.message}</p>
{:else}
  <ul>
    {#each $store as cat}
      <li>{cat.name}</li>
    {/each}
  </ul>
{/if}
