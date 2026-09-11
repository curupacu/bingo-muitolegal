import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que o Next confunda a raiz do workspace com a home do usuário
  // (há um package-lock.json solto em C:\Users\guial, fora deste projeto).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
