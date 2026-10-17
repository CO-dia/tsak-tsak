import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Plusieurs layouts racines (site bilingue et admin) : 404 globale dans app/global-not-found.tsx.
    globalNotFound: true,
    serverActions: {
      // Téléversement des photos de produits depuis l’admin (10 Mo + marge).
      bodySizeLimit: "12mb",
    },
    // Les requêtes de l’admin passent par proxy.ts : même limite pour ne pas tronquer les photos.
    proxyClientMaxBodySize: "12mb",
  },
};

export default nextConfig;
