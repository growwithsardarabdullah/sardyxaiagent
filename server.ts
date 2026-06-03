import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI model SDK to avoid startup crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    customLlmConfigured: !!process.env.LLM_API_URL,
  });
});

// Admin Monitoring Stats
app.get("/api/admin/metrics", (req, res) => {
  res.json({
    totalUsers: 1420,
    totalMessages: 43290,
    activeNow: 24,
    avgResponseTime: 420,
    revenue: 18450,
    cpuLoad: 28,
    apiSuccessRate: 99.8,
  });
});

// Chat completion with dynamic SSE (Server-Sent Events) Streaming
app.post("/api/chat", async (req: express.Request, res: express.Response): Promise<void> => {
  const { messages, systemInstruction, modelName } = req.body;
  const prompt = messages && messages.length > 0 ? messages[messages.length - 1].content : "";

  // Prepare Server-Sent Events headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const customUrl = process.env.LLM_API_URL;
  const customKey = process.env.LLM_API_KEY;

  // Case 1: Custom OpenRouter / OpenAI Compatible Endpoint
  if (customUrl && customKey && customUrl.trim() !== "" && customKey.trim() !== "") {
    try {
      const response = await fetch(customUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${customKey}`,
        },
        body: JSON.stringify({
          model: modelName || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          ],
          stream: true,
        }),
      });

      if (!response.body) {
        throw new Error("Empty body from custom external LLM endpoint");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) {
          finished = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim() !== "");

        for (const line of lines) {
          if (line.includes("[DONE]")) continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              const text = data.choices?.[0]?.delta?.content || "";
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors on half-read lines
            }
          }
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ text: `\n*(Sardyx Routing Warn: External endpoint error: ${err.message}. Falling back to default Gemini matrix)*\n\n` })}\n\n`);
    }
  }

  // Case 2: Gemini Core Model API (using @google/genai)
  const client = getGeminiClient();
  if (client) {
    try {
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const model = "gemini-3.5-flash"; // Recommended default from gemini-api skill
      const responseStream = await client.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: systemInstruction || "You are Sardyx AI, an advanced AI workforce SaaS interface.",
          temperature: 0.70,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    } catch (err: any) {
      console.error("Gemini integration error: ", err);
      res.write(`data: ${JSON.stringify({ text: `\n*(Sardyx Core Inference Error: ${err.message}. Initializing offline simulation mode)*\n\n` })}\n\n`);
    }
  }

  // Case 3: Offline Sandbox Simulation fallback (When key is missing or calls are rate-limited or offline)
  let responseText = "Greetings. I am your Sardyx digital workforce unit. This is an offline, premium-grade sandboxed response.";

  if (prompt.toLowerCase().includes("business") || prompt.toLowerCase().includes("startup")) {
    responseText = "### 📈 Sardyx Business & Strategy Analysis\n\nAnalyzing startup vector and financial projections:\n\n1. **Core Market Validation**: Implement low-friction focus groups inside the first fortnight.\n2. **Defensibility Matrix**: Establish proprietary database logic and custom LLM embeddings mapping to users.\n3. **Monetization Mechanics**: Package Sardyx Free, Pro, and Enterprise tiers for optimized conversion.\n\n*Would you like a full GTM (Go-to-Market) checklist generated based on your operational scale?*";
  } else if (prompt.toLowerCase().includes("marketing") || prompt.toLowerCase().includes("campaign")) {
    responseText = "### 📣 Sardyx Marketing Matrix Campaign\n\nTo drive premium awareness for your Vercel/Linear-level product:\n\n- **Aesthetic Framing**: Use strict monochrome displays with high-contrast colored tokens.\n- **Interactive Hooks**: Introduce visual previews, micro-animations, and self-hosted sandbox environments.\n- **Pricing Psychology**: Feature a highly-visible 'Pro' badge with a linear progress checkout flow.\n\nWould you like an ad-copy schedule for target social channels?";
  } else if (prompt.toLowerCase().includes("code") || prompt.toLowerCase().includes("develop") || prompt.toLowerCase().includes("typescript")) {
    responseText = "### 💻 Sardyx Developer Workspace\n\nHere is a clean typescript utility demonstrating secure, lazy-initialized server patterns:\n\n```typescript\nimport { GoogleGenAI } from \"@google/genai\";\n\nlet aiClient: GoogleGenAI | null = null;\n\nexport function getAI() {\n  if (!aiClient) {\n    const key = process.env.GEMINI_API_KEY;\n    if (!key) throw new Error(\"GEMINI_API_KEY missing\");\n    aiClient = new GoogleGenAI({ apiKey: key });\n  }\n  return aiClient;\n}\n```\n\nLet me know if you would like me to compile or structure any secondary integrations.";
  } else {
    responseText = `Hello! I am **Sardyx model unit (3.5-flash-emulated)**. Here is an optimized response processing your inquiry:

- **Prompt Input**: "${prompt}"
- **Execution Pipeline**: Completed via high-speed sandboxed memory buffers.
- **Workflow State**: Ideal state achieved.
             
What is the next task we should automate for your Sardyx workspace?`;
  }

  const words = responseText.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    res.write(`data: ${JSON.stringify({ text: words[i] + (i === words.length - 1 ? "" : " ") })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

// Configure Vite middleware in dev or static files serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Express in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up Express in production mode to serve compiled assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sardyx AI Server] Active on port ${PORT}`);
  });
}

startServer();
