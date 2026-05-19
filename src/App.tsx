/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Home as HomeIcon, 
  Target, 
  History as HistoryIcon, 
  User, 
  Plus, 
  Minus,
  Trash2,
  Bell, 
  ChevronLeft,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, SavingsGoal, Transaction } from './types';
import { INITIAL_GOALS, INITIAL_TRANSACTIONS } from './constants';

// --- UTILS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// --- COMPONENTS ---

const BottomNav = ({ activeScreen, setScreen }: { activeScreen: Screen, setScreen: (s: Screen) => void }) => {
  const tabs: { id: Screen, icon: any, label: string }[] = [
    { id: 'home', icon: HomeIcon, label: 'Beranda' },
    { id: 'goals', icon: Target, label: 'Tujuan' },
    { id: 'history', icon: HistoryIcon, label: 'Riwayat' },
    { id: 'account', icon: User, label: 'Akun' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50">
      {tabs.slice(0, 2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeScreen === tab.id ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <tab.icon size={24} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
      
      <div className="relative -top-6">
        <button className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          <Plus size={32} />
        </button>
      </div>

      {tabs.slice(2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeScreen === tab.id ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <tab.icon size={24} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('login');
  const [accountSubScreen, setAccountSubScreen] = useState<string | null>(null);
  const [userName, setUserName] = useState('Agnia Nur Nazhifa');
  const [userPhoto, setUserPhoto] = useState('');
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('10000');
  const [newGoalImage, setNewGoalImage] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawGoalId, setWithdrawGoalId] = useState<string | null>(null);

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(INITIAL_GOALS[0].id);
  // Start with 0 balance as requested
  const [goals, setGoals] = useState<SavingsGoal[]>(INITIAL_GOALS.map(g => ({ ...g, currentAmount: 0 })));
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Derived state
  const totalBalance = goals.reduce((acc, current) => acc + current.currentAmount, 0);
  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  // Actions
  const handleDeposit = (goalId: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (targetGoal && targetGoal.currentAmount >= targetGoal.targetAmount) {
      alert('Tujuan ini sudah lunas! 🚀');
      return;
    }

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextAmount = g.currentAmount + amount;
        return { ...g, currentAmount: Math.min(nextAmount, g.targetAmount) };
      }
      return g;
    }));
    
    // We get the goal from the PREVIOUS state for the transaction name, 
    // but the updated amount logic is handled by the setGoals functional update.
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'setor',
      title: 'Setoran',
      goalName: targetGoal?.title || 'Tabungan',
      amount,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleWithdraw = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.currentAmount < amount) {
      alert('Saldo tidak cukup di tujuan ini!');
      return;
    }
    
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount } : g
    ));
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'tarik',
      title: 'Penarikan',
      goalName: goal.title,
      amount,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (selectedGoalId === id) {
      setSelectedGoalId(null);
    }
    setActiveScreen('home');
  };

  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalTarget) {
      alert('Isi semua data ya!');
      return;
    }
    const target = parseInt(newGoalTarget);
    if (isNaN(target) || target <= 0) {
      alert('Nominal target harus angka valid!');
      return;
    }

    const newGoal: SavingsGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoalTitle,
      currentAmount: 0,
      targetAmount: target,
      targetDate: '2026-12-31',
      imageUrl: newGoalImage || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Goal baru'
    };

    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalImage('');
    setActiveScreen('goals');
    alert('Tujuan baru berhasil ditambahkan! 🚀');
  };

  const navigateToGoal = (id: string) => {
    setSelectedGoalId(id);
    setActiveScreen('goal_detail');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-50 overflow-x-hidden relative">
      <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center relative z-10">
        
        {/* Interactive App Container */}
        <div className="flex flex-col items-center">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-2">Dabung</h2>
              <p className="text-slate-400">Gunakan frame di bawah untuk mengelola tabungan Anda</p>
           </div>

           <div className="w-[375px] h-[812px] bg-[#0f172a] rounded-[56px] shadow-[0_0_100px_rgba(129,140,248,0.2)] overflow-hidden relative border-[12px] border-black/80">
            <AnimatePresence mode="wait">
              {/* SCREEN: LOGIN */}
              {!isLoggedIn && activeScreen === 'login' && (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center p-8 bg-[#0f172a] relative overflow-hidden"
                >
                  <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none"></div>
                  
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8"
                    >
                      <Wallet size={48} className="text-white" />
                    </motion.div>
                    
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mb-12"
                    >
                      <h1 className="text-4xl font-black text-white tracking-tighter mb-2">DABUNG</h1>
                      <p className="text-slate-400 font-medium">Wujudkan rencana masa depanmu bersama kami.</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full space-y-4"
                    >
                      <div className={`glass-panel p-4 rounded-2xl border ${loginError ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}>
                        <input 
                          type="text" 
                          placeholder="Username" 
                          value={loginUsername}
                          onChange={(e) => {
                            setLoginUsername(e.target.value);
                            setLoginError(false);
                          }}
                          className="w-full bg-transparent text-white focus:outline-none font-bold"
                        />
                      </div>
                      <div className="glass-panel p-4 rounded-2xl border border-white/5">
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="w-full bg-transparent text-white focus:outline-none font-bold"
                        />
                      </div>
                      
                      {loginError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-[10px] font-bold text-center uppercase tracking-wider"
                        >
                          Username harus diisi!
                        </motion.p>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (loginUsername.trim() !== "") {
                            setUserName(loginUsername);
                            setIsLoggedIn(true);
                            setActiveScreen('home');
                            setLoginError(false);
                          } else {
                            setLoginError(true);
                          }
                        }}
                        className="w-full bg-white text-[#0f172a] font-black py-5 rounded-[24px] uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-white/10 mt-4"
                      >
                        Masuk Sekarang
                      </button>
                      
                      <p className="text-center text-xs text-slate-500 font-bold mt-4">
                        Belum punya akun? <span className="text-indigo-400 cursor-pointer">Daftar</span>
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 text-[10px] text-slate-700 font-black uppercase tracking-[4px]"
                  >
                    Dabung v2.4.0
                  </motion.div>
                </motion.div>
              )}

              {/* SCREEN: HOME */}
              {isLoggedIn && activeScreen === 'home' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto pb-24 scrollbar-hide"
                >
                  <div className="px-6 pt-12 pb-6 flex justify-between items-start">
                    <div>
                      <h1 className="text-xl font-bold text-white flex items-center gap-2">Hai, {userName.split(' ')[0]}! 👋</h1>
                      <p className="text-sm text-slate-400">Mulai langkah kecilmu hari ini!</p>
                    </div>
                    <button onClick={() => { setActiveScreen('account'); setAccountSubScreen('edit_profile'); }} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/10 active:scale-90 transition-transform overflow-hidden flex items-center justify-center">
                      {userPhoto ? (
                        <img src={userPhoto} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </button>
                  </div>

                  <div className="px-6 mb-8">
                    <div className="glass-panel rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-2 opacity-60 mb-2 text-[10px] font-bold uppercase tracking-widest">
                        <span>Total Tabungan</span>
                        <Star size={12} />
                      </div>
                      <h2 className="text-3xl font-extrabold mb-4 transition-all duration-500">{formatCurrency(totalBalance)}</h2>
                      <div className="flex items-center gap-1 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 w-max px-2.5 py-1 rounded-full border border-indigo-500/20">
                        <TrendingUp size={10} />
                        <span>Target Tercapai: {totalBalance > 0 ? Math.min(Math.round((totalBalance / 21000000) * 100), 100) : 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 mb-8 grid grid-cols-3 gap-4">
                    {[
                      { icon: Plus, label: 'Setor', color: 'text-blue-400 border-blue-500/20', action: () => setActiveScreen('goals') },
                      { icon: Wallet, label: 'Tarik', color: 'text-purple-400 border-purple-500/20', action: () => {
                        setWithdrawGoalId(goals[0]?.id || null);
                        setActiveScreen('withdraw');
                      }},
                      { icon: HistoryIcon, label: 'Riwayat', color: 'text-pink-400 border-pink-500/20', action: () => setActiveScreen('history') },
                    ].map((action, i) => (
                      <button key={i} onClick={action.action} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center glass-button border ${action.color}`}>
                          <action.icon size={24} />
                        </div>
                        <span className="text-[10px] font-bold tracking-tight text-slate-400 uppercase">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="px-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Tujuan Menabung</h3>
                      <button onClick={() => setActiveScreen('goals')} className="text-blue-400 text-xs font-bold uppercase tracking-wider active:opacity-60">Lihat semua</button>
                    </div>
                    <div className="flex flex-col gap-4">
                      {goals.map((goal) => (
                        <button 
                          key={goal.id} 
                          onClick={() => navigateToGoal(goal.id)}
                          className="glass-panel p-4 rounded-[28px] flex items-center gap-4 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/20">
                            <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1 text-white">{goal.title}</h4>
                            <div className="flex justify-between text-[11px] mb-2 font-bold italic">
                              <span className="text-blue-400">{formatCurrency(goal.currentAmount)}</span>
                              <span className="text-slate-300">{Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                className="h-full bg-gradient-to-r from-[#818cf8] to-[#c084fc]"
                              ></motion.div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoggedIn && activeScreen === 'goals' && (
                <motion.div 
                   key="goals"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.05 }}
                   className="h-full overflow-y-auto pb-24 scrollbar-hide px-6 pt-12"
                >
                   <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setActiveScreen('home')} className="p-2 bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
                      <h2 className="text-xl font-black">Pilih Tujuan</h2>
                   </div>
                   <div className="flex flex-col gap-4">
                      {goals.map(goal => (
                        <div key={goal.id} className="relative group">
                          <div 
                             onClick={() => navigateToGoal(goal.id)} 
                             className="w-full glass-panel p-6 rounded-[32px] text-left active:scale-[0.98] transition-all cursor-pointer pr-16"
                          >
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden"><img src={goal.imageUrl} className="w-full h-full object-cover" /></div>
                                <h4 className="font-bold">{goal.title}</h4>
                             </div>
                             <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400">Terkumpul {formatCurrency(goal.currentAmount)}</span>
                                <span className="text-indigo-400 font-bold">{Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)}%</span>
                             </div>
                             <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}></div>
                             </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(goal.id);
                            }}
                            className="absolute right-6 top-8 p-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                             <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {isLoggedIn && activeScreen === 'goal_detail' && selectedGoal && (
                <motion.div 
                  key="detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full overflow-y-auto pb-24 scrollbar-hide"
                >
                  <div className="absolute top-0 left-0 right-0 h-72 mesh-bg opacity-60 -z-0 rounded-b-[40px] border-b border-white/10"></div>
                  <div className="relative z-10">
                    <div className="px-6 pt-12 flex justify-between items-center text-white">
                      <button onClick={() => setActiveScreen('goals')} className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                      <button onClick={() => handleDeleteGoal(selectedGoal.id)} className="p-2.5 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 text-red-400 active:scale-90 transition-transform"><Trash2 size={24} /></button>
                    </div>
                    <div className="flex flex-col items-center mt-6 px-6 text-center">
                      <div className="w-24 h-24 rounded-[32px] border-2 border-white/20 shadow-2xl overflow-hidden mb-6 bg-white/10 backdrop-blur-xl p-1">
                        <img src={selectedGoal.imageUrl} className="w-full h-full object-cover rounded-[28px]" />
                      </div>
                      <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{selectedGoal.title}</h2>
                      <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        {formatCurrency(selectedGoal.currentAmount)} <span className="opacity-40">/</span> {formatCurrency(selectedGoal.targetAmount)}
                      </p>
                    </div>
                    <div className="px-6 mt-8">
                      <div className="glass-panel rounded-[32px] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-3 font-black">
                           <span className="text-[10px] text-slate-400 uppercase tracking-[2px]">Progress Tabungan</span>
                           <div className="flex items-center gap-2">
                             <span className="text-indigo-400">{Math.min(Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100), 100)}%</span>
                             {selectedGoal.currentAmount >= selectedGoal.targetAmount && (
                               <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Lunas! 🚀</span>
                             )}
                           </div>
                        </div>
                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-8">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100)}%` }} 
                            className="h-full bg-gradient-to-r from-[#818cf8] to-[#c084fc]"
                          ></motion.div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           {[10000, 50000, 100000].map(amt => (
                             <button 
                               key={amt}
                               onClick={() => handleDeposit(selectedGoal.id, amt)} 
                               className="bg-indigo-600/10 border border-indigo-500/20 py-4 rounded-2xl text-center active:scale-95 transition-all"
                             >
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{amt/1000}k</p>
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoggedIn && activeScreen === 'history' && (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full overflow-y-auto pb-24 scrollbar-hide px-6 pt-12"
                >
                  <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl z-10 py-2 border-b border-white/5">
                      <button onClick={() => setActiveScreen('home')} className="p-2.5 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
                      <h2 className="text-xl font-black tracking-tight">Riwayat</h2>
                   </div>
                   <div className="flex flex-col gap-6">
                      {transactions.length === 0 ? (
                        <div className="text-center py-24">
                           <div className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-700">
                              <HistoryIcon size={32} />
                           </div>
                           <p className="text-slate-500 font-bold text-sm">Belum ada transaksi</p>
                           <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest mt-1">Mulai menabung sekarang!</p>
                        </div>
                      ) : (
                        transactions.map(tx => (
                          <div key={tx.id} className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center glass-panel ${tx.type === 'setor' ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'}`}>
                              {tx.type === 'setor' ? <ArrowDownRight size={20}/> : <ArrowUpRight size={20}/>}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-white">{tx.title}</h4>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{tx.goalName}</p>
                            </div>
                            <div className={`font-black text-sm ${tx.type === 'setor' ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.type === 'setor' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </motion.div>
              )}

              {isLoggedIn && activeScreen === 'account' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="h-full overflow-y-auto pb-24 scrollbar-hide px-6 pt-12"
                >
                  <AnimatePresence mode="wait">
                    {!accountSubScreen ? (
                      <motion.div
                        key="account-main"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                      >
                        <div className="flex flex-col items-center mb-10">
                          <div className="relative mb-6">
                            <div className="w-28 h-28 rounded-[40px] border-4 border-indigo-500/30 overflow-hidden shadow-2xl relative z-10 flex items-center justify-center bg-white/5">
                              {userPhoto ? (
                                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User size={48} className="text-slate-600" />
                              )}
                            </div>
                            <button onClick={() => setAccountSubScreen('edit_profile')} className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white border-4 border-[#0f172a] z-20">
                               <Plus size={20} />
                            </button>
                            <div className="absolute inset-0 mesh-bg opacity-30 blur-2xl -z-0 scale-150"></div>
                          </div>
                          <h2 className="text-2xl font-black text-white mb-1">{userName}</h2>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-[2px]">Tingkat Pemula</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                          <div className="glass-panel p-4 rounded-3xl text-center">
                             <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Tujuan Aktif</p>
                             <p className="text-lg font-black text-white">{goals.length}</p>
                          </div>
                          <div className="glass-panel p-4 rounded-3xl text-center">
                             <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Progress Total</p>
                             <p className="text-lg font-black text-indigo-400">{totalBalance > 0 ? Math.round((totalBalance / 21000000) * 100) : 0}%</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {[
                            { icon: User, label: 'Edit Profil', color: 'text-blue-400', sub: 'edit_profile' },
                            { icon: Shield, label: 'Keamanan', color: 'text-emerald-400', sub: 'security' },
                            { icon: Bell, label: 'Notifikasi', color: 'text-purple-400', sub: 'notifications' },
                          ].map((item, i) => (
                            <button key={i} onClick={() => item.sub && setAccountSubScreen(item.sub)} className="w-full glass-panel p-5 rounded-[28px] flex items-center justify-between group hover:bg-white/10 active:scale-[0.98] transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${item.color}`}><item.icon size={20} /></div>
                                 <span className="font-bold text-sm text-slate-200">{item.label}</span>
                              </div>
                              <ChevronLeft size={16} className="text-slate-600 transform rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                          ))}
                          <button onClick={() => { setIsLoggedIn(false); setActiveScreen('login'); }} className="w-full mt-4 glass-panel p-5 rounded-[28px] flex items-center justify-center gap-3 text-red-400 border-red-500/20 hover:bg-red-500/10 active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                             <Plus size={18} className="rotate-45" /><span>Keluar Akun</span>
                          </button>
                        </div>
                        <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-[4px] mt-12 mb-4">Dabung v2.4.0</p>
                      </motion.div>
                    ) : accountSubScreen === 'edit_profile' ? (
                      <motion.div
                        key="edit-profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <button onClick={() => setAccountSubScreen(null)} className="p-2 bg-white/5 rounded-xl border border-white/10"><ChevronLeft size={20}/></button>
                          <h2 className="text-xl font-black">Edit Profil</h2>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="flex flex-col items-center mb-8">
                              <div className="w-24 h-24 rounded-[32px] border-2 border-indigo-500/30 overflow-hidden mb-4 flex items-center justify-center bg-white/10">
                                {userPhoto ? (
                                  <img src={userPhoto} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={40} className="text-slate-500" />
                                )}
                              </div>
                              <button onClick={() => document.getElementById('profile-file-input')?.click()} className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Ganti Foto</button>
                              <input 
                                id="profile-file-input"
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setUserPhoto(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                           </div>

                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                              <input 
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                              />
                           </div>

                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Bio</label>
                              <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                                defaultValue="Semangat menabung untuk masa depan cerah! ✨"
                              />
                           </div>

                           <button onClick={() => setAccountSubScreen(null)} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[28px] uppercase tracking-[2px] text-xs">Simpan Perubahan</button>
                        </div>
                      </motion.div>
                    ) : accountSubScreen === 'security' ? (
                      <motion.div
                        key="security"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <button onClick={() => setAccountSubScreen(null)} className="p-2 bg-white/5 rounded-xl border border-white/10"><ChevronLeft size={20}/></button>
                          <h2 className="text-xl font-black">Keamanan</h2>
                        </div>

                        <div className="space-y-4">
                           <div className="glass-panel p-6 rounded-[32px] flex items-center justify-between">
                              <div>
                                 <h4 className="font-bold text-white">PIN Keamanan</h4>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Aktifkan saat buka aplikasi</p>
                              </div>
                              <div className="w-12 h-6 bg-indigo-500 rounded-full relative p-1 cursor-pointer">
                                 <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                              </div>
                           </div>

                           <div className="glass-panel p-6 rounded-[32px]">
                              <h4 className="font-bold text-white mb-4">Ganti Password</h4>
                              <div className="space-y-3">
                                 <input type="password" placeholder="Password Lama" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                 <input type="password" placeholder="Password Baru" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                              </div>
                              <button className="w-full mt-4 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10">Update Password</button>
                           </div>

                           <div className="glass-panel p-6 rounded-[32px] flex items-center justify-between">
                              <div>
                                 <h4 className="font-bold text-white">Biometrik (FaceID/Finger)</h4>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Gunakan sensor biometrik</p>
                              </div>
                              <div className="w-12 h-6 bg-slate-700 rounded-full relative p-1 cursor-pointer">
                                 <div className="w-4 h-4 bg-white rounded-full absolute left-1"></div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    ) : accountSubScreen === 'notifications' ? (
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <button onClick={() => setAccountSubScreen(null)} className="p-2 bg-white/5 rounded-xl border border-white/10"><ChevronLeft size={20}/></button>
                          <h2 className="text-xl font-black">Notifikasi</h2>
                        </div>

                        <div className="space-y-4">
                           {[
                             { title: 'Pengingat Harian', desc: 'Ingatkan untuk menabung setiap pagi' },
                             { title: 'Laporan Transaksi', desc: 'Kirim bukti setor/tarik ke email' },
                             { title: 'Tips Menabung', desc: 'Dapatkan strategi menabung cerdas' },
                             { title: 'Goal Tercapai', desc: 'Rayakan saat target harian terpenuhi' },
                           ].map((notif, i) => (
                             <div key={i} className="glass-panel p-6 rounded-[32px] flex items-center justify-between">
                                <div className="flex-1 pr-4">
                                   <h4 className="font-bold text-white">{notif.title}</h4>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{notif.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${i % 2 === 0 ? 'right-1' : 'left-1'}`}></div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )}

              {isLoggedIn && activeScreen === 'withdraw' && (
                <motion.div 
                  key="withdraw"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-full overflow-y-auto pb-32 scrollbar-hide px-6 pt-12"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setActiveScreen('home')} className="p-2 bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
                    <h2 className="text-xl font-black">Tarik Saldo</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Pilih Tujuan Penarikan</label>
                      <div className="flex flex-col gap-3">
                        {goals.map(goal => (
                          <button 
                            key={goal.id} 
                            onClick={() => setWithdrawGoalId(goal.id)}
                            className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                              withdrawGoalId === goal.id 
                              ? 'bg-indigo-500/20 border-indigo-500/50' 
                              : 'bg-white/5 border-white/10 grayscale opacity-60'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                              <img src={goal.imageUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-bold text-sm">{goal.title}</p>
                              <p className="text-[10px] text-indigo-400 font-bold">{formatCurrency(goal.currentAmount)}</p>
                            </div>
                            {withdrawGoalId === goal.id && <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><Plus size={12} className="rotate-45" /></div>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 text-center">Nominal Penarikan</label>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-4">
                           <span className="text-red-400 font-black text-sm">Rp</span>
                           <input 
                             type="text"
                             value={(parseInt(withdrawAmount) || 0).toLocaleString('id-ID')}
                             onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, '');
                               setWithdrawAmount(val);
                             }}
                             className="bg-transparent text-2xl font-black text-white focus:outline-none w-44 text-center"
                           />
                        </div>
                        <div className="flex gap-2 w-full">
                          {[20000, 50000, 100000].map(amt => (
                            <button 
                              key={amt}
                              onClick={() => setWithdrawAmount(amt.toString())}
                              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              {amt/1000}k
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const amount = parseInt(withdrawAmount);
                        if (!amount || amount <= 0) {
                          alert('Masukkan nominal penarikan!');
                          return;
                        }
                        if (withdrawGoalId) {
                          handleWithdraw(withdrawGoalId, amount);
                          setWithdrawAmount('');
                          setActiveScreen('home');
                        }
                      }}
                      className="w-full bg-red-500/20 border border-red-500/20 text-red-400 font-black py-5 rounded-[28px] uppercase tracking-[2px] text-xs active:scale-95 transition-transform"
                    >
                      Konfirmasi Penarikan
                    </button>
                  </div>
                </motion.div>
              )}

              {isLoggedIn && activeScreen === 'add_goal' && (
                <motion.div 
                  key="add_goal"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-full overflow-y-auto pb-24 scrollbar-hide px-6 pt-12"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setActiveScreen('home')} className="p-2 bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
                    <h2 className="text-xl font-black tracking-tight">Tambah Tujuan</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nama Tujuan</label>
                      <input 
                        type="text"
                        placeholder="Beli ....."
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                      />
                    </div>

                    <div className="glass-panel p-6 rounded-3xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Foto Tujuan</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                           {newGoalImage ? (
                             <img src={newGoalImage} className="w-full h-full object-cover" />
                           ) : (
                             <Target size={24} className="text-slate-600" />
                           )}
                           <input 
                             type="file" 
                             accept="image/*"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => {
                                   setNewGoalImage(reader.result as string);
                                 };
                                 reader.readAsDataURL(file);
                               }
                             }}
                             className="absolute inset-0 opacity-0 cursor-pointer"
                           />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 font-bold mb-2">Klik kotak untuk pilih foto</p>
                          <button 
                            onClick={() => document.getElementById('goal-file-input')?.click()}
                            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-indigo-400"
                          >
                             Pilih dari File
                          </button>
                          <input 
                            id="goal-file-input"
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewGoalImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 text-center">Target Nominal</label>
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => {
                            const current = parseInt(newGoalTarget) || 10000;
                            if (current >= 20000) setNewGoalTarget((current - 10000).toString());
                          }}
                          className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 active:scale-90 transition-all hover:bg-white/10"
                        >
                          <Minus size={20} />
                        </button>
                        
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                             <span className="text-indigo-400 font-black text-sm">Rp</span>
                             <input 
                               type="text"
                               value={(parseInt(newGoalTarget) || 0).toLocaleString('id-ID')}
                               onChange={(e) => {
                                 const val = e.target.value.replace(/\D/g, '');
                                 setNewGoalTarget(val);
                               }}
                               className="bg-transparent text-2xl font-black text-white focus:outline-none w-44 text-center"
                             />
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full mt-1"></div>
                        </div>

                        <button 
                          onClick={() => {
                            const current = parseInt(newGoalTarget) || 0;
                            setNewGoalTarget((current + 10000).toString());
                          }}
                          className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 active:scale-90 transition-all hover:bg-white/10"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <p className="mt-4 text-[10px] text-slate-500 font-bold italic tracking-wide text-center uppercase">Min. Rp 10.000 • Kelipatan Tombol 10rb</p>
                    </div>

                    <button 
                      onClick={handleAddGoal}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 rounded-[28px] uppercase tracking-[2px] text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform"
                    >
                      Buat Tujuan Sekarang
                    </button>
                    
                    <p className="text-center text-[10px] text-slate-600 font-bold leading-relaxed px-4 uppercase tracking-[2px]">
                      Semangat Menabung! ✨
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SHARED BOTTOM NAV */}
            {isLoggedIn && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/5 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-2 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
                <button onClick={() => setActiveScreen('home')} className={`flex flex-col items-center gap-1 transition-all ${activeScreen === 'home' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
                  <HomeIcon size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
                </button>
                <button onClick={() => setActiveScreen('goals')} className={`flex flex-col items-center gap-1 transition-all ${activeScreen === 'goals' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
                  <Target size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Tujuan</span>
                </button>
                <div className="relative -top-8">
                  <button onClick={() => setActiveScreen('add_goal')} className={`w-16 h-16 bg-gradient-to-br from-[#818cf8] to-[#c084fc] rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 active:scale-95 transition-transform border border-white/20 ${activeScreen === 'add_goal' ? 'scale-110 ring-4 ring-indigo-500/20' : ''}`}>
                    <Plus size={36} />
                  </button>
                </div>
                <button onClick={() => setActiveScreen('history')} className={`flex flex-col items-center gap-1 transition-all ${activeScreen === 'history' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
                  <HistoryIcon size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">History</span>
                </button>
                <button onClick={() => { setActiveScreen('account'); setAccountSubScreen(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeScreen === 'account' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
                  <User size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Account</span>
                </button>
              </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
}

