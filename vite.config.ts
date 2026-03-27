import { cloudflare } from "@cloudflare/vite-plugin";
import { react as reactConfig } from "@kasoa/vite-plus-config/react";
import tailwindcss from "@tailwindcss/vite";
import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  ...reactConfig,
  plugins: [reactPlugin(), tailwindcss(), cloudflare()],
});
