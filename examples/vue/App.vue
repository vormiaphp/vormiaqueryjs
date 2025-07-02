<script setup>
import { useVormiaQuery } from "vormiaqueryjs/adapters/vue";

const { data, error, isLoading } = useVormiaQuery({
  endpoint: "/categories",
  method: "GET",
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="cat in data?.response" :key="cat.id">{{ cat.name }}</li>
  </ul>
</template>
