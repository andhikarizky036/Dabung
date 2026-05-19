export type TransactionType = 'setor' | 'tarik';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  goalName?: string;
  amount: number;
  date: string;
  time: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  imageUrl: string;
  description?: string;
}

export type Screen = 'home' | 'goals' | 'history' | 'account' | 'goal_detail' | 'landing' | 'add_goal' | 'withdraw' | 'login';
