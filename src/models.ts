/***************************************************/
/******************** TYPES ************************/
/***************************************************/

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
}

export let myData: Transaction[] = [];