#!/usr/bin/env node
const { generateKeyPairSync } = require("crypto");
const fs = require("fs");
const path = require("path");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

const pubPath = path.resolve(process.cwd(), "vormia_public.pem");
const privPath = path.resolve(process.cwd(), "vormia_private.pem");

fs.writeFileSync(pubPath, publicKey);
fs.writeFileSync(privPath, privateKey);

console.log("\n✅ RSA key pair generated!");
console.log(`- Public key:   ${pubPath}`);
console.log(`- Private key:  ${privPath}`);
console.log("\nNext steps:");
console.log(
  "1. Copy the public key to your Laravel backend (e.g., .env or config)."
);
console.log(
  "2. Copy the private key to your frontend config (SSR/Node.js) or use with VormiaQuery."
);
console.log("3. Never expose your private key in client-side browser code!");
console.log("\nExample usage in .env:");
console.log("  # Backend (.env)");
console.log('  VORMIA_PUBLIC_KEY="<contents of vormia_public.pem>"');
console.log('  VORMIA_PRIVATE_KEY="<contents of vormia_private.pem>"');
console.log("\n  # Frontend (SSR/Node.js .env)");
console.log('  VORMIA_PRIVATE_KEY="<contents of vormia_private.pem>"');
console.log('  VORMIA_PUBLIC_KEY="<contents of vormia_public.pem>"');
console.log("\nFor more info, see the VormiaQuery README.");
