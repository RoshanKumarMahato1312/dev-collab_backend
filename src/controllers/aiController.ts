import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";

const explainSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1)
});

const generateSchema = z.object({
  prompt: z.string().min(3),
  language: z.string().min(1)
});

const CANDIDATE_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768"
];

const requestGroq = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  let lastError = "Unknown Groq error";
  let lastStatus = 502;

  for (const model of CANDIDATE_MODELS) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.groqApiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.2
      })
    });

    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    }

    const errorText = await response.text();
    lastStatus = response.status;
    lastError = errorText;

    const modelNotFound =
      (response.status === 400 || response.status === 404) &&
      (errorText.toLowerCase().includes("model") || errorText.toLowerCase().includes("not found") || errorText.toLowerCase().includes("does not exist"));

    if (!modelNotFound) {
      break;
    }
  }

  const mappedStatus = [400, 401, 403, 404, 429].includes(lastStatus) ? lastStatus : 502;
  throw { status: mappedStatus, error: lastError };
};

export const explainCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = explainSchema.parse(req.body);

    if (!env.groqApiKey) {
      res.status(400).json({ message: "GROQ_API_KEY is missing in server environment" });
      return;
    }

    const explanation = await requestGroq(
      "You explain code clearly and concisely for developers.",
      `Explain this ${body.language} code in simple terms and include key improvements:\n\n${body.code}`
    );

    res.json({ explanation: explanation || "No explanation generated" });
  } catch (error: any) {
    console.error("Groq explain failed:", error?.error ?? error);
    res.status(error?.status ?? 502).json({
      message: "Groq request failed",
      error: error?.error ?? "Unknown Groq error"
    });
  }
};

export const generateCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = generateSchema.parse(req.body);

    if (!env.groqApiKey) {
      res.status(400).json({ message: "GROQ_API_KEY is missing in server environment" });
      return;
    }

    const code = await requestGroq(
      "You write production-quality code. Return only code without markdown fences, no explanation text.",
      `Write ${body.language} code for this request:\n${body.prompt}`
    );

    res.json({ code: code ?? "" });
  } catch (error: any) {
    console.error("Groq generate failed:", error?.error ?? error);
    res.status(error?.status ?? 502).json({
      message: "Groq request failed",
      error: error?.error ?? "Unknown Groq error"
    });
  }
};
