// app.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { beasties } from "vite-plugin-beasties";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "./src"
  },
  server: {
    preset: "bun"
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      tailwindcss(),
      beasties({
        options: {
          fonts: true,
          logger: {
            debug: (msg) => process.stdout.write(`[BEASTIES-DEBUG] ${msg}
`),
            error: (msg) => process.stderr.write(`[BEASTIES-ERROR] ${msg}
`),
            info: (msg) => process.stdout.write(`[BEASTIES-INFO] ${msg}
`),
            trace: (msg) => process.stdout.write(`[BEASTIES-TRACE] ${msg}
`),
            warn: (msg) => process.stderr.write(`[BEASTIES-WARN] ${msg}
`)
          }
        }
      })
    ]
  }
});
export {
  app_config_default as default
};
