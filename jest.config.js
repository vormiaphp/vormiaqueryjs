module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "svelte"],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transformIgnorePatterns: ["node_modules/(?!svelte|@sveltejs)/"],
};
