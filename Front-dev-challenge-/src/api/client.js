import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const client = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 45000, // el analisis con LLM + scraping puede tomar unos segundos
});

export async function runAnalysis({ text, url }) {
  const { data } = await client.post("/analyses", { text, url });
  return data;
}

export async function fetchHistory(limit = 20) {
  const { data } = await client.get("/analyses", { params: { limit } });
  return data;
}

export default client;
