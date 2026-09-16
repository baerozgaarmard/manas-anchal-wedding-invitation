import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { weddingData } from "./src/data/weddingData.ts";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "invitation-fallback",
      transformIndexHtml(html) {
        return html.replaceAll(
          "__WEDDING_DATE__",
          `${weddingData.wedding.dateLabel}${weddingData.wedding.year ? ` ${weddingData.wedding.year}` : ""}`,
        );
      },
    },
  ],
});
