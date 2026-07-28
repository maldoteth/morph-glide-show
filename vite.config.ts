import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { tmpdir } from "os";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// Generates sitemap.xml + llms.txt from src/lib/seo/routes.ts (single source of truth).
// Fails the build loudly if the registry drifts from the app's real routes.
const crawlAssets = (): Plugin => {
  const generate = (outDir: string) =>
    execFileSync("bun", ["scripts/generate-crawl-assets.ts", outDir], {
      stdio: "inherit",
      cwd: __dirname,
    });

  return {
    name: "pixcellor-crawl-assets",
    apply: () => true,
    closeBundle() {
      generate(path.resolve(__dirname, "dist"));
    },
    configureServer(server) {
      const devDir = path.join(tmpdir(), "pixcellor-crawl");
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        if (url !== "/sitemap.xml" && url !== "/llms.txt") return next();
        try {
          generate(devDir);
          const body = readFileSync(path.join(devDir, url.slice(1)));
          res.setHeader("Content-Type", url.endsWith(".xml") ? "application/xml" : "text/plain");
          res.end(body);
        } catch {
          next();
        }
      });
    },
  };
};

// Emits one static HTML file per indexable route (dist/<path>/index.html) with
// that route's real title, description, canonical, OG/Twitter card and JSON-LD,
// so JS-less social and AI crawlers see the right head. SPA bundles unchanged.
const prerenderRoutes = (): Plugin => ({
  name: "pixcellor-prerender-routes",
  apply: "build",
  closeBundle() {
    execFileSync("bun", ["scripts/prerender.ts", path.resolve(__dirname, "dist")], {
      stdio: "inherit",
      cwd: __dirname,
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin(), crawlAssets()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: ["es2020", "safari14"],
  },
  esbuild: {
    target: "es2020",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
}));
