import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "calculations.json");

// Ensure data file exists (sync on startup only)
if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Validate a Nepali date object shape
function isValidNepaliDate(d: unknown): d is { year: number; month: number; day: number } {
  if (typeof d !== "object" || d === null) return false;
  const obj = d as Record<string, unknown>;
  return (
    typeof obj.year === "number" && Number.isFinite(obj.year) &&
    typeof obj.month === "number" && obj.month >= 1 && obj.month <= 12 &&
    typeof obj.day === "number" && obj.day >= 1 && obj.day <= 32
  );
}

// Validate incoming calculation body
function validateCalculationBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return "Invalid request body";
  const b = body as Record<string, unknown>;

  if (typeof b.principal !== "number" || !Number.isFinite(b.principal) || b.principal <= 0)
    return "Principal must be a positive number";
  if (typeof b.monthlyInterestRate !== "number" || !Number.isFinite(b.monthlyInterestRate) || b.monthlyInterestRate < 0)
    return "Monthly interest rate must be a non-negative number";
  if (!isValidNepaliDate(b.startDate))
    return "Invalid start date";
  if (!isValidNepaliDate(b.endDate))
    return "Invalid end date";
  if (typeof b.result !== "object" || b.result === null)
    return "Invalid result object";

  return null; // valid
}

async function readData(): Promise<any[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeData(data: any[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "100kb" }));

  // API Routes
  app.get("/api/calculations", async (_req, res) => {
    try {
      const data = await readData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/calculations", async (req, res) => {
    try {
      const validationError = validateCalculationBody(req.body);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const { principal, monthlyInterestRate, startDate, endDate, result } = req.body;

      const newCalculation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        principal,
        monthlyInterestRate,
        startDate: { year: startDate.year, month: startDate.month, day: startDate.day },
        endDate: { year: endDate.year, month: endDate.month, day: endDate.day },
        result
      };

      const data = await readData();
      data.unshift(newCalculation);
      // Keep only last 50 calculations
      const limitedData = data.slice(0, 50);
      await writeData(limitedData);
      res.status(201).json(newCalculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.delete("/api/calculations/:id", async (req, res) => {
    try {
      const data = await readData();
      const filteredData = data.filter((item: any) => item.id !== req.params.id);
      await writeData(filteredData);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

