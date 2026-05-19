import { SavingsGoal, Transaction } from './types';

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: '1',
    title: 'Dana Liburan ke Bali',
    currentAmount: 3250000,
    targetAmount: 5000000,
    targetDate: '2024-12-30',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Tabungan untuk tiket pesawat, hotel, dan makan-makan di Bali.'
  },
  {
    id: '2',
    title: 'Beli Laptop',
    currentAmount: 2000000,
    targetAmount: 6000000,
    targetDate: '2024-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '3',
    title: 'Dana Darurat',
    currentAmount: 3500000,
    targetAmount: 10000000,
    targetDate: '2025-06-01',
    imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'setor',
    title: 'Setoran',
    goalName: 'Dana Liburan ke Bali',
    amount: 2000000,
    date: '2024-05-20',
    time: '10:30'
  },
  {
    id: 't2',
    type: 'setor',
    title: 'Setoran',
    goalName: 'Beli Laptop',
    amount: 150000,
    date: '2024-05-18',
    time: '09:15'
  },
  {
    id: 't3',
    type: 'tarik',
    title: 'Penarikan',
    goalName: 'Dana Darurat',
    amount: 100000,
    date: '2024-05-15',
    time: '14:20'
  },
  {
    id: 't4',
    type: 'setor',
    title: 'Setoran',
    goalName: 'Dana Darurat',
    amount: 300000,
    date: '2024-05-10',
    time: '11:00'
  },
  {
    id: 't5',
    type: 'setor',
    title: 'Setoran',
    goalName: 'Dana Liburan ke Bali',
    amount: 100000,
    date: '2024-05-05',
    time: '08:45'
  }
];
