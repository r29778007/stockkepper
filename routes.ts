import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/download-zip", (_req, res) => {
    const zipPath = path.resolve(process.cwd(), "stock-manager.zip");
    res.download(zipPath, "stock-manager.zip");
  });

  const httpServer = createServer(app);

  return httpServer;
}
