import { AIResponse, LedgerClone } from "../types";

export async function parseTransaction(message: string, context?: string, categories?: string[], books?: LedgerClone[]): Promise<AIResponse> {
  try {
    const customKey = localStorage.getItem("gemini_api_key") || "";
    
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gemini-Key": customKey,
      },
      body: JSON.stringify({ message, context, geminiApiKey: customKey, categories, books }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as AIResponse;
  } catch (error) {
    console.error("Error calling backend secure api chatbot proxy:", error);
    return {
      status: "clarification",
      message: "Maaf, tidak dapat terhubung ke asisten AI. Silakan cek koneksi atau apakah server berjalan.",
    };
  }
}
