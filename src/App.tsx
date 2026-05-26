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
  Info
} from 'lucide-react';
import { Transaction, Message, PendingTransaction, AIResponse } from './types';
import { parseTransaction } from './services/gemini';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('umkm_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya CashTalk, asisten keuangan UMKM Anda. Silakan ketik transaksi Anda (misal: "jualan hari ini 200 ribu" atau "beli bensin 20 ribu").',
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'analytics'>('dashboard');
  const [dragActive, setDragActive] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations & Helpers
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    localStorage.setItem('umkm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

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
      // Create rich context string of the user's financial database
      const contextString = `
      Informasi Statistik Keuangan Bisnis Saat Ini:
      - Total Pemasukan: ${formatCurrency(totalIncome)}
      - Total Pengeluaran: ${formatCurrency(totalExpense)}
      - Sisa Uang / Saldo Kas: ${formatCurrency(balance)}
      - Jumlah Transaksi Tercatat: ${transactions.length}
      
      5 Transaksi Terakhir Anda:
      ${transactions.slice(0, 5).map(t => `- [${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}] Kategori: ${t.category}, Deskripsi: ${t.description}, Jumlah: ${formatCurrency(t.amount)}, Tanggal: ${new Date(t.date).toLocaleDateString('id-ID')}`).join('\n')}
      `;

      const aiResponse: AIResponse = await parseTransaction(inputValue, contextString);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        pendingTransactions: aiResponse.transactions,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // If AI detects navigation intention, switch tabs
      if (aiResponse.status === 'navigate' && aiResponse.targetTab) {
        setTimeout(() => {
          setActiveTab(aiResponse.targetTab!);
        }, 800); // Small delay so the user reads the redirection message
      }
    } catch (error) {
      console.error("Failed to process message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmTransactions = (pending: PendingTransaction[], messageId: string) => {
    const newTransactions: Transaction[] = pending.map(p => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    }));

    setTransactions(prev => [...newTransactions, ...prev]);
    
    // Update message to show confirmed
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, pendingTransactions: undefined, content: 'Selesai! Transaksi telah dicatat.' } : m
    ));
  };

  const cancelTransactions = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, pendingTransactions: undefined, content: 'Transaksi dibatalkan.' } : m
    ));
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("Belum ada data transaksi untuk diekspor!");
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
  };

  // CSV Import Parser
  const parseCSVData = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        alert("File CSV kosong atau format tidak tepat.");
        return;
      }

      const parsed: Transaction[] = [];
      let successCount = 0;

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

        if (columns.length < 3) continue;

        let dateVal = new Date().toISOString();
        let typeVal: 'income' | 'expense' = 'expense';
        let catVal = 'lainnya';
        let descVal = 'Transaksi Impor';
        let amountVal = 0;

        if (columns.length >= 5) {
          // Format based on Export: ID Transaksi,Tanggal,Tipe,Kategori,Deskripsi,Jumlah
          // Or user manual Tanggal,Tipe,Kategori,Deskripsi,Jumlah
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
          // Fallback simple parsing
          amountVal = parseFloat(columns[columns.length - 1]?.replace(/[^0-9.-]+/g, "")) || 0;
        }

        if (amountVal > 0) {
          parsed.push({
            id: 'imp_' + Math.random().toString(36).substr(2, 9),
            date: dateVal,
            type: typeVal,
            category: catVal.toLowerCase().trim(),
            description: descVal,
            amount: amountVal
          });
          successCount++;
        }
      }

      if (successCount > 0) {
        setTransactions(prev => [...parsed, ...prev]);
        setMessages(prev => [
          ...prev,
          {
            id: 'import_' + Date.now().toString(),
            role: 'assistant',
            content: `Berhasil mengimpor ${successCount} transaksi dari file Excel/CSV! Transaksi Anda sudah tercatat di dashboard.`,
            timestamp: new Date()
          }
        ]);
        alert(`Berhasil mengimpor ${successCount} transaksi secara massal!`);
      } else {
        alert("Tidak ada baris data valid yang ditemukan untuk diimpor.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat parsing file CSV.");
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

  // Analytics helpers
  const parentCategories = ['penjualan', 'bahan baku', 'operasional', 'transportasi', 'makanan', 'lainnya'];
  
  const categorySummary = parentCategories.map(cat => {
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

  const getWeeklyTrend = () => {
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
  };

  const trendData = getWeeklyTrend();
  const maxTrendVal = Math.max(...trendData.map(d => Math.max(d.income, d.expense)), 1000);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">CashTalk</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Asisten Keuangan Pintar</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
          <Wallet size={20} />
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
            >
              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Saldo</p>
                    <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</h2>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={80} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-income mb-2">
                      <div className="p-1.5 rounded-full bg-income/10">
                        <TrendingUp size={14} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Pemasukan</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-expense mb-2">
                      <div className="p-1.5 rounded-full bg-expense/10">
                        <TrendingDown size={14} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Pengeluaran</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(totalExpense)}</p>
                  </div>
                </div>
              </div>

              {/* Import & Export Excel Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <FileSpreadsheet size={18} className="text-slate-400" />
                    Ekspor / Impor CSV Excel
                  </h3>
                  <button 
                    onClick={() => setShowImportGuide(!showImportGuide)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <Info size={16} />
                  </button>
                </div>

                {showImportGuide && (
                  <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                    <p className="font-semibold mb-1 text-slate-700">Format Kolom CSV (Sesuai Ekspor):</p>
                    <code className="block bg-white p-2 rounded border border-slate-200 overflow-x-auto text-slate-800 font-mono">
                      Tanggal,Tipe,Kategori,Deskripsi,Jumlah<br/>
                      2026-05-26,Pemasukan,Penjualan,Lapis legit,250000<br/>
                      2026-05-26,Pengeluaran,Bahan Baku,Beli Mentega,80000
                    </code>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download size={14} /> Ekspor CSV
                  </button>
                  <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer relative text-center">
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

                {/* Drag-drop Area */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`p-4 rounded-2xl border border-dashed text-center transition-all ${
                    dragActive 
                      ? 'border-slate-900 bg-slate-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[11px] text-slate-400 font-medium">
                    Seret & lepas file CSV di sini untuk impor cepat
                  </p>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <History size={18} className="text-slate-400" />
                    Transaksi Terakhir
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{transactions.length} Total</span>
                </div>

                <div className="space-y-2.5">
                  {transactions.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-xs">Belum ada transaksi. Silakan rekam via Chat!</p>
                    </div>
                  ) : (
                    transactions.slice(0, 8).map((t) => (
                      <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group relative"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            t.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                          }`}>
                            {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate leading-none mb-1">{t.description}</p>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              {t.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-xs ${
                            t.type === 'income' ? 'text-income' : 'text-expense'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace('Rp', '').trim()}
                          </p>
                          <button 
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-slate-300 hover:text-red-500 hover:bg-slate-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
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
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-3xl p-4 ${
                      m.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      
                      {/* Confirmation UI */}
                      {m.pendingTransactions && (
                        <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                          {m.pendingTransactions.map((pt, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  pt.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                                }`}>
                                  {pt.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                </span>
                                <span className="font-bold text-sm">{formatCurrency(pt.amount)}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-700">{pt.description}</p>
                              <p className="text-[10px] text-slate-400 mt-1 italic">Kategori: {pt.category}</p>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-1">
                            <button 
                              onClick={() => confirmTransactions(m.pendingTransactions!, m.id)}
                              className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                            >
                              <Check size={14} /> Simpan
                            </button>
                            <button 
                              onClick={() => cancelTransactions(m.id)}
                              className="flex-1 bg-white border border-slate-200 text-slate-500 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                            >
                              <X size={14} /> Batal
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <p className={`text-[10px] mt-2 font-medium opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Contoh: jual lapis legit 200rb..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
                  Didukung oleh Kecerdasan Gemini AI
                </p>
              </div>
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
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 size={18} className="text-slate-950" />
                  Grafik & Visualisasi Keuangan
                </h3>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs">Belum ada statistik. Masukkan transaksi di tab Chat untuk melihat analisis visual.</p>
                </div>
              ) : (
                <>
                  {/* Donut Progress Ring */}
                  <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rasio Pengeluaran vs Pendapatan</h4>
                    <div className="flex items-center gap-6">
                      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-income"
                            strokeDasharray={`${totalIncome === 0 ? 0 : Math.min(100, (totalIncome / (totalIncome + totalExpense || 1)) * 100)}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xs font-bold text-slate-800">
                            {totalIncome + totalExpense === 0 ? '0%' : `${Math.round((totalIncome / (totalIncome + totalExpense || 1)) * 100)}%`}
                          </span>
                          <span className="block text-[7px] text-slate-400 font-bold uppercase tracking-tighter">Pemasukan</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-income inline-block"></span>
                            Pemasukan
                          </span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalIncome).replace('Rp', '').trim()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-expense inline-block"></span>
                            Pengeluaran
                          </span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalExpense).replace('Rp', '').trim()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Area SVG Chart */}
                  <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tren Pemasukan & Pengeluaran 7 Hari Terakhir</h4>
                    <div className="h-32 w-full relative pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                        {/* Grid indicators */}
                        <line x1="0" y1="90" x2="300" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                        <line x1="0" y1="10" x2="300" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                        {trendData.length > 1 && (
                          <>
                            {/* Income Area & Polyline */}
                            <path
                              fill="rgba(16, 185, 129, 0.05)"
                              stroke="none"
                              d={`M0,90 ${trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.income / maxTrendVal) * 70}`).join(' ')} L300,90 Z`}
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              points={trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.income / maxTrendVal) * 70}`).join(' ')}
                            />

                            {/* Expense Area & Polyline */}
                            <path
                              fill="rgba(239, 68, 68, 0.05)"
                              stroke="none"
                              d={`M0,90 ${trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.expense / maxTrendVal) * 70}`).join(' ')} L300,90 Z`}
                            />
                            <polyline
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              points={trendData.map((d, i) => `${(i / (trendData.length - 1)) * 300},${90 - (d.expense / maxTrendVal) * 70}`).join(' ')}
                            />
                          </>
                        )}
                      </svg>

                      {/* X Axis Labels */}
                      <div className="flex justify-between mt-2 text-[8px] text-slate-400 font-semibold uppercase">
                        {trendData.map((d, i) => (
                          <span key={i}>{d.label.split(',')[0]}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Progress Bars */}
                  <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
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
                                <span className="font-bold text-slate-700">{cat.name}</span>
                                <span className="font-bold text-slate-900">{formatCurrency(cat.total).replace('Rp', '').trim()}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                                {cat.income > 0 && (
                                  <div 
                                    className="bg-income transition-all duration-500" 
                                    style={{ width: `${(cat.income / cat.total) * percentage}%` }}
                                  />
                                )}
                                {cat.expense > 0 && (
                                  <div 
                                    className="bg-expense transition-all duration-500" 
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
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="bg-white border-t border-slate-100 px-8 py-4 flex justify-around items-center z-10">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-300'}`}
        >
          <PieChart size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
        </button>
        <div className="relative -top-8">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all ${
              activeTab === 'chat' ? 'ring-4 ring-slate-100' : ''
            }`}
          >
            <Plus size={28} />
          </button>
        </div>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'analytics' ? 'text-slate-900' : 'text-slate-300'}`}
        >
          <BarChart2 size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Grafik</span>
        </button>
      </nav>
    </div>
  );
}
