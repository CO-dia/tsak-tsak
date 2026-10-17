import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tsak Tsak",
    short_name: "Tsak Tsak",
    description: "Restaurant familial à Montréal : brunch, dîner et cuisine malagasy.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf6",
    theme_color: "#3b2a20",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
