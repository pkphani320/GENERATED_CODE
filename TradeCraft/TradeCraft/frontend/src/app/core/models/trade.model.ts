export interface Trade {
  id?: number;
  portfolioId: number;
  symbol: string;
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
  tradeDate: Date;
  settlementDate?: Date;
  status: 'PENDING' | 'EXECUTED' | 'SETTLED' | 'CANCELED';
  userId: number;
  commission?: number;
  totalAmount: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
