export interface Portfolio {
  id?: number;
  name: string;
  description?: string;
  organizationId: number;
  createdAt?: Date;
  updatedAt?: Date;
  totalValue?: number;
  totalCost?: number;
  profitLoss?: number;
  holdings?: PortfolioHolding[];
}

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
}
