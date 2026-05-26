import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const PORT = 3000;

const SYSTEM_INSTRUCTION = `
You are an AI financial assistant designed for small business (UMKM) users in Indonesia.
Your role is to act STRICTLY as a Linguistic Data Extractor and Intent Router.

CRITICAL RULE:
- Do NOT perform any mathematical calculations (addition, subtraction, multiplication, averages). All calculations and sums are handled murni by the client application (TypeScript).
- When a user asks about their financial stats, you must ONLY read the pre-computed totals from the "CURRENT FINANCIAL DATA CONTEXT" and present them clearly in Bahasa Indonesia inside the "message" field. Never try to calculate or count again.
- When the user wants to record a transaction, extract the values (amount, description, category, and type) purely from the text. 

TASKS:
1. Identify transactional intent:
   - "confirm": If the user is describing a physical transaction to record (e.g., "jual nasi 15 ribu", "beli bensin 20rb"). Extract the values into the "transactions" array.
   - "info": If the user asks about their financial status (e.g., "berapa total uang saya", "berapa pemasukan", "berapa sisa saldo"). Return status "info" and present the pre-computed numbers from context.
   - "navigate": If the user requests to see charts, graphs, or visual dashboard (e.g., "buka grafik", "lihat chart", "tampilkan tren"). Set status to "navigate" and direct them to the appropriate page.
   - "clarification": If the input is ambiguous or unclear.

2. For Transaction recording:
   - Extract exact numeric amount. Standardize words like "50 ribu" to 50000, "1.5 juta" to 1500000.
   - Determine category. Use only: "penjualan", "bahan baku", "operasional", "transportasi", "makanan", "lainnya".
   - Generate short Bahasa description.

3. For Financial queries:
   - Read and extract values directly from the supplied CURRENT FINANCIAL DATA CONTEXT.
   - Copy the numbers exactly as written in the context. DO NOT perform math.

4. For Navigation requests:
   - Determine which tab to go to:
     - "analytics" (charts, graphs, visualisasi, tren)
     - "dashboard" (dashboard, ringkasan, riwayat transaksi)
`;

// Lazy initialize Gemini clients safely
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    let key = process.env.GEMINI_API_KEY || "";
    
    // Sanitize any enclosing quotes
    key = key.trim();
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.substring(1, key.length - 1).trim();
    }

    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY tidak ditemukan atau masih menggunakan nilai default. Silakan periksa Panel Secrets Anda.");
    }
    
    // Safely log info on length and starts/ends characters to assist user diagnostics without exposing the key
    console.log(`[Diagnostic] API Key length is ${key.length}. Starts with: "${key.substring(0, 5)}", Ends with: "${key.substring(key.length - 4)}"`);

    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

function fallbackOfflineParser(message: string, context?: string): any {
  const msgLower = message.toLowerCase();

  // 1. Navigation requests fallback
  if (msgLower.includes("grafik") || msgLower.includes("chart") || msgLower.includes("tren") || msgLower.includes("visualisasi") || msgLower.includes("statistik")) {
    return {
      status: "navigate",
      targetTab: "analytics",
      message: "Mengalihkan Anda ke halaman Grafik & Visualisasi... 📈 (Mode Offline aktif karena API Key belum dimasukkan/tidak valid)."
    };
  }

  if (msgLower.includes("dashboard") || msgLower.includes("ringkasan") || msgLower.includes("riwayat")) {
    return {
      status: "navigate",
      targetTab: "dashboard",
      message: "Mengalihkan Anda ke halaman Dashboard... 📋 (Mode Offline aktif karena API Key belum dimasukkan/tidak valid)."
    };
  }

  // 2. Financial queries fallback
  if (msgLower.includes("saldo") || msgLower.includes("keuangan") || msgLower.includes("total uang") || msgLower.includes("sisa kas") || msgLower.includes("kas") || msgLower.includes("jumlah uang") || msgLower.includes("total penjualan") || msgLower.includes("total pembelian") || msgLower.includes("total pengeluaran") || msgLower.includes("total pemasukan") || msgLower.includes("pemasukan") || msgLower.includes("pengeluaran") || msgLower.includes("belanja")) {
    
    let incomeText = "belum tercatat / Rp 0";
    let expenseText = "belum tercatat / Rp 0";
    let balanceText = "Rp 0";
    
    if (context) {
      const incomeMatch = context.match(/Total Pemasukan:\s*([^\n]+)/i);
      const expenseMatch = context.match(/Total Pengeluaran:\s*([^\n]+)/i);
      const balanceMatch = context.match(/Sisa Uang \/ Saldo Kas:\s*([^\n]+)/i);
      
      if (incomeMatch) incomeText = incomeMatch[1].trim();
      if (expenseMatch) expenseText = expenseMatch[1].trim();
      if (balanceMatch) balanceText = balanceMatch[1].trim();
    }

    if (msgLower.includes("penjualan") || msgLower.includes("pemasukan")) {
      return {
        status: "info",
        message: `Berdasarkan data Anda saat ini, **total penjualan / pemasukan** bisnis Anda adalah **${incomeText}**. (Mode Offline. Aktifkan Gemini di panel Secrets/Settings untuk respon cerdas penuh!)`
      };
    }
    if (msgLower.includes("pengeluaran") || msgLower.includes("pembelian") || msgLower.includes("belanja") || msgLower.includes("beli")) {
      return {
        status: "info",
        message: `Berdasarkan data Anda saat ini, **total pengeluaran / pembelian** adalah **${expenseText}**. (Mode Offline. Aktifkan Gemini di panel Secrets/Settings untuk respon cerdas penuh!)`
      };
    }
    return {
      status: "info",
      message: `Statistik keuangan UMKM Anda saat ini:\n\n📈 **Pemasukan/Penjualan**: ${incomeText}\n📉 **Pengeluaran/Pembelian**: ${expenseText}\n💰 **Sisa Saldo Kas**: ${balanceText}\n\n*(Mode Offline. Hubungkan kunci API Gemini Anda di panel Secrets untuk mengaktifkan asisten AI pintar sepenuhnya!)*`
    };
  }

  // 3. Transaction recording fallback (e.g., "jual nasi 15 ribu", "beli bensin 20000")
  let amount = 0;
  const numRegex = /(\d+[\d\.,]*)\s*(ribu|rb|juta|jt)?/i;
  const numMatch = msgLower.match(numRegex);
  if (numMatch) {
    let rawNumStr = numMatch[1].replace(/\./g, "").replace(/,/g, ".");
    let rawNum = parseFloat(rawNumStr);
    if (!isNaN(rawNum)) {
      const scaleStr = (numMatch[2] || "").toLowerCase();
      if (scaleStr === "ribu" || scaleStr === "rb") {
        amount = rawNum * 1000;
      } else if (scaleStr === "juta" || scaleStr === "jt") {
        amount = rawNum * 1000000;
      } else {
        amount = rawNum;
        if (amount < 1000 && (msgLower.includes("ribu") || msgLower.includes("rb"))) {
          amount = amount * 1000;
        }
      }
    }
  }

  if (amount > 0) {
    const isExpense = msgLower.includes("beli") || msgLower.includes("belanja") || msgLower.includes("bayar") || msgLower.includes("pengeluaran") || msgLower.includes("biaya") || msgLower.includes("rugi") || msgLower.includes("gaji");
    const type = isExpense ? "expense" : "income";
    
    let category = "lainnya";
    let description = message;
    
    if (msgLower.includes("bensin") || msgLower.includes("solar") || msgLower.includes("transportasi") || msgLower.includes("ojek") || msgLower.includes("ongkir") || msgLower.includes("kirim")) {
      category = "transportasi";
    } else if (msgLower.includes("makan") || msgLower.includes("minum") || msgLower.includes("nasi") || msgLower.includes("kopi") || msgLower.includes("teh") || msgLower.includes("cemilan") || msgLower.includes("snack") || msgLower.includes("rokok")) {
      category = "makanan";
    } else if (msgLower.includes("sewa") || msgLower.includes("listrik") || msgLower.includes("air") || msgLower.includes("wifi") || msgLower.includes("internet") || msgLower.includes("telkom") || msgLower.includes("pajak")) {
      category = "operasional";
    } else if (msgLower.includes("bahan") || msgLower.includes("baku") || msgLower.includes("tepung") || msgLower.includes("gula") || msgLower.includes("beras") || msgLower.includes("telur") || msgLower.includes("plastik") || msgLower.includes("kemasan")) {
      category = "bahan baku";
    } else if (msgLower.includes("jual") || msgLower.includes("laku") || msgLower.includes("omset") || msgLower.includes("pesanan") || msgLower.includes("terima")) {
      category = "penjualan";
    }

    description = message.replace(/(beli|jual|belanja|bayar|pemasukan|pengeluaran)/i, "").trim();
    if (!description) description = type === "income" ? "Penjualan Barang" : "Pembelian Barang";

    return {
      status: "confirm",
      message: `[⚠️ Mode Offline] Berhasil mendeteksi transaksi Anda:\n\n• **Jenis**: ${type === 'income' ? '📈 Pemasukan' : '📉 Pengeluaran'}\n• **Jumlah**: Rp ${amount.toLocaleString('id-ID')}\n• **Kategori**: ${category}\n• **Keterangan**: "${description}"\n\nApakah data di atas sudah sesuai? (Klik setuju untuk menyimpan). *Hubungkan GEMINI_API_KEY Anda untuk asisten AI yang lebih interaktif.*`,
      transactions: [
        {
          type,
          amount,
          category,
          description
        }
      ]
    };
  }

  // General clarification if no match
  return {
    status: "clarification",
    message: "Halo! Saya adalah asisten keuangan UMKM Anda. Anda bisa mencatat transaksi (misal: 'jual kopi 15rb' atau 'beli bensin 20rb'), menanyakan total keuangan (misal: 'total penjualan saya'), atau minta diarahkan ke halaman grafik (misal: 'tampilkan grafik').\n\n*(ℹ️ Mode Offline aktif. Anda bisa memasukkan GEMINI_API_KEY di tab Secrets Anda untuk mengobrol pintar secara bebas dengan AI!)*"
  };
}



async function startServer() {
  const app = express();
  app.use(express.json());

  // Secure API endpoint for transaction parsing & intelligence
  app.post("/api/chat", async (req, res) => {
    const { message, context } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        status: "clarification",
        message: "Pesan tidak boleh kosong."
      });
    }

    try {
      const client = getAiClient();
      const finalSystemInstruction = SYSTEM_INSTRUCTION + (context ? `\n\nCURRENT FINANCIAL DATA CONTEXT:\n${context}` : '');

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash", // Use stable production model
        contents: message,
        config: {
          systemInstruction: finalSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: {
                type: Type.STRING,
                description: "Enum status: 'confirm' (recording transactions), 'clarification' (unclear input), 'info' (displaying precalculated financial metrics), or 'navigate' (forcing screen redirection)."
              },
              targetTab: {
                type: Type.STRING,
                description: "Target tab: either 'dashboard' or 'analytics'. Set only if status is 'navigate'."
              },
              message: {
                type: Type.STRING,
                description: "Clean Indonesian conversation response. If asked about financial totals, copy the exact pre-computed numbers from context. Never do mathematical sum/average yourself."
              },
              transactions: {
                type: Type.ARRAY,
                description: "Items to confirm/record. Set only if status is 'confirm'.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "type of transaction: 'income' or 'expense'."
                    },
                    amount: {
                      type: Type.NUMBER,
                      description: "Positive numeric value in rupiah."
                    },
                    category: {
                      type: Type.STRING,
                      description: "One of standard categories: 'penjualan', 'bahan baku', 'operasional', 'transportasi', 'makanan', or 'lainnya'."
                    },
                    description: {
                      type: Type.STRING,
                      description: "Short specific item description."
                    }
                  },
                  required: ["type", "amount", "category", "description"]
                }
              }
            },
            required: ["status", "message"]
          }
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Diterima respon kosong dari Gemini AI.");
      }

      const parsedJSON = JSON.parse(text);
      return res.json(parsedJSON);
    } catch (error: any) {
      const errMsg = error.message || String(error);
      console.warn("Gemini API parsing failed or was not configured. Falling back to robust Offline Rule-Based Parser. Error:", errMsg);
      
      const fallbackResult = fallbackOfflineParser(message, context);
      return res.json(fallbackResult);
    }
  });

  // Integration of Vite Dev Middleware / production static delivery
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static file delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted and listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
