export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

/**
 * Representasi transaksi yang diekstrak secara linguistik oleh AI.
 * Semua perhitungan matematika (jumlah, saldo, dsb.) dilakukan murni di sisi client-side (TypeScript).
 */
export interface PendingTransaction {
  type: TransactionType;     // Jenis: 'income' atau 'expense'
  amount: number;             // Nominal angka pasti (Indonesian Rupiah)
  category: string;           // Kategori transaksi
  description: string;        // Keterangan/deskripsi singkat transaksi
}

/**
 * Format respon JSON ketat dari asisten AI.
 * AI hanya bertindak sebagai Pengekstrak Data Linguistik dan Router Navigasi.
 */
export interface AIResponse {
  status: 'confirm' | 'clarification' | 'info' | 'navigate';
  transactions?: PendingTransaction[];
  message: string;             // Pesan penjelasan atau konfirmasi dalam Bahasa Indonesia
  targetTab?: 'dashboard' | 'chat' | 'analytics';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pendingTransactions?: PendingTransaction[];
}
