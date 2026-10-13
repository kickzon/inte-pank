export type TransactionType = 'income' | 'expense';
export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  createdAt: string;
}
