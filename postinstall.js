import fs from "fs";
import path from "path";
import readline from "readline";

const stacks = [
  {
    name: "React",
    deps: ["@tanstack/react-query", "axios", "@tanstack/eslint-plugin-query"],
    detect: ["react", "react-dom"],
  },
  {
    name: "Vue",
    deps: ["@tanstack/vue-query", "axios", "@tanstack/eslint-plugin-query"],
    detect: ["vue"],
  },
  {
    name: "Svelte",
    deps: ["@tanstack/svelte-query", "axios", "@tanstack/eslint-plugin-query"],
    detect: ["svelte"],
  },
  {
    name: "Solid",
    deps: ["@tanstack/solid-query", "axios", "@tanstack/eslint-plugin-query"],
    detect: ["solid-js"],
  },
  {
    name: "Qwik",
    deps: ["@builder.io/qwik", "axios", "@tanstack/eslint-plugin-query"],
    detect: ["@builder.io/qwik"],
  },
];

function detectStack() {
  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const allDeps = Object.assign(
      {},
      pkg.dependencies,
      pkg.devDependencies,
      pkg.peerDependencies
    );
    for (const stack of stacks) {
      if (stack.detect.some((dep) => allDeps && allDeps[dep])) {
        return stack;
      }
    }
  } catch (e) {}
  return null;
}

console.log("\n🚀 VormiaQuery requires some peer dependencies for your stack.");
const detected = detectStack();
if (detected) {
  console.log(`Detected stack: ${detected.name}`);
  const deps = detected.deps.join(" ");
  console.log(
    `\nRun this command to install your dependencies:\n\nnpm install ${deps}\n`
  );
  console.log("If this is incorrect, you can select your stack below.");
}
console.log("Which stack are you using?");
stacks.forEach((s, i) => console.log(`${i + 1}. ${s.name}`));
console.log("0. Skip");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question(
  "Enter the number for your stack (or press Enter to accept detected): ",
  (answer) => {
    if (!answer.trim() && detected) {
      rl.close();
      return;
    }
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
  }
);
