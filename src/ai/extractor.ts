import { zodToJsonSchema } from "zod-to-json-schema";
import { getGeminiClient } from "@/ai/client";
import { SYSTEM_PROMPT } from "@/ai/prompts";
import { getEnv } from "@/config/env";
import { extractedRequestSchema } from "@/schemas/request.schema";

export async function extractBusinessRequest(message: string) {
  const response = await getGeminiClient().models.generateContent({
    model: getEnv().GEMINI_MODEL,
    contents: [{
      role: "user",
      parts: [{ text: SYSTEM_PROMPT + "\n\nAnalyze this customer message. Extract only explicit facts:\n<customer_message>\n" + message + "\n</customer_message>" }],
    }],
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(extractedRequestSchema, { target: "openApi3" }),
    },
  });
  if (!response.text) throw new Error("Gemini returned an empty response");
  return extractedRequestSchema.parse(JSON.parse(response.text));
}