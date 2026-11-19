// Local server: `npm start`, then open http://localhost:3000.
// On Vercel, public/ is served as static files and api/explain.js handles the API instead.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { explainSentence } from "./lib/lesson.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(here, "public")));

app.post("/api/explain", async (req, res) => {
  const { status, body } = await explainSentence(req.body);
  res.status(status).json(body);
});

app.listen(PORT, () => {
  console.log(`English Coach running at http://localhost:${PORT}`);
});
