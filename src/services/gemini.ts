import { AIResponse } from "../types";

export async function parseTransaction(message: string, context?: string): Promise<AIResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, context }),
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
