/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  History, 
  Check, 
  X,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Download,
  Upload,
  FileSpreadsheet,
  Info,
  Settings,
  Trash2,
  Palette,
  Key,
  Layers,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';
import { Transaction, Message, PendingTransaction, AIResponse, LedgerClone, AIEditTarget, FinancialTarget } from './types';
import { parseTransaction } from './services/gemini';

// Theme styles configuration dictionary mapping variables carefully to maintain pristine visual vibes
const themeStyles = {
  light: {
    container: "bg-slate-50 text-slate-900 border-slate-200",
    header: "bg-white/80 backdrop-blur-md border-b border-slate-200/60",
    headerText: "text-slate-900 font-semibold",
    headerSubText: "text-slate-500 font-medium",
    headerIcon: "bg-slate-900 text-white shadow-sm",
    card: "bg-white border border-slate-200/60 shadow-sm rounded-3xl",
    cardText: "text-slate-900",
    cardSubText: "text-slate-500 font-medium",
    balanceCard: "bg-slate-900 text-white shadow-lg border border-slate-800",
    balanceLabel: "text-slate-400 font-medium",
    btnSecondary: "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-2xl",
    btnPrimary: "bg-slate-900 text-white hover:bg-slate-800 rounded-2xl",
    nav: "bg-white border-t border-slate-200/60 shadow-lg shadow-slate-100",
    navActive: "text-slate-900 font-bold",
    navInactive: "text-slate-400 hover:text-slate-600",
    input: "bg-slate-100/80 text-slate-900 placeholder:text-slate-400 border border-slate-200/60 focus:bg-white focus:ring-slate-900 focus:border-slate-900",
    chatUser: "bg-slate-900 text-white rounded-tr-none shadow-sm",
    chatAssistant: "bg-white border border-slate-200/60 text-slate-900 rounded-tl-none shadow-sm",
    dialog: "bg-white border border-slate-200/80 shadow-2xl",
    border: "border-slate-200/60",
    badge: "bg-slate-100 text-slate-600 border border-slate-200/40 font-medium",
    incomeText: "text-emerald-600",
    expenseText: "text-rose-600",
    incomeBg: "bg-emerald-50 text-emerald-600",
    expenseBg: "bg-rose-50 text-rose-600",
    incomeBadge: "bg-emerald-600",
    expenseBadge: "bg-rose-600",
    incomeHex: "#059669",
    expenseHex: "#e11d48",
    incomeAreaFill: "rgba(5, 150, 105, 0.05)",
    expenseAreaFill: "rgba(225, 29, 72, 0.05)"
  },
  dark: {
    container: "bg-[#0b0f19] text-[#e3e8f4] border-[#1e293b]",
    header: "bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1e293b]",
    headerText: "text-slate-100 font-semibold",
    headerSubText: "text-slate-400 font-medium",
    headerIcon: "bg-white text-slate-900 shadow-inner",
    card: "bg-[#131b2e]/90 border border-[#22304d]/75 shadow-md shadow-black/20",
    cardText: "text-slate-100",
    cardSubText: "text-slate-400 font-medium",
    balanceCard: "bg-gradient-to-br from-[#1b253b] to-[#0f172a] text-white shadow-xl border border-slate-700/50",
    balanceLabel: "text-slate-400 font-medium",
    btnSecondary: "bg-[#1b253b] border border-[#2a3a5c] text-slate-100 hover:bg-[#233050] hover:border-slate-500",
    btnPrimary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    nav: "bg-[#0b0f19]/95 backdrop-blur-md border-t border-[#1e293b] shadow-2xl",
    navActive: "text-slate-100 font-bold",
    navInactive: "text-slate-500 hover:text-slate-400",
    input: "bg-[#080c14]/60 text-slate-100 placeholder:text-slate-500 border border-[#1e293b] focus:bg-[#080c14] focus:ring-indigo-400 focus:border-indigo-400",
    chatUser: "bg-indigo-600 text-white rounded-tr-none border border-indigo-500/80 shadow-md",
    chatAssistant: "bg-[#131b2e]/95 border border-[#22304d]/80 text-slate-100 rounded-tl-none shadow-lg",
    dialog: "bg-[#131b2e] border border-[#22304d] shadow-2xl shadow-black/60",
    border: "border-[#1e293b]",
    badge: "bg-[#16213a]/50 text-slate-300 border border-[#25375e]/60 font-medium",
    incomeText: "text-emerald-400",
    expenseText: "text-rose-400",
    incomeBg: "bg-emerald-500/10 text-emerald-400",
    expenseBg: "bg-rose-500/10 text-rose-400",
    incomeBadge: "bg-emerald-500",
    expenseBadge: "bg-rose-500",
    incomeHex: "#34d399",
    expenseHex: "#fb7185",
    incomeAreaFill: "rgba(52, 211, 153, 0.05)",
    expenseAreaFill: "rgba(251, 113, 133, 0.05)"
  },
  bebas: {
    container: "bg-[#071512] text-[#d6e5e1] border-[#112420]",
    header: "bg-[#071512]/90 backdrop-blur-md border-b border-[#112420]",
    headerText: "text-[#d6e5e1] font-semibold uppercase tracking-wider",
    headerSubText: "text-emerald-400/90 font-medium",
    headerIcon: "bg-[#34d399] text-teal-950 shadow-md shadow-emerald-400/10",
    card: "bg-[#0d211d]/90 border border-[#1a3832]/80 shadow-lg shadow-[#030807]/30",
    cardText: "text-emerald-50",
    cardSubText: "text-emerald-400/70 font-medium",
    balanceCard: "bg-gradient-to-br from-[#0c2f27] to-[#041210] text-[#d6e5e1] border border-[#1a3832]/50 shadow-xl",
    balanceLabel: "text-emerald-300 font-medium",
    btnSecondary: "bg-[#122e28]/80 border border-[#204a41] text-[#d6e5e1] hover:bg-[#1a3f37] hover:border-emerald-700/60 font-semibold",
    btnPrimary: "bg-[#34d399] text-emerald-950 hover:bg-[#2bc493] shadow-md font-bold",
    nav: "bg-[#071512]/95 backdrop-blur-md border-t border-[#112420] shadow-2xl",
    navActive: "text-[#34d399] font-bold",
    navInactive: "text-emerald-600/70 hover:text-emerald-400",
    input: "bg-[#040b09]/60 text-emerald-100 placeholder:text-emerald-800 border border-[#112420] focus:bg-[#040b09] focus:ring-[#34d399] focus:border-[#34d399]",
    chatUser: "bg-[#0d3b32] text-emerald-50 rounded-tr-none border border-emerald-800/40 shadow-sm",
    chatAssistant: "bg-[#0d211d]/95 border border-[#1a3832] text-emerald-50 rounded-tl-none shadow-md",
    dialog: "bg-[#0d211d] border border-[#1a3832] shadow-2xl",
    border: "border-[#1a3832]/60",
    badge: "bg-[#040b09] text-emerald-400 border border-[#0e241f] font-medium",
    incomeText: "text-emerald-400",
    expenseText: "text-rose-400",
    incomeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15",
    expenseBg: "bg-rose-500/10 text-rose-400 border border-rose-500/15",
    incomeBadge: "bg-emerald-400",
    expenseBadge: "bg-rose-500",
    incomeHex: "#34d399",
    expenseHex: "#fb7185",
    incomeAreaFill: "rgba(52, 211, 153, 0.05)",
    expenseAreaFill: "rgba(251, 113, 133, 0.05)"
  }
};

// Mock Daily Financial Tips for Indonesian UMKM to motivate and guide users
const financialTips = [
  {
    id: 1,
    title: "Pisahkan Rekening Pribadi & Usaha",
    content: "Jangan campur uang pribadi dan bisnis! Buat rekening terpisah agar aliran kas usaha terpantau secara akurat.",
    tag: "Fondasi"
  },
  {
    id: 2,
    title: "Sedia Kas Cadangan (Dana Darurat)",
    content: "Sisihkan minimal 10% keuntungan per bulan untuk dana cadangan usaha demi mengantisipasi masa sepi atau pengeluaran dadakan.",
    tag: "Proteksi"
  },
  {
    id: 3,
    title: "Pantau Piutang Secara Berkala",
    content: "Catat tenggat waktu piutang pelanggan dan lakukan penagihan berkala agar arus kas masuk usaha Anda tetap sehat.",
    tag: "Arus Kas"
  },
  {
    id: 4,
    title: "Evaluasi Pengeluaran Tiap Pekan",
    content: "Cek kembali pengeluaran kecil yang sering terabaikan. Penghematan kecil di beberapa pos operasional bisa menyelamatkan margin keuntungan.",
    tag: "Efisiensi"
  },
  {
    id: 5,
    title: "Gunakan Rumus Harga Jual yang Tepat",
    content: "Lakukan kalkulasi HPP (Harga Pokok Penjualan) secara mendalam termasuk biaya listrik, sewa, air, dan waktu tenaga kerja Anda.",
    tag: "Pricing"
  },
  {
    id: 6,
    title: "Catat Transaksi Tanpa Menunda",
    content: "Jangan tunda mencatat pemasukan atau pengeluaran kecil! Langsung rekam lewat chat CashTalk begitu transaksi selesai disepakati.",
    tag: "Disiplin"
  },
  {
    id: 7,
    title: "Kelola Stok Barang Secara Efisien",
    content: "Hindari menimbun barang yang lambat berputar (slow-moving). Putar modal Anda pada produk yang terbukti laku cepat.",
    tag: "Persediaan"
  }
];

export default function App() {
  const [clones, setClones] = useState<LedgerClone[]>(() => {
    const saved = localStorage.getItem('umkm_clones');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'pribadi', name: 'Keuangan Pribadi', icon: '💼' },
      { id: 'umkm', name: 'Pencatatan Toko/UMKM', icon: '🏪' },
      { id: 'digital', name: 'Dompet Uang Digital', icon: '📱' }
    ];
  });

  const [activeCloneId, setActiveCloneId] = useState<string>(() => {
    const saved = localStorage.getItem('umkm_active_clone_id');
    return saved && saved !== 'all' ? saved : 'pribadi';
  });

  const [selectedBookId, setSelectedBookId] = useState<string | null>(() => {
    const saved = localStorage.getItem('umkm_selected_book_id');
    return saved && saved !== 'all' ? saved : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsCloneId, setTransactionsCloneId] = useState<string>('');
  
  const [targets, setTargets] = useState<FinancialTarget[]>(() => {
    const saved = localStorage.getItem('umkm_targets');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'target_1', cloneId: 'pribadi', name: 'Tabungan Gadget Baru', type: 'saving', targetAmount: 3500000, currentAmount: 0 },
      { id: 'target_2', cloneId: 'umkm', name: 'Batas Belanja Operasional', type: 'budget_limit', targetAmount: 2000000, currentAmount: 0, category: 'operasional' }
    ];
  });

  // State control for adding target form
  const [showAddTargetForm, setShowAddTargetForm] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetType, setNewTargetType] = useState<'saving' | 'budget_limit'>('saving');
  const [newTargetAmount, setNewTargetAmount] = useState<string>('');
  const [newTargetCategory, setNewTargetCategory] = useState<string>('makanan');
  const [newTargetDeadline, setNewTargetDeadline] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesCloneId, setMessagesCloneId] = useState<string>('');
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'analytics' | 'settings'>('dashboard');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [newBookIconIdx, setNewBookIconIdx] = useState(1);
  const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % financialTips.length);
  
  // Custom API Key and dynamic product/cashflow categories setup
  const [theme, setTheme] = useState<'light' | 'dark' | 'bebas'>(() => {
    const saved = localStorage.getItem('umkm_theme');
    return (saved === 'dark' || saved === 'bebas' || saved === 'light') ? saved : 'light';
  });

  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [categories, setCategories] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Auto-dismiss setup using a clean effect to avoid racing timeouts
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Sync clones definition to disk
  useEffect(() => {
    localStorage.setItem('umkm_clones', JSON.stringify(clones));
  }, [clones]);

  // Sync active clone choice to disk
  useEffect(() => {
    localStorage.setItem('umkm_active_clone_id', activeCloneId);
  }, [activeCloneId]);

  // Sync selected book choice to disk and sync with activeCloneId
  useEffect(() => {
    if (selectedBookId) {
      localStorage.setItem('umkm_selected_book_id', selectedBookId);
      setActiveCloneId(selectedBookId);
    } else {
      localStorage.removeItem('umkm_selected_book_id');
      setActiveCloneId('all');
    }
  }, [selectedBookId]);

  // Sync theme changes to disk
  useEffect(() => {
    localStorage.setItem('umkm_theme', theme);
  }, [theme]);

  // Handle dynamic loading of transactions depending on activeCloneId
  useEffect(() => {
    if (activeCloneId === 'all') {
      // Load consolidated unified transactions from all clones combined
      const allTx: Transaction[] = [];
      clones.forEach(c => {
        const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
        if (saved) {
          allTx.push(...JSON.parse(saved));
        }
      });
      allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(allTx);
      setTransactionsCloneId('all');
    } else {
      const savedKey = `umkm_transactions_${activeCloneId}`;
      let saved = localStorage.getItem(savedKey);
      
      // Fallback migration: If we have no transactions in the new key, check if there are legacy transactions from of any prior version of the app to prevent user data loss
      if (!saved && activeCloneId === 'pribadi') {
        const legacy = localStorage.getItem('umkm_transactions');
        if (legacy) {
          localStorage.setItem(savedKey, legacy);
          saved = legacy;
        }
      }
      setTransactions(saved ? JSON.parse(saved) : []);
      setTransactionsCloneId(activeCloneId);
    }
  }, [activeCloneId, clones]);

  // Handle saving of active clone's specific transactions
  useEffect(() => {
    if (activeCloneId !== 'all' && activeCloneId === transactionsCloneId) {
      localStorage.setItem(`umkm_transactions_${activeCloneId}`, JSON.stringify(transactions));
    }
  }, [transactions, activeCloneId, transactionsCloneId]);

  // Sync targets list to disk
  useEffect(() => {
    localStorage.setItem('umkm_targets', JSON.stringify(targets));
  }, [targets]);

  // Handle loading and default-seeding of categories per active clone
  useEffect(() => {
    if (activeCloneId !== 'all') {
      const saved = localStorage.getItem(`umkm_categories_${activeCloneId}`);
      if (saved) {
        setCategories(JSON.parse(saved));
      } else {
        // Preset categories matching the specific ledger context
        const defaults = activeCloneId === 'pribadi'
          ? ['makanan', 'transportasi', 'kebutuhan', 'hiburan', 'investasi', 'lainnya']
          : ['penjualan', 'bahan baku', 'operasional', 'transportasi', 'makanan', 'lainnya'];
        setCategories(defaults);
      }
    } else {
      // Consolidated view category aggregate
      setCategories(['makanan', 'transportasi', 'operasional', 'penjualan', 'bahan baku', 'investasi', 'hiburan', 'lainnya']);
    }
  }, [activeCloneId]);

  // Handle saving of custom categories per clone
  useEffect(() => {
    if (activeCloneId !== 'all' && categories.length > 0) {
      localStorage.setItem(`umkm_categories_${activeCloneId}`, JSON.stringify(categories));
    }
  }, [categories, activeCloneId]);

  const currentChatId = activeChatId ? activeChatId : 'pribadi';

  // Handle loading message chats per currentChatId
  useEffect(() => {
    const saved = localStorage.getItem(`umkm_messages_${currentChatId}`);
    if (saved) {
      const parsed: Message[] = JSON.parse(saved).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      setMessages(parsed);
    } else {
      let welcomeText = "";
      if (currentChatId === 'dashboard_utama') {
        welcomeText = "Halo! Saya CashTalk 📚. Ini adalah obrolan utama Anda. Anda bisa mencatatkan transaksi langsung dari sini. Cukup sebutkan nama buku kas tujuan (misal: 'simpan di buku pribadi' atau 'masukkan ke toko'). Jika tidak terdeteksi, saya akan menanyakan tujuan bukunya dan Anda tinggal memilihnya! 😊";
      } else if (currentChatId === 'pribadi') {
        welcomeText = "Halo! Saya CashTalk 💼. Di sini saya siap membantu mendisiplinkan pencatatan pengeluaran & pemasukan keuangan Pribadi Anda semudah chatting!";
      } else {
        const bookName = clones.find(c => c.id === currentChatId)?.name || 'buku ini';
        welcomeText = `Halo! Saya CashTalk 🏪. Di sini saya siap mendampingi pembukuan finansial untuk buku kas "${bookName}". Kirimkan laporan atau transaksi di sini!`;
      }
      setMessages([
        {
          id: 'welcome_' + currentChatId,
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date()
        }
      ]);
    }
    setMessagesCloneId(currentChatId);
  }, [currentChatId, clones]);

  // Save conversation log per currentChatId
  useEffect(() => {
    if (messagesCloneId === currentChatId && messages.length > 0) {
      localStorage.setItem(`umkm_messages_${currentChatId}`, JSON.stringify(messages));
    }
  }, [messages, currentChatId, messagesCloneId]);

  // Calculations & Helpers (Optimized with useMemo to prevent recalculations on every component render/input typing)
  const { totalIncome, totalExpense, balance } = React.useMemo(() => {
    const inc = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
      
    const exp = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
      
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Memoized aggregator of financial records across all cash clones reactively
  const consolidatedMetrics = React.useMemo(() => {
    let globalInc = 0;
    let globalExp = 0;
    const items = clones.map(c => {
      const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
      const txs: Transaction[] = saved ? JSON.parse(saved) : [];
      let finalTxs = txs;
      
      // Fallback migration check
      if (txs.length === 0 && c.id === 'pribadi') {
        const legacy = localStorage.getItem('umkm_transactions');
        if (legacy) {
          finalTxs = JSON.parse(legacy);
        }
      }

      const inc = finalTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = finalTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      globalInc += inc;
      globalExp += exp;

      return {
        clone: c,
        income: inc,
        expense: exp,
        balance: inc - exp,
        txCount: finalTxs.length
      };
    });

    return {
      globalIncome: globalInc,
      globalExpense: globalExp,
      globalBalance: globalInc - globalExp,
      clonesSummary: items
    };
  }, [clones, transactions, activeCloneId]);

  const chatRoomMetrics = React.useMemo(() => {
    if (!activeChatId) return { income: 0, expense: 0, balance: 0 };
    const saved = localStorage.getItem(`umkm_transactions_${activeChatId}`);
    let txs: Transaction[] = saved ? JSON.parse(saved) : [];
    if (txs.length === 0 && activeChatId === 'pribadi') {
      const legacy = localStorage.getItem('umkm_transactions');
      if (legacy) txs = JSON.parse(legacy);
    }
    const inc = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income: inc,
      expense: exp,
      balance: inc - exp
    };
  }, [activeChatId, transactions, clones]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, activeChatId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let contextString = "";
      if (currentChatId === 'dashboard_utama') {
        const allBooksList = clones.map(c => {
          const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
          const txs: Transaction[] = saved ? JSON.parse(saved) : [];
          return {
            id: c.id,
            name: c.name,
            transactionsCount: txs.length,
            balance: txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
          };
        });

        contextString = `
        NAMA LEDGER PEMBUKUAN AKTIF: "Dashboard Utama (Konsolidasi Semua Buku Kas)"
        DAFTAR BUKU KAS YANG TERSEDIA DI RAK BUKU ANDA:
        ${JSON.stringify(allBooksList)}
        
        INFORMASI GLOBAL KONSOLIDASI:
        - Total Semua Pemasukan: ${formatCurrency(consolidatedMetrics.globalIncome)}
        - Total Semua Pengeluaran: ${formatCurrency(consolidatedMetrics.globalExpense)}
        - Total Semua Saldo Gabungan: ${formatCurrency(consolidatedMetrics.globalBalance)}
        - Total Buku Kas Aktif: ${clones.length} buku
        
        PETUNJUK PENTING BAGI ANDA (AI):
        - Pengguna sedang mengobrol dari halaman Dashboard Utama (Konsolidasi).
        - Anda HARUS mengidentifikasi buku kas tujuan penyimpanan transaksi ini berdasarkan isi pesan pengguna. Cocokkan nama buku kas secara fleksibel.
        - Jika terdeteksi/diarahkan dengan jelas ke suatu buku kas, kembalikan ID buku tersebut di kolom 'targetBookId'.
        - Jika pengguna TIDAK menyebutkan nama buku kas, atau masih ambigu, kosongkan 'targetBookId' (leave null/empty) dan tanyakan dengan ramah di dalam pesan untuk memastikan rincian buku kas mana yang mereka inginkan.
        `;
      } else {
        const activeCloneName = clones.find(c => c.id === currentChatId)?.name || 'Aktif';
        const savedTxs = localStorage.getItem(`umkm_transactions_${currentChatId}`);
        let chatTxList: Transaction[] = savedTxs ? JSON.parse(savedTxs) : [];
        if (chatTxList.length === 0 && currentChatId === 'pribadi') {
          const legacy = localStorage.getItem('umkm_transactions');
          if (legacy) chatTxList = JSON.parse(legacy);
        }
        
        const chatInc = chatTxList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const chatExp = chatTxList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const chatBal = chatInc - chatExp;

        const compactTxList = chatTxList.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date.split('T')[0]
        }));

        contextString = `
        NAMA LEDGER PEMBUKUAN AKTIF: "${activeCloneName}"
        STATISTIK BUKU KAS AKTIF SAAT INI:
        - Total Pemasukan: ${formatCurrency(chatInc)}
        - Total Pengeluaran: ${formatCurrency(chatExp)}
        - Saldo Kas Saat Ini: ${formatCurrency(chatBal)}
        - Jumlah Baris Data: ${chatTxList.length}
        
        DAFTAR SEMUA TRANSAKSI SEJARAH (COCOKKAN ID DI SINI UNTUK KOREKSI/MENGUBAH DATA):
        ${JSON.stringify(compactTxList)}
        `;
      }

      // Call server route which forwards to gemini-3.5-flash with customized guidelines
      const aiResponse: AIResponse = await parseTransaction(inputValue, contextString, categories, clones);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        pendingTransactions: aiResponse.transactions,
        editTarget: aiResponse.editTarget,
        targetBookId: aiResponse.targetBookId,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // If AI detects navigation intention, switch tabs
      if (aiResponse.status === 'navigate' && aiResponse.targetTab) {
        let dest = aiResponse.targetTab;
        showToast(`Mengalihkan Anda ke halaman ${dest === 'analytics' ? 'Grafik' : dest === 'settings' ? 'Pengaturan' : dest === 'combined_summary' ? 'Dashboard Utama' : 'Dashboard'}... 🗺️`, "info");
        
        setTimeout(() => {
          if (dest === 'combined_summary') {
            setSelectedBookId(null);
            setActiveTab('dashboard');
          } else if (dest === 'analytics') {
            setActiveTab('analytics');
          } else if (dest === 'settings') {
            setActiveTab('settings');
          } else {
            setActiveTab('dashboard');
          }
        }, 850);
      } else if (aiResponse.status === 'confirm' && aiResponse.transactions && aiResponse.transactions.length > 0) {
        showToast("Transaksi terdeteksi! Silakan klik 'Simpan' untuk mencatat. 💸", "success");
      } else if (aiResponse.status === 'edit_confirm' && aiResponse.editTarget) {
        showToast("Koreksi transaksi terdeteksi! Silakan klik 'Terapkan Koreksi' untuk mengubah data keuangan lama. 🔧", "success");
      }
    } catch (error) {
      console.error("Failed to process message:", error);
      showToast("Gagal memproses pesan via Gemini AI. Pastikan server aktif.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmTransactions = (pending: PendingTransaction[], messageId: string, customBookId?: string) => {
    // 1. Determine target book to save to
    const finalBookId = customBookId || activeChatId || selectedBookId || activeCloneId;
    if (!finalBookId || finalBookId === 'all') {
      showToast("⚠️ Silakan pilih buku kas tujuan terlebih dahulu.", "error");
      return;
    }

    // 2. Validation Layer - ensure all data properties extracted are clean and logical
    const validPending = pending.filter(p => {
      const isValidType = p.type === 'income' || p.type === 'expense';
      const isValidAmount = typeof p.amount === 'number' && p.amount > 0;
      const isValidDesc = typeof p.description === 'string' && p.description.trim().length > 0;
      return isValidType && isValidAmount && isValidDesc;
    });

    if (validPending.length === 0) {
      showToast("⚠️ Data transaksi tidak valid (Nominal tidak sesuai/kosong). Simpan dibatalkan.", "error");
      return;
    }

    // 3. Safe Identifier Generation supporting backdated custom dates
    const newTransactions: Transaction[] = validPending.map(p => ({
      type: p.type,
      amount: p.amount,
      category: p.category,
      description: p.description,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
    }));

    const targetBookName = clones.find(c => c.id === finalBookId)?.name || 'buku kas';

    // 4. Save transaction. If target is current active book, update local state directly
    if (finalBookId === activeCloneId) {
      setTransactions(prev => {
        const combined = [...newTransactions, ...prev];
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    } else {
      const savedKey = `umkm_transactions_${finalBookId}`;
      const existingRaw = localStorage.getItem(savedKey);
      const existing: Transaction[] = existingRaw ? JSON.parse(existingRaw) : [];
      const combined = [...newTransactions, ...existing].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(savedKey, JSON.stringify(combined));

      // Re-fetch consolidated list if at Dashboard Utama to stay absolutely in sync
      if (selectedBookId === null) {
        const allTx: Transaction[] = [];
        clones.forEach(c => {
          const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
          if (saved) {
            allTx.push(...JSON.parse(saved));
          }
        });
        allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(allTx);
      }
    }

    // Update message to show confirmed
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, pendingTransactions: undefined, content: `Selesai! Berhasil mencatatkan transaksi ke buku kas "${targetBookName}".` } : m
    ));
  };

  const cancelTransactions = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, pendingTransactions: undefined, content: 'Transaksi dibatalkan.' } : m
    ));
  };

  const confirmEditTransaction = (target: AIEditTarget, messageId: string) => {
    let foundBookId = "";

    // Find which book contain this transaction ID across all accounts
    for (const c of clones) {
      const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
      if (saved) {
        const txs: Transaction[] = JSON.parse(saved);
        if (txs.some(t => t.id === target.id)) {
          foundBookId = c.id;
          break;
        }
      }
    }

    if (!foundBookId && activeCloneId !== 'all') {
      foundBookId = activeCloneId;
    }

    if (foundBookId) {
      // 1. Update in targets localStorage (keeps integrity)
      const savedKey = `umkm_transactions_${foundBookId}`;
      const existingRaw = localStorage.getItem(savedKey);
      if (existingRaw) {
        const existing: Transaction[] = JSON.parse(existingRaw);
        const updated = existing.map(t => {
          if (t.id === target.id) {
            return {
              ...t,
              amount: target.newValues.amount !== undefined ? target.newValues.amount : t.amount,
              category: target.newValues.category !== undefined ? target.newValues.category : t.category,
              description: target.newValues.description !== undefined ? target.newValues.description : t.description,
              date: target.newValues.date !== undefined ? new Date(target.newValues.date).toISOString() : t.date,
              type: target.newValues.type !== undefined ? target.newValues.type : t.type,
            } as Transaction;
          }
          return t;
        });
        localStorage.setItem(savedKey, JSON.stringify(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
      }

      // 2. Also update live feed if active is matching
      if (foundBookId === activeCloneId) {
        setTransactions(prev => {
          const updated = prev.map(t => {
            if (t.id === target.id) {
              return {
                ...t,
                amount: target.newValues.amount !== undefined ? target.newValues.amount : t.amount,
                category: target.newValues.category !== undefined ? target.newValues.category : t.category,
                description: target.newValues.description !== undefined ? target.newValues.description : t.description,
                date: target.newValues.date !== undefined ? new Date(target.newValues.date).toISOString() : t.date,
                type: target.newValues.type !== undefined ? target.newValues.type : t.type,
              } as Transaction;
            }
            return t;
          });
          return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      }
    }

    // Refresh memory cache in aggregate view mode to trigger instant UI repaint
    if (activeCloneId === 'all') {
      const allTx: Transaction[] = [];
      clones.forEach(c => {
        const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
        if (saved) {
          allTx.push(...JSON.parse(saved));
        }
      });
      allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(allTx);
    }

    showToast("Transaksi berhasil dikoreksi! 🔧", "success");

    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, editTarget: undefined, content: 'Selesai! Data transaksi lama berhasil dikoreksi.' } : m
    ));
  };

  const cancelEditTransaction = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, editTarget: undefined, content: 'Koreksi transaksi lama dibatalkan.' } : m
    ));
  };

  const handleAddClone = () => {
    if (clones.length >= 5) {
      showToast("Maksimal adalah 5 buku kas (pembukuan).", "error");
      return;
    }
    setNewBookName("");
    setNewBookIconIdx(1);
    setShowAddBookModal(true);
  };

  const handleSaveNewBook = () => {
    if (clones.length >= 5) {
      showToast("Maksimal adalah 5 buku kas (pembukuan).", "error");
      return;
    }

    const trimmed = newBookName.trim();
    if (!trimmed) {
      showToast("Nama buku kas tidak boleh kosong.", "error");
      return;
    }

    if (clones.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast("Nama pembukuan sudah digunakan!", "error");
      return;
    }

    const icons = ["💼", "🏪", "🛒", "🏡", "💰", "🍽️", "🚗"];
    const icon = icons[newBookIconIdx] || "🏪";

    const newCloneId = `clone_${Date.now()}`;
    const newClone: LedgerClone = {
      id: newCloneId,
      name: trimmed,
      icon: icon
    };

    setClones(prev => [...prev, newClone]);
    setSelectedBookId(newCloneId);
    setShowAddBookModal(false);
    setNewBookName("");
    setNewBookIconIdx(1);
    showToast(`Buku kas baru "${trimmed}" berhasil dibuat! 🎉`, "success");
  };

  const handleDeleteClone = (id: string) => {
    const targetClone = clones.find(c => c.id === id);
    if (!targetClone) return;

    if (clones.length <= 1) {
      showToast("Tidak bisa menghapus. Anda wajib menyisakan minimal satu buku kas aktif.", "error");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus buku kas "${targetClone.name}" beserta SEMUA transaksi & chat log di dalamnya secara PERMANEN?`)) {
      setClones(prev => prev.filter(c => c.id !== id));
      setTargets(prev => prev.filter(t => t.cloneId !== id)); // Clear targets associated with this clone
      localStorage.removeItem(`umkm_transactions_${id}`);
      localStorage.removeItem(`umkm_messages_${id}`);
      localStorage.removeItem(`umkm_categories_${id}`);
      
      // Fallback selector
      const remaining = clones.filter(c => c.id !== id);
      if (selectedBookId === id) {
        setSelectedBookId(null);
        setActiveCloneId('all');
      } else {
        const nextActive = remaining.find(c => c.id === activeCloneId) ? activeCloneId : 'all';
        setActiveCloneId(nextActive);
      }
      showToast(`Buku pembukuan "${targetClone.name}" telah dihapus secara tuntas.`, "info");
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast("Transaksi berhasil dihapus.", "info");
    }
  };

  // Target Handlers & Computations
  const handleCreateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim()) {
      showToast("Nama target tidak boleh kosong.", "error");
      return;
    }
    const amt = parseFloat(newTargetAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Masukkan nominal target yang valid (> 0).", "error");
      return;
    }

    const newTarget: FinancialTarget = {
      id: `target_${Date.now()}`,
      cloneId: activeCloneId,
      name: newTargetName.trim(),
      type: newTargetType,
      targetAmount: amt,
      currentAmount: 0,
      category: newTargetType === 'budget_limit' ? newTargetCategory : undefined,
      deadline: newTargetDeadline ? newTargetDeadline : undefined
    };

    setTargets(prev => [...prev, newTarget]);
    
    // Reset Form Fields
    setNewTargetName('');
    setNewTargetAmount('');
    setNewTargetDeadline('');
    setShowAddTargetForm(false);
    
    showToast(`Target "${newTarget.name}" berhasil dibuat! 🎯`, "success");
  };

  const handleDeleteTarget = (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus target finansial ini?")) {
      setTargets(prev => prev.filter(t => t.id !== id));
      showToast("Target telah dihapus.", "info");
    }
  };

  const getTargetProgress = (tgt: FinancialTarget) => {
    if (tgt.type === 'saving') {
      let cloneBal = 0;
      if (tgt.cloneId === 'all') {
        cloneBal = consolidatedMetrics.globalBalance;
      } else if (tgt.cloneId === activeCloneId) {
        cloneBal = balance;
      } else {
        const cs = consolidatedMetrics.clonesSummary.find(item => item.clone.id === tgt.cloneId);
        cloneBal = cs ? cs.balance : 0;
      }
      return {
        current: Math.max(0, cloneBal),
        percentage: Math.min(100, Math.max(0, tgt.targetAmount > 0 ? (cloneBal / tgt.targetAmount) * 100 : 0))
      };
    } else {
      let cloneTxs: Transaction[] = [];
      if (tgt.cloneId === 'all') {
        clones.forEach(c => {
          const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
          if (saved) cloneTxs.push(...JSON.parse(saved));
        });
      } else if (tgt.cloneId === activeCloneId) {
        cloneTxs = transactions;
      } else {
        const saved = localStorage.getItem(`umkm_transactions_${tgt.cloneId}`);
        cloneTxs = saved ? JSON.parse(saved) : [];
      }

      const spent = cloneTxs
        .filter(t => t.type === 'expense' && (!tgt.category || t.category === tgt.category))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        current: spent,
        percentage: Math.min(100, tgt.targetAmount > 0 ? (spent / tgt.targetAmount) * 100 : 0)
      };
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast("Belum ada data transaksi untuk diekspor!", "error");
      return;
    }

    const headers = "ID Transaksi,Tanggal,Tipe,Kategori,Deskripsi,Jumlah (IDR)\n";
    const rows = transactions.map(t => {
      const dateStr = new Date(t.date).toLocaleDateString('id-ID');
      const typeStr = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      const cleanDesc = t.description.replace(/"/g, '""');
      const cleanCat = t.category.replace(/"/g, '""');
      return `${t.id},${dateStr},${typeStr},"${cleanCat}","${cleanDesc}",${t.amount}`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CashTalk_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Unduhan file CSV pembukuan dimulai! 📁", "success");
  };

  // CSV Import Parser with Robust Schema Validation & Error Reporting
  const parseCSVData = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        showToast("File CSV kosong atau tidak memiliki baris data.", "error");
        return;
      }

      const parsed: Transaction[] = [];
      let successCount = 0;
      let corruptCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Smart comma split respecting quotes
        const columns: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
          const char = line[charIndex];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        columns.push(cur.trim());

        // We require at least description, type, and amount
        if (columns.length < 3) {
          corruptCount++;
          continue;
        }

        let dateVal = new Date().toISOString();
        let typeVal: 'income' | 'expense' = 'expense';
        let catVal = 'lainnya';
        let descVal = 'Transaksi Impor';
        let amountVal = 0;

        if (columns.length >= 5) {
          // Format based on Export: ID Transaksi,Tanggal,Tipe,Kategori,Deskripsi,Jumlah
          const startIdx = columns.length === 6 ? 1 : 0;
          const rawDate = columns[startIdx];
          if (rawDate && !isNaN(Date.parse(rawDate))) {
            dateVal = new Date(rawDate).toISOString();
          }
          
          const rawType = (columns[startIdx + 1] || '').toLowerCase();
          typeVal = (rawType.includes('pemasukan') || rawType.includes('income') || rawType.includes('masuk')) ? 'income' : 'expense';
          
          catVal = columns[startIdx + 2] || 'lainnya';
          descVal = columns[startIdx + 3] || 'Transaksi Impor';
          
          const rawAmount = columns[startIdx + 4];
          amountVal = parseFloat(rawAmount?.replace(/[^0-9.-]+/g, "")) || 0;
        } else {
          // Fallback simple parsing (Tipe/Kategori, Deskripsi, Jumlah)
          const rawAmount = columns[columns.length - 1];
          amountVal = parseFloat(rawAmount?.replace(/[^0-9.-]+/g, "")) || 0;
          
          const rawType = (columns[0] || '').toLowerCase();
          typeVal = (rawType.includes('pemasukan') || rawType.includes('income') || rawType.includes('masuk')) ? 'income' : 'expense';
          
          descVal = columns[1] || 'Transaksi Impor';
          catVal = columns[2] || 'lainnya';
        }

        // Validate values strictly before pushing
        const isValidAmount = typeof amountVal === 'number' && amountVal > 0;
        const isValidDesc = descVal.trim().length > 0;

        // Verify incoming categories or fall back to 'lainnya'
        let cleanCategory = catVal.toLowerCase().trim();
        if (!categories.includes(cleanCategory)) {
          cleanCategory = categories.includes('lainnya') ? 'lainnya' : (categories[0] || 'lainnya');
        }

        if (isValidAmount && isValidDesc) {
          parsed.push({
            id: `imp_${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            date: dateVal,
            type: typeVal,
            category: cleanCategory,
            description: descVal,
            amount: amountVal
          });
          successCount++;
        } else {
          corruptCount++;
        }
      }

      if (successCount > 0) {
        setTransactions(prev => [...parsed, ...prev]);
        
        let reportMsg = `Berhasil mengimpor ${successCount} transaksi dari file CSV! 📑`;
        if (corruptCount > 0) {
          reportMsg += ` (${corruptCount} baris diabaikan karena format rusak).`;
        }
        
        setMessages(prev => [
          ...prev,
          {
            id: 'import_' + Date.now().toString(),
            role: 'assistant',
            content: reportMsg + ' Data Anda sudah tercatat di sistem kami.',
            timestamp: new Date()
          }
        ]);
        showToast(reportMsg, corruptCount > 0 ? "info" : "success");
      } else {
        showToast("⚠️ Gagal mengimpor. Tidak ada baris data valid yang ditemukan.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Terjadi kesalahan teknis saat membaca file CSV.", "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) parseCSVData(text);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input selection
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) parseCSVData(text);
      };
      reader.readAsText(file);
    }
  };

  // Save the user custom API key locally on their browser database
  const saveCustomKey = (key: string) => {
    const trimmed = key.trim();
    localStorage.setItem('gemini_api_key', trimmed);
    setCustomKey(trimmed);
    showToast("Kunci API Gemini berhasil disimpan! 🔑", "success");
    setMessages(prev => [
      ...prev,
      {
        id: 'api_' + Date.now().toString(),
        role: 'assistant',
        content: `Kunci API kustom terdeteksi dan diaktifkan. Saya sekarang beroperasi penuh menggunakan kecerdasan cerdas langsung Anda! ✨`,
        timestamp: new Date()
      }
    ]);
  };

  // Analytics helpers (Optimized using React.useMemo so calculations only re-run when transactions change)
  const categorySummary = React.useMemo(() => {
    return categories.map(cat => {
      const totalInc = transactions
        .filter(t => t.type === 'income' && t.category.toLowerCase().trim() === cat)
        .reduce((s, t) => s + t.amount, 0);
      const totalExp = transactions
        .filter(t => t.type === 'expense' && t.category.toLowerCase().trim() === cat)
        .reduce((s, t) => s + t.amount, 0);
      return {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        income: totalInc,
        expense: totalExp,
        total: totalInc + totalExp
      };
    }).filter(c => c.total > 0);
  }, [transactions, categories]);

  const trendData = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return days.map(day => {
      const inc = transactions
        .filter(t => t.type === 'income' && t.date.split('T')[0] === day)
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter(t => t.type === 'expense' && t.date.split('T')[0] === day)
        .reduce((s, t) => s + t.amount, 0);
      return {
        label: new Date(day).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        income: inc,
        expense: exp
      };
    });
  }, [transactions]);

  const maxTrendVal = React.useMemo(() => {
    return Math.max(...trendData.map(d => Math.max(d.income, d.expense)), 1000);
  }, [trendData]);

  // Load appropriate theme properties dictionary
  const styles = themeStyles[theme] || themeStyles.light;

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto shadow-2xl overflow-hidden relative transition-all duration-300 ${styles.container}`}>
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-[99] p-4 rounded-2xl shadow-xl flex items-center justify-between border text-xs font-bold bg-white"
            style={{
              borderColor: toast.type === 'error' ? '#fecaca' : toast.type === 'success' ? '#a7f3d0' : '#e2e8f0',
              color: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#059669' : '#334155'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Summary Modal */}
      <AnimatePresence>
        {showQuickSummary && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-[90] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${styles.dialog}`}
            >
              <div className="flex justify-between items-center mb-4 leading-none">
                <div className="flex items-center gap-2">
                  <Wallet className="text-emerald-500 shrink-0 animate-pulse" size={18} />
                  <h4 className={`font-bold text-sm ${styles.cardText}`}>Ringkasan Kas Cepat</h4>
                </div>
                <button 
                  onClick={() => setShowQuickSummary(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl ${styles.badge} border-none flex flex-col justify-center`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Saldo Aktif</p>
                  <p className={`text-2xl font-bold font-mono tracking-tight ${styles.cardText}`}>{formatCurrency(balance)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 border rounded-2xl ${styles.incomeBg} border-current/10`}>
                    <span className="text-[9px] font-bold uppercase block mb-1 opacity-80">Total Masuk</span>
                    <span className="text-xs font-bold font-mono">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className={`p-3 border rounded-2xl ${styles.expenseBg} border-current/10`}>
                    <span className="text-[9px] font-bold uppercase block mb-1 opacity-80">Total Keluar</span>
                    <span className="text-xs font-bold font-mono">{formatCurrency(totalExpense)}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Transaksi tercatat:</span>
                    <span className={`font-bold ${styles.cardText}`}>{transactions.length} kali</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Kategori aktif:</span>
                    <span className={`font-bold ${styles.cardText}`}>{categories.length} jenis</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowQuickSummary(false)}
                  className={`w-full py-3 mt-2 rounded-2xl font-bold text-xs cursor-pointer transition-colors ${styles.btnPrimary}`}
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Add Book Modal */}
      <AnimatePresence>
        {showAddBookModal && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-[92] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${styles.dialog}`}
            >
              <div className="flex justify-between items-center mb-5 leading-none">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <h4 className={`font-bold text-sm ${styles.cardText}`}>Buat Buku Kas Baru</h4>
                </div>
                <button 
                  onClick={() => setShowAddBookModal(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Input Name */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nama Buku Kas
                  </label>
                  <input
                    type="text"
                    value={newBookName}
                    onChange={(e) => setNewBookName(e.target.value)}
                    placeholder="Contoh: Warung Bakso, Keuangan Pribadi, Kos-Kosan, dsb."
                    className={`w-full p-3 rounded-2xl text-xs font-bold transition-all ${styles.input}`}
                    maxLength={30}
                    autoFocus
                  />
                </div>

                {/* Select Icon Emoji */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Pilih Emoji Sampul Buku
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["💼", "🏪", "🛒", "🏡", "💰", "🍽️", "🚗"].map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewBookIconIdx(idx)}
                        className={`text-xl p-2.5 rounded-2xl transition-all border flex items-center justify-center cursor-pointer ${
                          newBookIconIdx === idx
                            ? "bg-indigo-500/10 border-indigo-500 dark:border-sky-400 text-indigo-500 dark:text-sky-400 scale-110 shadow-sm"
                            : "bg-slate-500/5 hover:bg-slate-500/10 border-transparent text-slate-400"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddBookModal(false)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-colors ${styles.btnSecondary}`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveNewBook}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-colors ${styles.btnPrimary}`}
                  >
                    Buat Buku
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`p-6 border-b flex justify-between items-center z-10 ${styles.header} transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowQuickSummary(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer border border-transparent hover:scale-105 active:scale-95 ${styles.headerIcon}`}
            title="Klik untuk Ringkasan Cepat"
          >
            <Wallet size={18} />
          </button>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${styles.headerText}`}>CashTalk</h1>
            <p className={`text-[10px] uppercase font-bold tracking-widest ${styles.headerSubText}`}>Asisten Keuangan Pintar</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setActiveTab(activeTab === 'settings' ? 'dashboard' : 'settings')}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer border ${
              activeTab === 'settings'
                ? theme === 'bebas' 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
                  : theme === 'dark'
                    ? 'bg-slate-50 text-slate-950 border-white'
                    : 'bg-slate-900 text-white border-slate-900'
                : styles.btnSecondary
            }`}
            title="Pengaturan"
          >
            <Settings size={20} className={activeTab === 'settings' ? 'animate-spin-slow' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {dragActive && (
                <div className="absolute inset-4 z-50 rounded-3xl border-2 border-dashed border-indigo-500 bg-indigo-50/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-indigo-900">
                  <Upload size={40} className="mb-2 animate-bounce" />
                  <p className="font-bold text-sm">Taruh file CSV di sini!</p>
                  <p className="text-xs opacity-75 mt-1">Melepaskan berkas untuk mengimpor transaksi secara massal.</p>
                </div>
              )}

              {/* Title & Info Section */}
              {selectedBookId === null ? (
                <>
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h2 className={`text-[10px] font-bold opacity-80 uppercase tracking-widest ${styles.cardSubText}`}>
                        Gabungan Buku Kas
                      </h2>
                      <p className={`text-base font-bold mt-0.5 ${styles.cardText}`}>
                        Dashboard Utama
                      </p>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full ${styles.badge}`}>
                      ⏰ {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Consolidated Summary Cards */}
                  <div className="space-y-4">
                    <div className={`p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${styles.balanceCard}`}>
                      <div className="relative z-10">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${styles.balanceLabel}`}>
                          Total Saldo Gabungan (Netto)
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight font-mono">
                          {formatCurrency(consolidatedMetrics.globalBalance)}
                        </h2>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={80} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-3xl transition-all duration-300 ${styles.card}`}>
                        <div className={`flex items-center gap-2 mb-2 ${styles.incomeText}`}>
                          <div className={`p-1.5 rounded-full ${styles.incomeBg} border-none`}>
                            <TrendingUp size={14} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Total Masuk</span>
                        </div>
                        <p className={`text-base font-bold font-mono truncate ${styles.cardText}`}>
                          {formatCurrency(consolidatedMetrics.globalIncome)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-3xl transition-all duration-300 ${styles.card}`}>
                        <div className={`flex items-center gap-2 mb-2 ${styles.expenseText}`}>
                          <div className={`p-1.5 rounded-full ${styles.expenseBg} border-none`}>
                            <TrendingDown size={14} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Total Keluar</span>
                        </div>
                        <p className={`text-base font-bold font-mono truncate ${styles.cardText}`}>
                          {formatCurrency(consolidatedMetrics.globalExpense)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Exit Section & Back Button */}
                  <div className="flex justify-between items-center px-1">
                    <button
                      onClick={() => setSelectedBookId(null)}
                      className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-500/10 hover:bg-slate-500/15 text-slate-400 hover:text-indigo-500 dark:hover:text-sky-400 border border-slate-500/15"
                    >
                      <ArrowLeft size={14} />
                      <span>Kembali ke Dashboard</span>
                    </button>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full ${styles.badge}`}>
                      📚 {clones.find(c => c.id === selectedBookId)?.name || 'Buku Kas'}
                    </span>
                  </div>

                  {/* Header Title with Book Details */}
                  <div className="flex justify-between items-center px-0.5 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-2xl bg-indigo-500/10 dark:bg-sky-400/10 border border-indigo-500/15 dark:border-sky-400/10">
                        {clones.find(c => c.id === selectedBookId)?.icon || '🏪'}
                      </span>
                      <div>
                        <h2 className={`font-extrabold text-lg md:text-xl tracking-tight ${styles.cardText}`}>
                          {clones.find(c => c.id === selectedBookId)?.name || 'Buku Kas'}
                        </h2>
                        <p className={`text-[10px] uppercase tracking-wider font-extrabold mt-0.5 flex items-center gap-1 ${styles.cardSubText}`}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Halaman Pencatatan Finansial Aktif
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-4">
                    <div className={`p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${styles.balanceCard}`}>
                      <div className="relative z-10">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${styles.balanceLabel}`}>
                          Saldo Buku Kas
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight font-mono">
                          {formatCurrency(balance)}
                        </h2>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={80} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-3xl transition-all duration-300 ${styles.card}`}>
                        <div className={`flex items-center gap-2 mb-2 ${styles.incomeText}`}>
                          <div className={`p-1.5 rounded-full ${styles.incomeBg} border-none`}>
                            <TrendingUp size={14} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pemasukan</span>
                        </div>
                        <p className={`text-base font-bold font-mono truncate ${styles.cardText}`}>
                          {formatCurrency(totalIncome)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-3xl transition-all duration-300 ${styles.card}`}>
                        <div className={`flex items-center gap-2 mb-2 ${styles.expenseText}`}>
                          <div className={`p-1.5 rounded-full ${styles.expenseBg} border-none`}>
                            <TrendingDown size={14} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pengeluaran</span>
                        </div>
                        <p className={`text-base font-bold font-mono truncate ${styles.cardText}`}>
                          {formatCurrency(totalExpense)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 📚 Rak Buku Keuangan (Custom Clones Section) */}
              {selectedBookId === null && (
                <div className="space-y-3.5 pt-1">
                  <div className="flex flex-col gap-0.5 px-1">
                    <h3 className={`font-bold text-sm flex items-center gap-1.5 ${styles.cardText}`}>
                      Rak Buku Kas Anda
                    </h3>
                    <p className="text-[10px] text-slate-400">Pilih buku kas untuk melihat, mentarget, dan mencatatkan keuangan ({clones.length}/5 Buku)</p>
                  </div>

                  {/* Grid of Hardcover Books - Strictly 2 Columns */}
                  <div className="grid grid-cols-2 gap-5">
                    {clones.map((c, index) => {
                      const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
                      const txs = saved ? JSON.parse(saved) : [];
                      let finalTxs = txs;
                      if (txs.length === 0 && c.id === 'pribadi') {
                        const legacy = localStorage.getItem('umkm_transactions');
                        if (legacy) finalTxs = JSON.parse(legacy);
                      }
                      const inc = finalTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                      const exp = finalTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                      const bal = inc - exp;

                      // Creative hardcover spine colors matching index
                      const spineColors = [
                        'border-indigo-600',
                        'border-emerald-600',
                        'border-amber-600',
                        'border-rose-600',
                        'border-teal-600'
                      ];
                      const selectedSpineColor = spineColors[index % spineColors.length];

                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedBookId(c.id);
                          }}
                          className={`relative h-48 rounded-r-2xl border-l-[12px] transition-all duration-300 flex flex-col justify-between p-5 overflow-hidden cursor-pointer hover:scale-[1.03] hover:shadow-lg ${selectedSpineColor} ${
                            theme === 'dark'
                              ? 'bg-gradient-to-br from-[#131b2e] to-[#0a101f] border border-slate-800'
                              : theme === 'bebas'
                                ? 'bg-gradient-to-br from-[#0d211d] to-[#081512] border border-[#122e28]'
                                : 'bg-gradient-to-br from-slate-50 to-white border border-slate-200'
                          }`}
                        >
                          {/* Spines texture separator overlay */}
                          <div className="absolute top-0 bottom-0 left-0 w-[5px] bg-black/15" />

                          {/* Top corner content */}
                          <div className="space-y-2 relative z-10">
                            <div className="flex justify-end items-start h-6">
                              {clones.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClone(c.id);
                                  }}
                                  className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                  title="Hapus buku kas ini secara permanen"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                            
                            <div>
                              <h4 className={`font-bold text-sm md:text-base tracking-tight line-clamp-2 leading-tight ${styles.cardText}`}>
                                {c.name}
                              </h4>
                              <p className="text-[9.5px] text-slate-400 mt-1 font-semibold block uppercase tracking-wide">
                                {finalTxs.length} Transaksi Tercatat
                              </p>
                            </div>
                          </div>

                          {/* Book Ribbon / Realistic Bookmark decoration */}
                          <div className="absolute right-4 top-0 w-3.5 h-12 bg-indigo-500/15 dark:bg-sky-400/10 rounded-b-md border-b-2 border-indigo-500/30" />

                          {/* Real-time Cash Balance */}
                          <div className="relative z-10 border-t border-dashed border-slate-500/15 pt-2 mt-2">
                            <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400 leading-none">Saldo Buku Kas</p>
                            <p className={`font-mono text-xs md:text-sm font-bold mt-1 truncate ${bal >= 0 ? styles.incomeText : styles.expenseText}`}>
                              {formatCurrency(bal)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Clone/Book Trigger Slot (Max 5 clones constraint) */}
                    {clones.length < 5 && (
                      <div
                        onClick={handleAddClone}
                        className={`h-48 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:bg-slate-500/5 group border-slate-400/40`}
                        title="Klik untuk membuat buku baru"
                      >
                        <Plus size={24} className="text-slate-400 group-hover:text-slate-600 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">Tambah Buku</p>
                        <p className="text-[8.5px] text-slate-600 dark:text-slate-500 leading-none">Maksimal 5 buku kas ({clones.length}/5)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 🎯 Fitur Target & Anggaran Keuangan */}
              {selectedBookId !== null && (
                <>
                  <div className={`p-6 rounded-3xl space-y-4 ${styles.card}`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${styles.cardText}`}>
                      <span>🎯</span> Target & Anggaran Keuangan
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Pantau goals menabung atau batasi boros belanja bulanan secara otomatis.</p>
                  </div>
                  
                  <button
                    onClick={() => setShowAddTargetForm(!showAddTargetForm)}
                    className={`py-1.5 px-3 rounded-xl font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all ${styles.btnPrimary}`}
                  >
                    {showAddTargetForm ? <X size={12} /> : <Plus size={12} />}
                    <span>{showAddTargetForm ? 'Tutup Form' : 'Tambah Target'}</span>
                  </button>
                </div>

                {/* Create Target Embedded Interactive Form */}
                <AnimatePresence>
                  {showAddTargetForm && (
                    <motion.form 
                      onSubmit={handleCreateTarget}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl border ${styles.border} space-y-4 overflow-hidden bg-slate-500/5`}
                    >
                      <p className="text-[10px] font-bold text-indigo-500 dark:text-sky-400 uppercase tracking-widest leading-none">Buat Target Finansial Baru</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Target Name */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-slate-400 block">Nama Target / Sasaran</label>
                          <input 
                            type="text" 
                            value={newTargetName}
                            onChange={(e) => setNewTargetName(e.target.value)}
                            placeholder="Contoh: Tabungan Darurat, Limit Jajan Kuliner..."
                            className={`w-full text-xs py-2 px-3.5 rounded-xl outline-none focus:ring-1 ${styles.input}`}
                            required
                          />
                        </div>

                        {/* Target Type selector */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-slate-400 block pb-1">Jenis Target</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setNewTargetType('saving')}
                              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                                newTargetType === 'saving'
                                  ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]'
                                  : 'bg-transparent border-slate-700/60 text-slate-400'
                              }`}
                            >
                              💰 Target Menabung
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewTargetType('budget_limit')}
                              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                                newTargetType === 'budget_limit'
                                  ? 'bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]'
                                  : 'bg-transparent border-slate-700/60 text-slate-400'
                              }`}
                            >
                              ⚠️ Batas Belanja
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Amount */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-slate-400 block">Nominal Target (Rupiah)</label>
                          <input 
                            type="number" 
                            value={newTargetAmount}
                            onChange={(e) => setNewTargetAmount(e.target.value)}
                            placeholder="Nominal rupiah, misal: 2000000..."
                            className={`w-full text-xs py-2 px-3.5 rounded-xl outline-none focus:ring-1 ${styles.input}`}
                            required
                          />
                        </div>

                        {/* Category selection for budget limits */}
                        {newTargetType === 'budget_limit' && (
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-slate-400 block font-semibold">Tentukan Kategori Belanja</label>
                            <select
                              value={newTargetCategory}
                              onChange={(e) => setNewTargetCategory(e.target.value)}
                              className={`w-full text-xs py-2 px-3 rounded-xl outline-none border ${styles.border} ${styles.input}`}
                            >
                              {categories.map((cat, idx) => (
                                <option key={idx} value={cat} className="capitalize">{cat}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Deadline Date */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-slate-400 block">Batas Waktu (Opsional)</label>
                          <input 
                            type="date"
                            value={newTargetDeadline}
                            onChange={(e) => setNewTargetDeadline(e.target.value)}
                            className={`w-full text-xs py-1.5 px-3 rounded-xl outline-none border ${styles.border} ${styles.input}`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-dashed border-slate-700/40">
                        <button
                          type="button"
                          onClick={() => setShowAddTargetForm(false)}
                          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${styles.btnSecondary}`}
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className={`py-1.5 px-5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${styles.btnPrimary}`}
                        >
                          Simpan Target 🎯
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Target progress cards dynamic list query */}
                <div className="space-y-3 pt-1">
                  {targets.filter(t => activeCloneId === 'all' || t.cloneId === activeCloneId).length === 0 ? (
                    <div className={`text-center py-8 px-4 rounded-3xl border border-dashed text-slate-400 ${styles.border}`}>
                      <p className="text-[11px]">Belum ada target finansial di buku kas ini.</p>
                      <button
                        onClick={() => setShowAddTargetForm(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-2 cursor-pointer"
                      >
                        + Buat Target Pertama Anda!
                      </button>
                    </div>
                  ) : (
                    targets
                      .filter(t => activeCloneId === 'all' || t.cloneId === activeCloneId)
                      .map(t => {
                        const progress = getTargetProgress(t);
                        const isOverLimit = t.type === 'budget_limit' && progress.percentage >= 100;
                        const isNearingLimit = t.type === 'budget_limit' && progress.percentage >= 80 && progress.percentage < 100;
                        
                        return (
                          <div 
                            key={t.id}
                            className={`p-4 rounded-2xl border flex flex-col gap-3.5 relative overflow-hidden transition-shadow shadow-sm hover:shadow-md ${styles.card}`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl bg-slate-900 border border-slate-700/30 w-9 h-9 rounded-xl flex items-center justify-center shadow-inner">
                                  {t.type === 'saving' ? '💰' : '⚠️'}
                                </span>
                                <div>
                                  <h4 className={`font-bold text-xs truncate max-w-[190px] ${styles.cardText}`}>{t.name}</h4>
                                  <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">
                                    {t.type === 'saving' ? 'Target Tabungan' : `Limit Anggaran ${t.category ? `[${t.category}]` : '[Semua]'}`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {t.deadline && (
                                  <span className="text-[7.5px] font-bold font-mono py-0.5 px-2 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400 uppercase tracking-widest leading-none">
                                    📅 {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteTarget(t.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                  title="Hapus Target"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Dynamic Percentage Progress Tracking */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-mono leading-none">
                                <span className="text-slate-400">
                                  {t.type === 'saving' ? 'Terkumpul: ' : 'Terpakai: '}
                                  <span className={`font-bold ${t.type === 'saving' ? styles.incomeText : isOverLimit ? 'text-red-500' : isNearingLimit ? 'text-amber-500' : 'text-indigo-400'}`}>
                                    {formatCurrency(progress.current).replace('Rp', '').trim()}
                                  </span>
                                  <span> dari </span>
                                  <span className="font-bold text-slate-300">{formatCurrency(t.targetAmount).replace('Rp', '').trim()}</span>
                                </span>
                                <span className={`font-bold font-mono ${t.type === 'saving' ? styles.incomeText : isOverLimit ? 'text-rose-500 font-extrabold' : isNearingLimit ? 'text-amber-500' : 'text-indigo-400'}`}>
                                  {Math.round(progress.percentage)}%
                                </span>
                              </div>

                              {/* Progress bar container */}
                              <div className="w-full bg-slate-100/10 dark:bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-slate-200/5 dark:border-white/5 relative">
                                <div 
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    t.type === 'saving' 
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                      : isOverLimit
                                        ? 'bg-gradient-to-r from-rose-500 to-red-600'
                                        : isNearingLimit
                                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                                          : 'bg-gradient-to-r from-indigo-500 to-sky-450'
                                  }`} 
                                  style={{ width: `${progress.percentage}%` }} 
                                />
                              </div>

                              {/* Warnings labels and descriptive tags */}
                              {t.type === 'budget_limit' && (
                                <div className="text-[8px] font-semibold flex items-center gap-1.5 leading-none">
                                  {isOverLimit && (
                                    <span className="text-rose-400 uppercase tracking-widest animate-pulse font-extrabold">🚨 ANGGARAN MELEBIHI BATAS! HENTIKAN BELANJA KATEGORI INI!</span>
                                  )}
                                  {isNearingLimit && (
                                    <span className="text-amber-400 uppercase tracking-widest font-bold">⚠️ PERINGATAN: Pengeluaran sangat rentan (&gt; 80%)!</span>
                                  )}
                                  {!isOverLimit && !isNearingLimit && (
                                    <span className="text-slate-400 font-medium">✅ Pengeluaran aman dan terkendali di bawah limit anggaran.</span>
                                  )}
                                </div>
                              )}
                              
                              {t.type === 'saving' && (
                                <p className="text-[8px] text-slate-400 font-medium flex items-center gap-1 leading-none">
                                  <span>{progress.percentage >= 100 ? '🎉 Selamat! Target menabung ini sudah tercapai sepenuhnya!' : '📈 Saldo kas Anda berkontribusi langsung pada progres ini.'}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Daily Financial Tips Card */}
              <div className={`p-5 rounded-3xl space-y-4 transition-all duration-300 ${styles.card}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold flex items-center gap-2 text-sm ${styles.cardText}`}>
                    <Lightbulb size={18} className="text-amber-500 shrink-0" />
                    Tips Keuangan UMKM Harian
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-600 dark:text-amber-300 px-2.5 py-1 rounded-full leading-none">
                    {financialTips[tipIndex].tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className={`text-xs font-bold leading-tight ${styles.cardText}`}>
                    {financialTips[tipIndex].title}
                  </h4>
                  <p className={`text-[11px] leading-relaxed ${styles.cardSubText}`}>
                    {financialTips[tipIndex].content}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setTipIndex((prev) => (prev + 1) % financialTips.length)}
                    className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl font-bold text-[10px] transition-colors cursor-pointer ${styles.btnSecondary}`}
                  >
                    💡 Tip Lainnya
                  </button>
                </div>
              </div>

              {/* Transactions History List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className={`font-bold text-sm ${styles.cardText}`}>Riwayat Transaksi Terakhir</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.headerSubText}`}>{transactions.length} Transaksi</span>
                </div>

                <div className="space-y-2.5">
                  {transactions.length === 0 ? (
                    <div className={`text-center py-10 px-4 rounded-3xl border border-dashed text-slate-400 ${styles.border}`}>
                      <p className="text-xs">Belum ada transaksi. Silakan rekam via Chat!</p>
                    </div>
                  ) : (
                    transactions.slice(0, 8).map((t) => (
                      <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group relative border ${styles.card}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            t.type === 'income' ? styles.incomeBg : styles.expenseBg
                          }`}>
                            {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-xs truncate leading-none mb-1.5 ${styles.cardText}`}>{t.description}</p>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}>
                              {t.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className={`font-bold text-xs font-mono ${
                            t.type === 'income' ? styles.incomeText : styles.expenseText
                          }`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace('Rp', '').trim()}
                          </p>
                          <button 
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col"
            >
              {activeChatId === null ? (
                /* WhatsApp Chat List Screen */
                <div className="h-full flex flex-col overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
                  {/* WhatsApp Custom Header */}
                  <div className="flex items-center justify-between border-b border-slate-500/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <span className="text-3xl">💬</span>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
                      </div>
                      <div className="text-left">
                        <h3 className={`font-bold text-base ${styles.cardText}`}>Obrolan Finansial</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {clones.length} Chat Terhubung
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guidance Tip */}
                  <div className={`p-4 rounded-3xl text-left border ${styles.card} relative overflow-hidden bg-gradient-to-r from-emerald-500/5 via-indigo-500/5 to-transparent`}>
                    <p className={`text-xs leading-relaxed ${styles.cardText}`}>
                      Silakan pilih ruang obrolan di bawah ini untuk mencatatkan pemasukan dan pengeluaran secara terpisah. 
                    </p>
                    <p className={`text-[10px] mt-1 italic ${styles.cardSubText}`}>
                      Catatan pembukuan tersimpan murni dan terisolasi khusus di chat tersebut! ✨
                    </p>
                  </div>

                  {/* Contacts/Chat thread list */}
                  <div className="space-y-3.5 text-left">
                    {clones.map((c, index) => {
                      // Retrieve ledger transactions & metrics
                      const saved = localStorage.getItem(`umkm_transactions_${c.id}`);
                      const txs: Transaction[] = saved ? JSON.parse(saved) : [];
                      let finalTxs = txs;
                      if (txs.length === 0 && c.id === 'pribadi') {
                        const legacy = localStorage.getItem('umkm_transactions');
                        if (legacy) finalTxs = JSON.parse(legacy);
                      }
                      const inc = finalTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                      const exp = finalTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                      const bal = inc - exp;

                      // Retrieve last message and its time
                      const savedMsgs = localStorage.getItem(`umkm_messages_${c.id}`);
                      const msgs = savedMsgs ? JSON.parse(savedMsgs) : [];
                      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].content : "Ketik transaksi pertama Anda di sini...";
                      const lastMsgTime = msgs.length > 0 
                        ? new Date(msgs[msgs.length - 1].timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
                        : "Baru";

                      return (
                        <div
                          key={c.id}
                          onClick={() => setActiveChatId(c.id)}
                          className={`p-4 rounded-3xl border transition-all duration-300 flex items-center justify-between cursor-pointer hover:scale-[1.02] ${
                            theme === 'dark'
                              ? 'bg-[#131b2e] border-slate-800 hover:bg-[#1a253e]'
                              : theme === 'bebas'
                                ? 'bg-[#0d211d] border-[#122e28] hover:bg-[#14302b]'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {/* Left icon wrapper */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-indigo-500/10 border border-indigo-500/15">
                              {c.icon}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-extrabold border border-white dark:border-slate-900 shadow">
                              ✓
                            </span>
                          </div>

                          {/* Chat body details */}
                          <div className="flex-1 ml-4 pr-2">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold text-sm truncate max-w-[170px] ${styles.cardText}`}>{c.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono italic">{lastMsgTime}</span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 whitespace-pre-wrap leading-tight">
                              {lastMsg}
                            </p>
                          </div>

                          {/* Right side balance badge */}
                          <div className="shrink-0 flex flex-col items-end gap-1.5">
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full select-none ${
                              bal >= 0 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {formatCurrency(bal).replace('Rp', '').trim()}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* WhatsApp-Style Button to add new pocket / chat clone */}
                    {clones.length < 5 && (
                      <div
                        onClick={handleAddClone}
                        className={`p-4 rounded-3xl border border-dashed border-slate-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-slate-500/5`}
                      >
                        <Plus size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-400">Buat Dompet atau Chat Kas Baru</span>
                        <span className="text-[9px] text-slate-500">({clones.length}/5)</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* WhatsApp Specific Chat Room */
                <>
                  {/* Active Chat Header */}
                  {(() => {
                    const currentClone = clones.find(c => c.id === activeChatId);
                    return (
                      <div className={`p-4 border-b flex items-center justify-between transition-all duration-300 ${styles.header}`}>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setActiveChatId(null)}
                            className="p-1.5 bg-slate-500/10 hover:bg-slate-500/15 rounded-xl cursor-pointer transition-colors"
                          >
                            <ArrowLeft size={16} className={styles.headerText} />
                          </button>
                          
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-indigo-500/10 border border-indigo-500/15">
                            {currentClone?.icon || '🏪'}
                          </div>

                          <div className="text-left leading-none">
                            <h3 className={`font-bold text-sm ${styles.headerText}`}>{currentClone?.name || 'Buku Kas'}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className={`text-[10px] opacity-80 ${styles.headerSubText}`}>
                                Saldo: {formatCurrency(chatRoomMetrics.balance)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Extra indicators */}
                        <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider font-sans leading-none">
                          Whatsapp Mode
                        </div>
                      </div>
                    );
                  })()}

                  {/* Chat Messages scroll area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                        <p className="text-xs">Ketik pembukuan Anda sekarang.</p>
                        <code className="text-[10px] mt-1.5 block bg-black/5 dark:bg-black/30 p-2 rounded-xl text-left italic leading-relaxed max-w-[280px]">
                          "Dapat duit dari toko roti 250rb"<br/>
                          "Beli kertas bungkus pack 15rb"
                        </code>
                      </div>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-3xl p-4 transition-all duration-300 ${
                            m.role === 'user' ? styles.chatUser : styles.chatAssistant
                          }`}>
                            <p className="text-xs md:text-sm leading-relaxed whitespace-pre-line">{m.content}</p>
                            
                            {/* Confirmation UI (strictly simple save/cancel inside active clone chat) */}
                            {m.pendingTransactions && (
                              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in text-left">
                                {m.pendingTransactions.map((pt, idx) => (
                                  <div key={idx} className={`p-3 rounded-2xl border ${styles.dialog}`}>
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                        pt.type === 'income' ? styles.incomeBg : styles.expenseBg
                                      }`}>
                                        {pt.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                      </span>
                                      <span className={`font-bold text-sm font-mono ${styles.cardText}`}>{formatCurrency(pt.amount)}</span>
                                    </div>
                                    <p className={`text-xs font-bold mt-1 ${styles.cardText}`}>{pt.description}</p>
                                    <p className={`text-[10px] mt-1 italic ${styles.cardSubText}`}>Kategori: {pt.category}</p>
                                  </div>
                                ))}

                                <div className="flex gap-2 pt-1">
                                  <button 
                                    onClick={() => confirmTransactions(m.pendingTransactions!, m.id)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${styles.btnPrimary}`}
                                  >
                                    <Check size={14} /> Simpan
                                  </button>
                                  <button 
                                    onClick={() => cancelTransactions(m.id)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-slate-500 border border-slate-200 dark:border-slate-800 ${styles.btnSecondary}`}
                                  >
                                    <X size={14} /> Batal
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Confirmation edit transaction UI */}
                            {m.editTarget && (
                              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in text-left">
                                <div className={`p-3 rounded-2xl border ${styles.dialog}`}>
                                  <div className="flex justify-between items-start mb-1 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f43f5e]">KOREKSI TRANSAKSI</span>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 self-start ${
                                        m.editTarget.originalType === 'income' ? styles.incomeBg : styles.expenseBg
                                      }`}>
                                        {m.editTarget.originalType === 'income' ? 'Pemasukan' : 'Pengeluaran'} → {m.editTarget.newValues.type || m.editTarget.originalType}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1 mt-2 text-xs text-slate-400">
                                    <p>Deskripsi: <span className="font-bold text-slate-600 dark:text-slate-200">{m.editTarget.originalDescription} → {m.editTarget.newValues.description || m.editTarget.originalDescription}</span></p>
                                    <p>Jumlah: <span className="font-bold text-slate-600 dark:text-slate-200 font-mono">{formatCurrency(m.editTarget.originalAmount || 0)} → {formatCurrency(m.editTarget.newValues.amount || m.editTarget.originalAmount || 0)}</span></p>
                                    <p>Kategori: <span className="font-bold text-slate-600 dark:text-slate-200">{m.editTarget.originalCategory} → {m.editTarget.newValues.category || m.editTarget.originalCategory}</span></p>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                  <button 
                                    onClick={() => confirmEditTransaction(m.editTarget!, m.id)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${styles.btnPrimary}`}
                                  >
                                    <Check size={14} /> Terapkan Koreksi
                                  </button>
                                  <button 
                                    onClick={() => cancelEditTransaction(m.id)}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-slate-500 border border-slate-200 dark:border-slate-800 ${styles.btnSecondary}`}
                                  >
                                    <X size={14} /> Batal
                                  </button>
                                </div>
                              </div>
                            )}

                            <p className="text-[9px] mt-2 font-semibold opacity-40 text-right">
                              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className={`rounded-3xl rounded-tl-none p-4 shadow-sm border ${styles.card}`}>
                          <div className="flex gap-1.5 py-1">
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Room Input */}
                  <div className={`p-4 border-t ${styles.header} transition-all duration-300`}>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Ketik di ${clones.find(c => c.id === activeChatId)?.name}: beli bensin 15rb...`}
                        disabled={isLoading}
                        className={`w-full border-none rounded-2xl py-4 pl-5 pr-14 text-xs md:text-sm focus:ring-2 transition-all outline-none ${styles.input}`}
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${styles.btnPrimary}`}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    <p className={`text-[9px] text-center mt-3 font-semibold uppercase tracking-widest ${styles.headerSubText}`}>
                      Didukung oleh Kecerdasan Gemini AI
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${styles.cardText}`}>
                  <BarChart2 size={18} className="shrink-0" />
                  {activeCloneId === 'all' ? 'Analisis Komparasi Akun' : 'Grafik & Visualisasi Keuangan'}
                </h3>
              </div>

              {activeCloneId === 'all' ? (
                /* Consolidated Multi-ledger Comparison Analytics */
                <div className="space-y-6">
                  {/* Efisiensi Alokasi Global Card */}
                  <div className={`p-5 rounded-3xl space-y-3.5 ${styles.card}`}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Efisiensi Alokasi Global</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400">Rata-rata Saldo / Akun:</p>
                        <p className={`font-bold font-mono text-base mt-0.5 ${styles.cardText}`}>
                          {formatCurrency(consolidatedMetrics.globalBalance / (clones.length || 1))}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Buku Kas Tersibuk:</p>
                        <p className="font-bold text-sm truncate uppercase text-indigo-500 dark:text-indigo-400 mt-1 font-semibold">
                          {consolidatedMetrics.clonesSummary.length > 0 
                            ? consolidatedMetrics.clonesSummary.reduce((max, c) => c.txCount > max.txCount ? c : max, consolidatedMetrics.clonesSummary[0]).clone.name
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Progress Bars Chart */}
                  <div className={`p-5 rounded-3xl shadow-sm space-y-4 ${styles.card}`}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-semibold">Arus Kas Kredit vs Debet</h4>
                    
                    <div className="space-y-4">
                      {consolidatedMetrics.clonesSummary.map((item, index) => {
                        const maxVal = Math.max(...consolidatedMetrics.clonesSummary.map(x => Math.max(x.income, x.expense)), 1000);
                        const incPct = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
                        const expPct = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;
                        return (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className={`font-bold capitalize flex items-center gap-1.5 ${styles.cardText}`}>
                                <span>{item.clone.icon}</span>
                                <span className="truncate max-w-[140px]">{item.clone.name}</span>
                              </span>
                              <span className={`font-bold font-mono text-[10px] ${item.balance >= 0 ? styles.incomeText : styles.expenseText}`}>
                                {item.balance >= 0 ? '+' : ''}{formatCurrency(item.balance)}
                              </span>
                            </div>
                            
                            <div className="space-y-1 bg-slate-100/10 dark:bg-black/10 p-2.5 rounded-xl border border-slate-200/5 dark:border-white/5">
                              {/* Income Bar */}
                              <div className="flex items-center gap-2">
                                <span className="w-10 text-[8px] text-slate-400 font-bold uppercase tracking-tight">Kredit</span>
                                <div className="flex-1 bg-slate-200/20 h-2 rounded-full overflow-hidden">
                                  <div className={`${styles.incomeBadge} h-full transition-all duration-300`} style={{ width: `${incPct}%` }} />
                                </div>
                                <span className="w-14 text-right font-mono text-[9px] font-bold text-slate-400">{formatCurrency(item.income).replace('Rp', '').trim()}</span>
                              </div>
                              {/* Expense Bar */}
                              <div className="flex items-center gap-2">
                                <span className="w-10 text-[8px] text-slate-400 font-bold uppercase tracking-tight">Debet</span>
                                <div className="flex-1 bg-slate-200/20 h-2 rounded-full overflow-hidden">
                                  <div className={`${styles.expenseBadge} h-full transition-all duration-300`} style={{ width: `${expPct}%` }} />
                                </div>
                                <span className="w-14 text-right font-mono text-[9px] font-bold text-slate-500">{formatCurrency(item.expense).replace('Rp', '').trim()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className={`text-center py-16 px-4 rounded-3xl border border-slate-100 ${styles.card}`}>
                  <p className="text-slate-400 text-xs">Belum ada statistik. Masukkan transaksi di tab Chat untuk melihat analisis visual.</p>
                </div>
              ) : (
                <>
                  {/* Donut Progress Ring */}
                  <div className={`p-5 rounded-3xl shadow-sm space-y-4 ${styles.card}`}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rasio Pengeluaran vs Pendapatan</h4>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            className={totalIncome + totalExpense === 0 ? (theme === 'light' ? "text-slate-200" : "text-slate-800") : styles.expenseText}
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.915"
                          />
                          <circle
                            className={styles.incomeText}
                            strokeDasharray={`${totalIncome === 0 ? 0 : Math.min(100, (totalIncome / (totalIncome + totalExpense || 1)) * 100)}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.915"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className={`text-sm font-bold block leading-none font-mono ${styles.cardText}`}>
                            {totalIncome + totalExpense === 0 ? '0%' : `${Math.round((totalIncome / (totalIncome + totalExpense || 1)) * 100)}%`}
                          </span>
                          <span className="block text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Rasio</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-slate-400">
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${styles.incomeBadge}`}></span>
                            Pemasukan
                          </span>
                          <span className={`font-bold font-mono ${styles.cardText}`}>{formatCurrency(totalIncome).replace('Rp', '').trim()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-slate-400">
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${styles.expenseBadge}`}></span>
                            Pengeluaran
                          </span>
                          <span className={`font-bold font-mono ${styles.cardText}`}>{formatCurrency(totalExpense).replace('Rp', '').trim()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Area SVG Chart */}
                  <div className={`p-5 rounded-3xl shadow-sm space-y-4 ${styles.card}`}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tren Transaksi 7 Hari Terakhir</h4>
                    <div className="h-32 w-full relative pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                        {/* Grid indicators */}
                        <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" strokeDasharray="3" />
                        <line x1="0" y1="10" x2="300" y2="10" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" strokeDasharray="3" />

                        {trendData.length > 1 && (
                          <>
                            {/* Income Area & Polyline */}
                            <path
                              fill={styles.incomeAreaFill}
                              stroke="none"
                              d={`M0,90 ${trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.income / maxTrendVal) * 70}`).join(' ')} L300,90 Z`}
                            />
                            <polyline
                              fill="none"
                              stroke={styles.incomeHex}
                              strokeWidth="2"
                              strokeLinecap="round"
                              points={trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.income / maxTrendVal) * 70}`).join(' ')}
                            />

                            {/* Expense Area & Polyline */}
                            <path
                              fill={styles.expenseAreaFill}
                              stroke="none"
                              d={`M0,90 ${trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.expense / maxTrendVal) * 70}`).join(' ')} L300,90 Z`}
                            />
                            <polyline
                              fill="none"
                              stroke={styles.expenseHex}
                              strokeWidth="2"
                              strokeLinecap="round"
                              points={trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.expense / maxTrendVal) * 70}`).join(' ')}
                            />
                          </>
                        )}
                      </svg>

                      {/* X Axis Labels */}
                      <div className="flex justify-between mt-2.5 text-[8px] text-slate-400 font-semibold uppercase">
                        {trendData.map((d, i) => (
                          <span key={i}>{d.label.split(',')[0]}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Progress Bars */}
                  <div className={`p-5 rounded-3xl shadow-sm space-y-4 ${styles.card}`}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Penggunaan Berdasarkan Kategori</h4>
                    <div className="space-y-4.5">
                      {categorySummary.length === 0 ? (
                        <p className="text-xs text-slate-400">Belum ada rincian kategori.</p>
                      ) : (
                        categorySummary.map((cat, idx) => {
                          const maxAmount = Math.max(...categorySummary.map(c => c.total), 1);
                          const percentage = (cat.total / maxAmount) * 100;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-bold capitalize ${styles.cardText}`}>{cat.name}</span>
                                <span className={`font-bold font-mono ${styles.cardText}`}>{formatCurrency(cat.total).replace('Rp', '').trim()}</span>
                              </div>
                              <div className="w-full bg-slate-100/10 dark:bg-black/20 h-2.5 rounded-full overflow-hidden flex">
                                {cat.income > 0 && (
                                  <div 
                                    className={`${styles.incomeBadge} transition-all duration-500`} 
                                    style={{ width: `${(cat.income / cat.total) * percentage}%` }}
                                  />
                                )}
                                {cat.expense > 0 && (
                                  <div 
                                    className={`${styles.expenseBadge} transition-all duration-500`} 
                                    style={{ width: `${(cat.expense / cat.total) * percentage}%` }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${styles.cardText}`}>
                  <Settings size={18} className="shrink-0" />
                  Pengaturan Aplikasi
                </h3>
                <p className={`text-[11px] mt-1 ${styles.cardSubText}`}>Sesuaikan penampilan, kategori pencatatan, dan asisten AI Anda.</p>
              </div>

              {/* Section 1: Tema Tampilan */}
              <div className={`p-5 rounded-3xl space-y-4 ${styles.card}`}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette size={14} className="text-indigo-400" />
                  Pilih Tema Visual
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setTheme('light');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 border transition-all cursor-pointer ${
                      theme === 'light' 
                        ? 'border-indigo-600 bg-white text-slate-900 shadow-sm ring-2 ring-indigo-500/10' 
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">☀️</span>
                    <span className="text-[10px] font-bold">Terang</span>
                  </button>

                  <button
                    onClick={() => {
                      setTheme('dark');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 border transition-all cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-indigo-400 bg-[#131b2e] text-white shadow-sm ring-2 ring-indigo-400/20' 
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-xl">🌙</span>
                    <span className="text-[10px] font-bold">Gelap</span>
                  </button>

                  <button
                    onClick={() => {
                      setTheme('bebas');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 border transition-all cursor-pointer ${
                      theme === 'bebas' 
                        ? 'border-[#34d399] bg-[#0d211d] text-[#34d399] shadow-sm ring-2 ring-emerald-400/20' 
                        : 'border-[#1a3832] bg-[#071512] text-emerald-600 hover:bg-[#0d211d] hover:text-emerald-400'
                    }`}
                  >
                    <span className="text-xl">🌲</span>
                    <span className="text-[10px] font-bold">Emerald</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Kunci API Gemini */}
              <div className={`p-5 rounded-3xl space-y-4 ${styles.card}`}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Key size={14} className="text-amber-500" />
                  Kunci API Gemini Kustom
                </h4>
                <p className={`text-[11px] leading-relaxed ${styles.cardSubText}`}>
                  Masukkan kustom API Key Gemini Anda sendiri untuk asisten AI. Kunci ini disimpan lokal di browser dan diproses dengan aman oleh server.
                </p>
                
                <div className="space-y-3">
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="Masukkan API Key Anda (AI_...)"
                    className={`w-full px-4 py-3 rounded-xl text-xs border outline-none focus:ring-2 transition-all ${styles.input}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCustomKey(customKey)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${styles.btnPrimary}`}
                    >
                      Simpan Kunci
                    </button>
                    {localStorage.getItem('gemini_api_key') && (
                      <button
                        onClick={() => {
                          localStorage.removeItem('gemini_api_key');
                          setCustomKey("");
                          showToast("API Key dihapus, kembali menggunakan default server. ⚙️", "info");
                        }}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors bg-transparent cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Pengaturan Kategori Pencatatan (Critique #9) */}
              <div className={`p-5 rounded-3xl space-y-4 ${styles.card}`}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers size={14} className="text-emerald-500" />
                  Kategori Pembukuan ({categories.length})
                </h4>
                <p className={`text-[11px] leading-relaxed ${styles.cardSubText}`}>
                  Kelola kategori pencatatan keuangan kustom Anda. AI asisten akan mendeteksi kategori buatan Anda secara otomatis!
                </p>

                {/* Categories chips list */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat, i) => (
                    <div key={i} className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${styles.badge}`}>
                      <span className="capitalize">{cat}</span>
                      {categories.length > 2 && (
                        <button
                          onClick={() => {
                            const updated = categories.filter(c => c !== cat);
                            setCategories(updated);
                            showToast(`Kategori "${cat}" dihapus! 🗑️`, "info");
                          }}
                          className="text-slate-400 hover:text-red-500 focus:outline-none ml-1 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new category form */}
                <div className="flex gap-2 pt-2 border-t border-dashed mt-2 border-slate-200 dark:border-slate-800">
                  <input
                    id="new-cat-input"
                    type="text"
                    placeholder="Tambah kategori baru..."
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 transition-all ${styles.input}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget.value || '').trim().toLowerCase();
                        if (val) {
                          if (categories.includes(val)) {
                            showToast("Kategori sudah ada!", "error");
                          } else {
                            setCategories([...categories, val]);
                            e.currentTarget.value = "";
                            showToast(`Kategori "${val}" ditambahkan! ✨`, "success");
                          }
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('new-cat-input') as HTMLInputElement;
                      const val = (el?.value || '').trim().toLowerCase();
                      if (val) {
                        if (categories.includes(val)) {
                          showToast("Kategori sudah ada!", "error");
                        } else {
                          setCategories([...categories, val]);
                          el.value = "";
                          showToast(`Kategori "${val}" ditambahkan! ✨`, "success");
                        }
                      } else {
                        showToast("Ketik nama kategori terlebih dahulu.", "info");
                      }
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 ${styles.btnPrimary}`}
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Section 4: Ekspor & Impor Data */}
              <div className={`p-5 rounded-3xl space-y-4 transition-all duration-300 ${styles.card}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileSpreadsheet size={14} className="text-indigo-400" />
                    Ekspor / Impor CSV Excel
                  </h4>
                  <button 
                    onClick={() => setShowImportGuide(!showImportGuide)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <Info size={16} />
                  </button>
                </div>

                <p className={`text-[11px] leading-relaxed ${styles.cardSubText}`}>
                  Simpan data transaksi Anda atau impor catatan pembukuan lama dengan berkas berformat CSV.
                </p>

                {showImportGuide && (
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${styles.dialog}`}>
                    <p className="font-bold mb-1">Format Kolom CSV (Sesuai Ekspor):</p>
                    <code className="block bg-black/5 dark:bg-black/40 p-2 rounded border border-black/10 overflow-x-auto font-mono text-[10px] select-all whitespace-nowrap">
                      Tanggal,Tipe,Kategori,Deskripsi,Jumlah<br/>
                      2026-06-06,Pemasukan,Penjualan,Lapis legit,250000<br/>
                      2026-06-06,Pengeluaran,Bahan Baku,Beli Mentega,80000
                    </code>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleExportCSV}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer ${styles.btnPrimary}`}
                  >
                    <Download size={14} /> Ekspor CSV
                  </button>
                  <label className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer relative text-center border ${styles.btnSecondary}`}>
                    <Upload size={14} /> Impor CSV
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload}
                      className="hidden" 
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </div>

              {/* Section 5: Pencadangan & Reset Data */}
              <div className={`p-5 rounded-3xl space-y-4 ${styles.card}`}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-400" />
                  Pembersihan & Reset Data
                </h4>
                <p className={`text-[11px] leading-relaxed ${styles.cardSubText}`}>
                  Menghapus semua data transaksi dan pesan obrolan secara permanen dan murni dari memori sessional localStorage.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm("Apakah Anda yakin ingin menghapus SEMUA transaksi dan riwayat pembicaraan? Tindakan ini permanen.")) {
                        setTransactions([]);
                        setMessages([
                          {
                            id: 'welcome',
                            role: 'assistant',
                            content: 'Halo! Semua data telah berhasil dibersihkan. Saya CashTalk, asisten keuangan UMKM Anda. Silakan ketik transaksi Anda!',
                            timestamp: new Date(),
                          }
                        ]);
                        showToast("Semua data berhasil di-reset ke awal! 🧹", "success");
                      }
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Reset Semua Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className={`px-6 py-4 flex justify-between items-center z-10 transition-all duration-300 ${styles.nav}`}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'dashboard' ? styles.navActive : styles.navInactive}`}
        >
          <PieChart size={22} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        
        <div className="flex justify-center flex-1 relative -top-6">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              activeTab === 'chat' ? 'ring-4 ring-slate-100/35' : ''
            } ${styles.btnPrimary}`}
          >
            <Plus size={24} />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'analytics' ? styles.navActive : styles.navInactive}`}
        >
          <BarChart2 size={22} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Grafik</span>
        </button>
      </nav>
    </div>
  );
}
