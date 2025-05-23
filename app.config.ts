import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { beasties } from "vite-plugin-beasties";

export default defineConfig({
  tsr: {
    appDirectory: "./src",
  },
  server: {
    preset: "bun",
  },
  vite: {
    // @ts-expect-error @tanstack/react-start uses `Omit` for server to limit me
    // from using `allowedHosts`, however it does seem to pass the values I
    // supply through - which is great because I need it to in order to let me
    // use ngrok with vite in dev mode
    server: {
      allowedHosts: ["564e-89-152-81-249.ngrok-free.app"],
    },
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
