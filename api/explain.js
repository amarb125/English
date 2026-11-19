// Vercel serverless function for POST /api/explain.
import { explainSentence } from "../lib/lesson.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  const { status, body } = await explainSentence(req.body);
  res.status(status).json(body);
}
