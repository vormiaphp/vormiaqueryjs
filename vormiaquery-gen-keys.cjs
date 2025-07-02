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
  "1. Copy BOTH the public key and private key to your Laravel backend's .env or config (both are needed for encryption/decryption)."
);
console.log(
  '2. Copy the private key (and optionally the public key) to your frontend SSR/Node.js .env or config.\n   Example .env entries:\n   VORMIA_PRIVATE_KEY="<contents of vormia_private.pem>"\n   VORMIA_PUBLIC_KEY="<contents of vormia_public.pem>"'
);
console.log(
  "3. Never expose your private key in client-side browser code or commit it to version control!"
);
console.log(
  "4. Add .env, vormia_private.pem, and vormia_public.pem to your .gitignore."
);
console.log(
  "5. After copying, you may delete the generated key files from your project directory."
);
console.log("\nFor more info, see the VormiaQuery README.");
