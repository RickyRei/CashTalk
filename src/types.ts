export interface FinancialTarget {
  id: string;
  cloneId: string; // ID of the clone or 'all'
  name: string;
  type: 'saving' | 'budget_limit'; // saving logic vs spending limit logic
  targetAmount: number;
  currentAmount: number; // For savings: accumulated. For budgets: spent is computed dynamically
  category?: string; // Optional specific category to limit/track
  deadline?: string; // Target target date YYYY-MM-DD
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface LedgerClone {
  id: string;
  name: string;
  icon: string;
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
  date?: string;              // ISO string or YYYY-MM-DD string for custom dates
}

export interface AIEditTarget {
  id: string;
  originalDate?: string;
  originalAmount?: number;
  originalDescription?: string;
  originalCategory?: string;
  originalType?: TransactionType;
  newValues: {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
    type?: TransactionType;
  };
}

/**
 * Format respon JSON ketat dari asisten AI.
 * AI sekarang mendukung fungsi edit_confirm untuk mengubah data lama.
 */
export interface AIResponse {
  status: 'confirm' | 'edit_confirm' | 'clarification' | 'info' | 'advice' | 'navigate';
  transactions?: PendingTransaction[];
  message: string;             // Pesan penjelasan atau konfirmasi dalam Bahasa Indonesia
  targetTab?: 'dashboard' | 'chat' | 'analytics' | 'settings' | 'combined_summary';
  editTarget?: AIEditTarget;   // Target transaksi lama untuk diubah nilainya
  targetBookId?: string;       // ID buku tujuan jika terdeteksi dari pesan (opsional)
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pendingTransactions?: PendingTransaction[];
  editTarget?: AIEditTarget;
  targetBookId?: string;       // ID buku tujuan yang tersimpan (opsional)
}
