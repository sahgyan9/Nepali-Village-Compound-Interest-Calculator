import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This server only exists to run the Vite dev middleware locally and to
// serve the static production build (`npm run build`). Calculation history
// lives entirely in the browser's localStorage (see App.tsx) - there is no
// API and no shared server-side data file, since the app is deployed as a
// static site (see vercel.json / `vite build`) where this server never runs.
async function startServer() {
  const app = express();
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    // Express 5 removed the bare '*' wildcard pattern; use a plain
    // fallback middleware so any unmatched GET request still serves the SPA shell.
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
