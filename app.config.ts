import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { beasties } from "vite-plugin-beasties";

export default defineConfig({
  tsr: {
    appDirectory: "./src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),

      beasties({
        options: {
          fonts: true,
          logger: {
            debug: (msg) => process.stdout.write(`[BEASTIES-DEBUG] ${msg}\n`),
            error: (msg) => process.stderr.write(`[BEASTIES-ERROR] ${msg}\n`),
            info: (msg) => process.stdout.write(`[BEASTIES-INFO] ${msg}\n`),
            trace: (msg) => process.stdout.write(`[BEASTIES-TRACE] ${msg}\n`),
            warn: (msg) => process.stderr.write(`[BEASTIES-WARN] ${msg}\n`),
          },
        },
      }),
    ],
  },
});
