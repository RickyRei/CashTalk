import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const PORT = 3000;

const SYSTEM_INSTRUCTION = `
You are an AI financial assistant designed for small business (UMKM) and personal finance users in Indonesia, named CashTalk.
Your role is to act as a supportive Financial Advisor, Intelligent Clerk, and Intent Router.

CRITICAL RULES:
1. COMMUNICATE BETTER & GIVE CONSTRUCTIVE FINANCIAL ADVICE (saran):
   - For regular conversations, advice, or general tips, talk elegantly and warmly in Bahasa Indonesia.
   - If the user greets you, asks for tips, or wants advice, provide actionable, realistic financial strategies (saran keuangan) based on their "CURRENT FINANCIAL DATA CONTEXT".
   - Use status "advice" for supportive conversational advice, or "info" for specific numeric queries.

2. TRANSACTION CONFIRMATION FORMAT (MANDATORY):
   - Whenever you detect a transaction and return status "confirm", your "message" field MUST follow this exact layout with no introductory words, no ending sentences, and no extra asterisks on labels:
     Transaksi Anda:

     • Jenis: [📉 Pengeluaran atau 📈 Pemasukan]
     • Jumlah: Rp [nominal formatted with dots, e.g. 20.000]
     • Kategori: [kategori]
     • Keterangan: "[keterangan]"
     (Optionally add: • Tanggal: YYYY-MM-DD if the transaction is backdated)

3. SMART FINANCIAL MATH & LOGIC:
   - You MUST perform smart calculations, calculations logic, and analysis. Walk the user through financial metrics, calculate percentages, profit margins, differences in balances, projections, or answer mathematical questions using the numbers from "CURRENT FINANCIAL DATA CONTEXT".

4. RECORD PAST-DATED TRANSACTIONS (Mencatat di tanggal lampau):
   - If the user records a transaction at a specific date (e.g. "tambah pemasukan 150rb tanggal 20 Februari 2026" or "pengeluaran bensin tgl 20/02/2026"), extract the correct past date in YYYY-MM-DD format.
   - Return status "confirm" and put this date in the "date" field of the transactions array item.

5. RECORD HISTORICAL AMENDMENTS/CORRECTIONS (Mengoreksi data lama):
   - If the user wants to EDIT, CORRECT, or DELETE an existing transaction (e.g., "koreksi bensin tgl 20/02/2026 yg tadinya 50rb jadi 60rb"), search the list of transactions.
   - Return status "edit_confirm".

6. INDONESIAN E-MONEY & DIGITAL WALLET (UANG DIGITAL) RULES:
   - For generic, incoming, or self top-ups like "top up 100k", "top up uang digital 200k", "isi saldo gopay 50k", or similar top-ups, treat it as an INCOME ("income") because it increases the digital wallet balance.
   - For outward top-ups or external services/merchants/gaming like "top up game", "top up shopee", "top up game mobile legends", or "top up lazada 100rb", treat it as an EXPENSE ("expense") because it represents spending wallet balance on third-party services.

INTENTS & STATUS VALUES:
- "confirm": To register one or more brand new transactions.
- "edit_confirm": To modify/fix an existing past transaction.
- "info": To explain current balances/metrics from context.
- "advice": To give business tips, advice, or suggestions.
- "navigate": To redirect. Can target 'dashboard', 'chat', 'analytics', or 'combined_summary'.
- "clarification": For ambiguous queries.
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

function fallbackOfflineParser(message: string, context?: string, categoriesList?: string[], booksList?: any[]): any {
  const msgLower = message.toLowerCase().trim();

  // Try to find matching targetBookId if booksList is present
  let targetBookId: string | null = null;
  if (booksList && Array.isArray(booksList)) {
    for (const b of booksList) {
      if (!b || !b.name) continue;
      const bookNameLower = b.name.toLowerCase().trim();
      // Look for whole match, partial match, or icon presence
      if (msgLower.includes(bookNameLower) || (b.icon && msgLower.includes(b.icon))) {
        targetBookId = b.id;
        break;
      }
    }
  }

  // 1. Greetings
  if (msgLower === "halo" || msgLower === "hai" || msgLower === "p" || msgLower === "hello" || msgLower === "hi" || msgLower.startsWith("selamat pagi") || msgLower.startsWith("selamat siang") || msgLower.startsWith("selamat sore") || msgLower.startsWith("selamat malam") || msgLower === "oi" || msgLower === "woy") {
    return {
      status: "clarification",
      message: "Halo! Saya adalah asisten keuangan UMKM Anda. Mau mencatat transaksi hari ini? Silakan ketik langsung, misal: 'jual kopi susu 15rb' atau 'beli bensin 20rb'!"
    };
  }

  // 2. Navigation requests
  if (msgLower === "grafik" || msgLower === "chart" || msgLower === "tren" || msgLower === "visualisasi" || msgLower === "statistik" || msgLower.includes("buka grafik") || msgLower.includes("ke grafik") || msgLower.includes("tampilkan grafik")) {
    return {
      status: "navigate",
      targetTab: "analytics",
      message: "Menyiapkan grafik analisis dan visualisasi keuangan Anda... 📊 Terbuka dalam hitungan detik!"
    };
  }

  if (msgLower === "dashboard" || msgLower === "ringkasan" || msgLower === "riwayat" || msgLower.includes("buka dashboard") || msgLower.includes("ke dashboard") || msgLower.includes("tampilkan dashboard")) {
    return {
      status: "navigate",
      targetTab: "dashboard",
      message: "Mengalihkan Anda kembali ke halaman utama Dashboard transaksi... 📋"
    };
  }

  if (msgLower === "pengaturan" || msgLower === "settings" || msgLower.includes("buka pengaturan") || msgLower.includes("ke pengaturan")) {
    return {
      status: "navigate",
      targetTab: "settings",
      message: "Membuka halaman Pengaturan & Secrets Anda... ⚙️"
    };
  }

  if (msgLower.includes("buku kas utama") || msgLower.includes("kembali ke luar") || msgLower.includes("buku besar") || msgLower.includes("ringkasan bento") || msgLower.includes("total semua buku") || msgLower.includes("buku kas gabungan")) {
    return {
      status: "navigate",
      targetTab: "combined_summary",
      message: "Membuka Dashboard Utama (Konsolidasi Buku Kas)... 📚"
    };
  }

  // 3. Simple transaction recording (e.g., "jual nasi goreng 15rb", "beli bensin 20000", "pemasukan katering 500rb", "pengeluaran sewa ruko 1.5jt")
  let isTransactionMatch = false;
  let type: "income" | "expense" = "income";
  let amount = 0;
  let description = "";
  let category = "lainnya";
  let transactionDate = "";

  // Regex to extract numbers: match integers/decimals with standard Indonesian formats (e.g. 150.000, 1,5jt, 50rb)
  const numRegex = /(?:rp\.?\s*)?(\d+[\d\.,]*)\s*(ribu|rb|juta|jt|k)?(?!\w)/gi;
  let match;
  let foundAmount = 0;
  let numIndex = -1;
  let numLength = 0;

  while ((match = numRegex.exec(msgLower)) !== null) {
    let rawNumStr = match[1].replace(/\./g, "").replace(/,/g, ".");
    let rawNum = parseFloat(rawNumStr);
    if (!isNaN(rawNum)) {
      const suffix = (match[2] || "").toLowerCase();
      let calculated = rawNum;
      if (suffix === "ribu" || suffix === "rb" || suffix === "k") {
        calculated = rawNum * 1000;
      } else if (suffix === "juta" || suffix === "jt") {
        calculated = rawNum * 1000000;
      } else if (calculated < 1000 && (msgLower.includes("ribu") || msgLower.includes("rb") || msgLower.includes(" rb") || msgLower.endsWith("rb") || msgLower.endsWith("k"))) {
        calculated = calculated * 1000;
      }
      
      // Filter out small digits used as system counters (e.g., Book 2, etc.) unless specifically suffixed (e.g., 20k)
      if (calculated >= 100 || suffix !== "") {
        foundAmount = calculated;
        numIndex = match.index;
        numLength = match[0].length;
        break; // Take primary valid transaction amount
      }
    }
  }

  if (foundAmount > 0) {
    amount = foundAmount;
    isTransactionMatch = true;

    // Special top-up rule checks for Indonesian Digital Wallet ("digital")
    const isTopUp = msgLower.includes("top up") || msgLower.includes("topup") || msgLower.includes("isi saldo");
    if (isTopUp) {
      // If it contains references to external gaming or merchants, it is an expense outflow!
      const externalGamingAndMerchants = [
        "game", "shopee", "shopeepay", "lazada", "tokopedia", "ml", "mobile legend", "free fire", "ff",
        "pubg", "steam", "grab", "gojek", "netflix", "spotify", "gopay customer", "isinya game"
      ];
      const isExternalTopUp = externalGamingAndMerchants.some(kw => msgLower.includes(kw));
      type = isExternalTopUp ? "expense" : "income";
    } else {
      // Detect if this is an Income or Expense based on typical Indonesian accounting/business keywords
      const incomeTerms = ["jual", "laku", "omset", "omzet", "terima", "masuk", "pemasukan", "untung", "pendapatan", "dapat", "customer", "pelanggan", "pesanan", "pembayaran"];
      const expenseTerms = ["beli", "bayar", "gaji", "belanja", "biaya", "ongkir", "kirim", "sewa", "pajak", "keluar", "pengeluaran", "tarik", "utang", "stok", "modal", "kulakan", "pulsa", "listrik", "air", "makan", "minum", "bensin", "baku", "tepung", "gula", "telur", "beras", "kemasan", "plastik"];

      const hasIncomeTerm = incomeTerms.some(term => msgLower.includes(term));
      const hasExpenseTerm = expenseTerms.some(term => msgLower.includes(term));

      if (hasIncomeTerm && !hasExpenseTerm) {
        type = "income";
      } else if (hasExpenseTerm && !hasIncomeTerm) {
        type = "expense";
      } else if (hasIncomeTerm && hasExpenseTerm) {
        // Find whichever matches first in sentence structure
        let firstIncomeIdx = Infinity;
        let firstExpenseIdx = Infinity;
        for (const term of incomeTerms) {
          const idx = msgLower.indexOf(term);
          if (idx !== -1 && idx < firstIncomeIdx) firstIncomeIdx = idx;
        }
        for (const term of expenseTerms) {
          const idx = msgLower.indexOf(term);
          if (idx !== -1 && idx < firstExpenseIdx) firstExpenseIdx = idx;
        }
        type = firstIncomeIdx < firstExpenseIdx ? "income" : "expense";
      } else {
        // Default fallback
        type = "expense";
      }
    }

    // Extract Date heuristics
    if (msgLower.includes("kemarin")) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      transactionDate = d.toISOString().split("T")[0];
    } else {
      const daysMatch = msgLower.match(/(\d+)\s*hari\s*lalu/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const d = new Date();
        d.setDate(d.getDate() - days);
        transactionDate = d.toISOString().split("T")[0];
      }
    }

    // Extract Description by cleaning up the currency portion and time tags
    let cleanedMsg = message;
    cleanedMsg = cleanedMsg.substring(0, numIndex) + cleanedMsg.substring(numIndex + numLength);

    // Remove dates/time indicators from description
    cleanedMsg = cleanedMsg.replace(/kemarin/gi, "")
                           .replace(/hari ini/gi, "")
                           .replace(/lusa/gi, "")
                           .replace(/\b\d+\s*hari\s*lalu\b/gi, "")
                           .replace(/\s+/g, " ")
                           .trim();

    const words = cleanedMsg.split(/\s+/);
    const stopWords = [
      "jual", "beli", "pemasukan", "pengeluaran", "bayar", "ongkir", "belanja", "gaji", "omset", "laku", "terima", "biaya", "tarik", "setor", "tambah",
      "untuk", "buat", "ke", "dari", "sebesar", "sebanyak", "dengan", "pada", "di"
    ];

    while (words.length > 0 && stopWords.includes(words[0].toLowerCase())) {
      words.shift();
    }

    description = words.join(" ").trim().replace(/[.,;?!]+$/, "").trim();

    if (!description) {
      description = type === "income" ? "Penjualan / Pemasukan" : "Pembelian / Pengeluaran";
    }

    // Map Category heuristics
    const descLower = description.toLowerCase();
    if (descLower.includes("bensin") || descLower.includes("solar") || descLower.includes("transport") || descLower.includes("ojek") || descLower.includes("ongkir") || descLower.includes("kirim") || descLower.includes("gojek") || descLower.includes("grab")) {
      category = "transportasi";
    } else if (descLower.includes("makan") || descLower.includes("minum") || descLower.includes("nasi") || descLower.includes("kopi") || descLower.includes("teh") || descLower.includes("cemilan") || descLower.includes("snack") || descLower.includes("rokok") || descLower.includes("bakso") || descLower.includes("mie") || descLower.includes("kuliner")) {
      category = "makanan";
    } else if (descLower.includes("sewa") || descLower.includes("listrik") || descLower.includes("air") || descLower.includes("wifi") || descLower.includes("internet") || descLower.includes("telpon") || descLower.includes("pajak") || descLower.includes("gaji") || descLower.includes("karyawan")) {
      category = "operasional";
    } else if (descLower.includes("bahan") || descLower.includes("baku") || descLower.includes("tepung") || descLower.includes("gula") || descLower.includes("beras") || descLower.includes("telur") || descLower.includes("plastik") || descLower.includes("kemasan") || descLower.includes("belanja modal") || descLower.includes("kayu") || descLower.includes("kertas")) {
      category = "bahan baku";
    } else if (descLower.includes("jual") || descLower.includes("laku") || descLower.includes("omset") || descLower.includes("omzet") || descLower.includes("customer") || descLower.includes("pelanggan") || descLower.includes("pesanan") || descLower.includes("kopi susu")) {
      category = "penjualan";
    }

    // Map to custom categories list if provided
    if (categoriesList && Array.isArray(categoriesList) && categoriesList.length > 0) {
      const matchedCat = categoriesList.find(c => descLower.includes(c.toLowerCase()));
      if (matchedCat) {
        category = matchedCat;
      } else {
        if (category === "transportasi" && !categoriesList.includes("transportasi")) {
          category = categoriesList.find(c => c.toLowerCase().includes("transport") || c.toLowerCase().includes("kirim")) || categoriesList[0];
        } else if (category === "makanan" && !categoriesList.includes("makanan")) {
          category = categoriesList.find(c => c.toLowerCase().includes("makan") || c.toLowerCase().includes("kopi") || c.toLowerCase().includes("konsumsi")) || categoriesList[0];
        } else if (category === "operasional" && !categoriesList.includes("operasional")) {
          category = categoriesList.find(c => c.toLowerCase().includes("operasional") || c.toLowerCase().includes("kantor") || c.toLowerCase().includes("sewa")) || categoriesList[0];
        } else if (category === "bahan baku" && !categoriesList.includes("bahan baku")) {
          category = categoriesList.find(c => c.toLowerCase().includes("bahan") || c.toLowerCase().includes("baku") || c.toLowerCase().includes("modal")) || categoriesList[0];
        } else if (category === "penjualan" && !categoriesList.includes("penjualan")) {
          category = categoriesList.find(c => c.toLowerCase().includes("jual") || c.toLowerCase().includes("omset") || c.toLowerCase().includes("pemasukan")) || categoriesList[0];
        } else if (!categoriesList.includes(category)) {
          category = categoriesList.includes("lainnya") ? "lainnya" : categoriesList[0];
        }
      }
    }
  }

  if (isTransactionMatch && amount > 0) {
    return {
      status: "confirm",
      message: `Transaksi Anda${transactionDate ? ' (' + transactionDate + ')' : ''}:\n\n• Jenis: ${type === 'income' ? '📈 Pemasukan' : '📉 Pengeluaran'}\n• Jumlah: Rp ${amount.toLocaleString('id-ID')}\n• Kategori: ${category}\n• Keterangan: "${description}"${transactionDate ? `\n• Tanggal: ${transactionDate}` : ''}`,
      transactions: [
        {
          type,
          amount,
          category,
          description,
          date: transactionDate
        }
      ],
      targetBookId
    };
  }

  // 4. Financial queries fallback
  if (msgLower === "saldo" || msgLower === "keuangan" || msgLower === "total uang" || msgLower === "sisa kas" || msgLower === "kas" || msgLower === "jumlah uang" || msgLower === "total penjualan" || msgLower === "total pembelian" || msgLower === "total pengeluaran" || msgLower === "total pemasukan" || msgLower === "pemasukan" || msgLower === "pengeluaran" || msgLower === "belanja") {
    
    let incomeText = "belum tercatat / Rp 0";
    let expenseText = "belum tercatat / Rp 0";
    let balanceText = "Rp 0";
    
    if (context) {
      const incomeMatch = context.match(/Total Pemasukan:\s*([^\n]+)/i);
      const expenseMatch = context.match(/Total Pengeluaran:\s*([^\n]+)/i);
      const balanceMatch = context.match(/Saldo Kas Saat Ini:\s*([^\n]+)/i);
      
      if (incomeMatch) incomeText = incomeMatch[1].trim();
      if (expenseMatch) expenseText = expenseMatch[1].trim();
      if (balanceMatch) balanceText = balanceMatch[1].trim();
    }

    if (msgLower.includes("penjualan") || msgLower.includes("pemasukan")) {
      return {
        status: "info",
        message: `Berdasarkan rangkuman buku kas aktif Anda saat ini:\n💰 **Total Pemasukan/Penjualan**: **${incomeText}**.`
      };
    }
    if (msgLower.includes("pengeluaran") || msgLower.includes("pembelian") || msgLower.includes("belanja") || msgLower.includes("beli")) {
      return {
        status: "info",
        message: `Berdasarkan catatan pengeluaran buku kas aktif Anda:\n💸 **Total Pengeluaran/Pembelian**: **${expenseText}**.`
      };
    }
    return {
      status: "info",
      message: `Berikut ringkasan saldo kas aktif Anda saat ini:\n\n📊 **Pemasukan**: ${incomeText}\n📉 **Pengeluaran**: ${expenseText}\n💰 **Sisa Saldo Kas**: **${balanceText}**`
    };
  }

  // Return null if not matched instantly, continuing to Gemini API
  return null;
}



async function startServer() {
  const app = express();
  app.use(express.json());

  // Secure API endpoint for transaction parsing & intelligence
  app.post("/api/chat", async (req, res) => {
    const { message, context, geminiApiKey, categories, books } = req.body;
    const headerKey = req.headers["x-gemini-key"];
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        status: "clarification",
        message: "Pesan tidak boleh kosong."
      });
    }

    // Determine the allowed categories list dynamically based on what the client provides
    const customCategoriesList: string[] = (categories && Array.isArray(categories) && categories.length > 0)
      ? categories.map((c: string) => c.toLowerCase().trim())
      : ["penjualan", "bahan baku", "operasional", "transportasi", "makanan", "lainnya"];

    const categoriesPromptStr = customCategoriesList.map(c => `"${c}"`).join(", ");

    // 1. FAST PATH CHECK: Parse unambiguous commands instantly to keep response time < 5ms
    const fastPathResult = fallbackOfflineParser(message, context, customCategoriesList, books);
    if (fastPathResult) {
      if (fastPathResult.transactions && fastPathResult.transactions.length > 0) {
        fastPathResult.transactions = fastPathResult.transactions.map((t: any) => {
          let mappedCategory = t.category;
          if (!customCategoriesList.includes(mappedCategory)) {
            mappedCategory = customCategoriesList.includes("lainnya") ? "lainnya" : (customCategoriesList[0] || "lainnya");
          }
          return { ...t, category: mappedCategory };
        });
      }
      return res.json(fastPathResult);
    }

    try {
      // Load user API key or fall back to native developer API key in process.env
      let finalKey = (typeof geminiApiKey === "string" && geminiApiKey.trim().length > 10) 
        ? geminiApiKey.trim() 
        : (typeof headerKey === "string" && headerKey.trim().length > 10)
          ? headerKey.trim()
          : "";

      let client: GoogleGenAI;
      if (finalKey) {
        client = new GoogleGenAI({ apiKey: finalKey });
      } else {
        client = getAiClient();
      }

      // Add information about active books if provided, allowing smart routing
      let booksText = "";
      if (books && Array.isArray(books) && books.length > 0) {
        booksText = `\n\nAVAILABLE BOOK LEDGERS / ACCOUNTS:\n` + 
          books.map((b: any) => `- ID: "${b.id}", Name: "${b.name}"`).join("\n") + 
          `\n\nIf the user specifies they want to save in a specific book (such as "buku pribadi" or "di toko"), detect which ID matches. Set the identified book ID in 'targetBookId'. If the user doesn't mention any specific book, or it's ambiguous, leave 'targetBookId' as empty or null and politely prompt them to select which book ledger to save to.`;
      }

      // Dynamically adapt SYSTEM_INSTRUCTION to include the user's customized categories and books list
      const adaptedSystemInstruction = SYSTEM_INSTRUCTION.replace(
        'Determine category. Use only the following configured business categories: ',
        `Determine category. Use only the following configured business categories: ${categoriesPromptStr}.`
      ) + (context ? `\n\nCURRENT FINANCIAL DATA CONTEXT:\n${context}` : '') + booksText + `
      
      STRICT CONCISENESS & SPEED RULE:
      Your responses MUST be extremely brief, short, and to-the-point (maximal 1-2 short sentences / maximal 25 words). 
      Jangan bertele-tele atau membuat paragraf panjang kecuali pengguna meminta saran detail secara eksplisit. Kecepatan respon adalah prioritas utama!`;

      // Invoke Gemini API with up to 2 retries on transient network/unavailability errors (e.g. 503 UNAVAILABLE or 429 RESOURCE_EXHAUSTED)
      let response;
      let attempts = 0;
      const maxAttempts = 3;
      let lastErr: any = null;

      while (attempts < maxAttempts) {
        try {
          response = await client.models.generateContent({
            model: "gemini-3.5-flash", // Use standard smart model as specified in the guidelines
            contents: message,
            config: {
              systemInstruction: adaptedSystemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  status: {
                    type: Type.STRING,
                    description: "Enum status: 'confirm' (new transaction), 'edit_confirm' (fixing an existing transaction), 'clarification' (unclear), 'info' (data/numbers), 'advice' (saran bantuan), or 'navigate'."
                  },
                  targetTab: {
                    type: Type.STRING,
                    description: "Target tab: 'dashboard', 'chat', 'analytics', 'settings', or 'combined_summary'. Set only if status is 'navigate'."
                  },
                  targetBookId: {
                    type: Type.STRING,
                    description: "The unique ID string matching the destination book detected from the message context (if any). Leave as empty or null if no book matches."
                  },
                  message: {
                    type: Type.STRING,
                    description: "Clean, warm, friendly Indonesian advice, feedback, or transactional confirmation message."
                  },
                  transactions: {
                    type: Type.ARRAY,
                    description: "Items to confirm/record. Set only if status is 'confirm'.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: {
                          type: Type.STRING,
                          description: "type: 'income' or 'expense'."
                        },
                        amount: {
                          type: Type.NUMBER,
                          description: "Positive numeric value in rupiah."
                        },
                        category: {
                          type: Type.STRING,
                          description: `Category identifier. Must match exactly one of: ${categoriesPromptStr}.`
                        },
                        description: {
                          type: Type.STRING,
                          description: "Short specific item description."
                        },
                        date: {
                          type: Type.STRING,
                          description: "Date formatted like YYYY-MM-DD. Extract past date ONLY if user specifies a backdated transaction. Otherwise default or empty."
                        }
                      },
                      required: ["type", "amount", "category", "description"]
                    }
                  },
                  editTarget: {
                    type: Type.OBJECT,
                    description: "Set ONLY if status is 'edit_confirm' to repair/modify a transaction.",
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: "The unique ID string matching the transaction being corrected."
                      },
                      originalDate: { type: Type.STRING },
                      originalAmount: { type: Type.NUMBER },
                      originalDescription: { type: Type.STRING },
                      originalCategory: { type: Type.STRING },
                      originalType: { type: Type.STRING },
                      newValues: {
                        type: Type.OBJECT,
                        description: "Object containing fields to update.",
                        properties: {
                          amount: { type: Type.NUMBER },
                          category: { type: Type.STRING },
                          description: { type: Type.STRING },
                          date: { type: Type.STRING, description: "YYYY-MM-DD" },
                          type: { type: Type.STRING, description: "'income' or 'expense'" }
                        }
                      }
                    },
                    required: ["id", "newValues"]
                  }
                },
                required: ["status", "message"]
              }
            },
          });
          break; // Succeeded! Break the retry loop
        } catch (err: any) {
          lastErr = err;
          attempts++;
          const errString = err.message || String(err);
          const isTransient = errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("429") || errString.includes("exhausted") || errString.includes("demand");
          
          if (isTransient && attempts < maxAttempts) {
            console.warn(`[Retry Warning] Gemini API call returned transient error. Attempt ${attempts} of ${maxAttempts}. Retrying in 750ms... Error:`, errString);
            await new Promise(resolve => setTimeout(resolve, 750));
          } else {
            throw err; // Maximum retries exceeded or non-transient error, escalate to the catch block
          }
        }
      }

      if (!response) {
        throw lastErr || new Error("Diterima respon kosong dari Gemini AI setelah beberapa kali pengulangan.");
      }

      const text = response.text;
      if (!text) {
        throw new Error("Diterima respon kosong dari Gemini AI.");
      }

      const parsedJSON = JSON.parse(text);
      return res.json(parsedJSON);
    } catch (error: any) {
      const errMsg = error.message || String(error);
      console.warn("Gemini API parsing failed or was not configured. Falling back to robust Offline Rule-Based Parser. Error:", errMsg);
      
      let fallbackResult = fallbackOfflineParser(message, context, customCategoriesList, books);
      
      if (!fallbackResult) {
        fallbackResult = {
          status: "clarification",
          message: "Maaf, sistem asisten AI sedang mengalami gangguan koneksi atau belum terkonfigurasi. Silakan periksa kembali Settings > Secrets jika Anda ingin mengaktifkan Gemini AI sepenuhnya."
        };
      }
      
      // Map the detected category to the closest match in custom categories if possible
      if (fallbackResult.transactions && fallbackResult.transactions.length > 0) {
        fallbackResult.transactions = fallbackResult.transactions.map((t: any) => {
          let mappedCategory = t.category;
          if (!customCategoriesList.includes(mappedCategory)) {
            mappedCategory = customCategoriesList.includes("lainnya") ? "lainnya" : (customCategoriesList[0] || "lainnya");
          }
          return { ...t, category: mappedCategory };
        });
      }

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
