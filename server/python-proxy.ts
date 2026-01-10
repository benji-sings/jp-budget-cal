import { createProxyMiddleware } from "http-proxy-middleware";
import type { Express, Request } from "express";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5001";

export function setupPythonProxy(app: Express) {
  const proxyMiddleware = createProxyMiddleware({
    target: PYTHON_BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/api",
    },
    on: {
      proxyReq: (proxyReq, req) => {
        const expressReq = req as Request;
        if (expressReq.body && Object.keys(expressReq.body).length > 0) {
          const bodyData = JSON.stringify(expressReq.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, _req, res) => {
        console.error("Proxy error:", err.message);
        if (res && "writeHead" in res) {
          (res as any).writeHead(502, { "Content-Type": "application/json" });
          (res as any).end(JSON.stringify({ error: "Python backend unavailable" }));
        }
      },
    },
  });

  app.use("/api", proxyMiddleware);
}
