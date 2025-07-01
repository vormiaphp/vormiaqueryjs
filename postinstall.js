const readline = require("readline");

const stacks = [
  {
    name: "React",
    deps: ["@tanstack/react-query", "axios", "@tanstack/eslint-plugin-query"],
  },
  {
    name: "Vue",
    deps: ["@tanstack/vue-query", "axios", "@tanstack/eslint-plugin-query"],
  },
  {
    name: "Svelte",
    deps: ["@tanstack/svelte-query", "axios", "@tanstack/eslint-plugin-query"],
  },
  {
    name: "Solid",
    deps: ["@tanstack/solid-query", "axios", "@tanstack/eslint-plugin-query"],
  },
  {
    name: "Qwik",
    deps: ["@builder.io/qwik", "axios", "@tanstack/eslint-plugin-query"],
  },
];

console.log("\n🚀 VormiaQuery requires some peer dependencies for your stack.");
console.log("Which stack are you using?");
stacks.forEach((s, i) => console.log(`${i + 1}. ${s.name}`));
console.log("0. Skip");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Enter the number for your stack: ", (answer) => {
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < stacks.length) {
    const deps = stacks[idx].deps.join(" ");
    console.log(
      `\nRun this command to install your dependencies:\n\nnpm install ${deps}\n`
    );
  } else {
    console.log("You can install your dependencies manually as needed.");
  }
  rl.close();
});
