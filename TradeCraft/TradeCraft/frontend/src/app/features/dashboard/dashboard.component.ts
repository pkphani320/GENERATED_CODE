import { Component, OnInit } from '@angular/core';
import { PortfolioService } from '../../core/services/portfolio.service';
import { TradeService } from '../../core/services/trade.service';
import { RiskService } from '../../core/services/risk.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  loading = true;
  portfolioLoading = true;
  tradeLoading = true;
  riskLoading = true;
  
  portfolioPerformanceData: any;
  recentTradesData: any[] = [];
  recentTradesColumns: any[] = [];
  riskMetricsData: any;
  portfolioSummaryData: any;
  
  // For portfolio performance chart
  portfolioChartData: any;
  portfolioChartOptions: any;
  
  // For risk exposure chart
  riskExposureData: any;
  riskExposureOptions: any;
  
  constructor(
    private portfolioService: PortfolioService,
    private tradeService: TradeService,
    private riskService: RiskService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initCharts();
    this.loadDashboardData();
    this.setupTradeTable();
  }

  initCharts() {
    // Portfolio chart options
    this.portfolioChartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value ($)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    };
    
    // Risk exposure chart options
    this.riskExposureOptions = {
      plugins: {
        legend: {
          position: 'right'
        }
      }
    };
  }

  setupTradeTable() {
    this.recentTradesColumns = [
      { field: 'symbol', header: 'Symbol' },
      { field: 'side', header: 'Side' },
      { field: 'quantity', header: 'Quantity' },
      { field: 'price', header: 'Price ($)' },
      { field: 'totalAmount', header: 'Total ($)' },
      { field: 'status', header: 'Status' },
      { 
        field: 'tradeDate', 
        header: 'Date',
        format: (date: Date) => new Date(date).toLocaleDateString()
      }
    ];
  }

  loadDashboardData() {
    this.loadPortfolioPerformance();
    this.loadRecentTrades();
    this.loadRiskMetrics();
    this.loadPortfolioSummary();
  }

  loadPortfolioPerformance() {
    this.portfolioLoading = true;
    
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      this.portfolioChartData = {
        labels: labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: [15000, 16200, 15800, 16900, 18000, 17500],
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: 'Benchmark',
            data: [15000, 15300, 15600, 15900, 16200, 16500],
            fill: false,
            borderColor: '#FFA726',
            tension: 0.4
          }
        ]
      };
      this.portfolioLoading = false;
    }, 1000);
  }

  loadRecentTrades() {
    this.tradeLoading = true;
    
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      this.recentTradesData = [
        { id: 1, symbol: 'AAPL', side: 'BUY', quantity: 10, price: 150.25, totalAmount: 1502.50, status: 'EXECUTED', tradeDate: new Date('2023-09-15') },
        { id: 2, symbol: 'MSFT', side: 'SELL', quantity: 5, price: 305.75, totalAmount: 1528.75, status: 'SETTLED', tradeDate: new Date('2023-09-14') },
        { id: 3, symbol: 'GOOGL', side: 'BUY', quantity: 3, price: 2750.00, totalAmount: 8250.00, status: 'PENDING', tradeDate: new Date('2023-09-16') },
        { id: 4, symbol: 'AMZN', side: 'BUY', quantity: 2, price: 3450.50, totalAmount: 6901.00, status: 'EXECUTED', tradeDate: new Date('2023-09-15') },
        { id: 5, symbol: 'TSLA', side: 'SELL', quantity: 8, price: 750.25, totalAmount: 6002.00, status: 'SETTLED', tradeDate: new Date('2023-09-13') }
      ];
      this.tradeLoading = false;
    }, 1500);
  }

  loadRiskMetrics() {
    this.riskLoading = true;
    
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      this.riskExposureData = {
        labels: ['Technology', 'Financial', 'Healthcare', 'Consumer', 'Energy', 'Other'],
        datasets: [
          {
            data: [45, 20, 15, 10, 5, 5],
            backgroundColor: [
              '#42A5F5',
              '#66BB6A',
              '#FFA726',
              '#26C6DA',
              '#7E57C2',
              '#EC407A'
            ]
          }
        ]
      };
      
      this.riskMetricsData = {
        valueAtRisk: {
          daily: '3.2%',
          weekly: '7.1%',
          monthly: '12.5%'
        },
        sharpeRatio: 1.35,
        beta: 1.15,
        volatility: '18.7%'
      };
      
      this.riskLoading = false;
    }, 2000);
  }

  loadPortfolioSummary() {
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      this.portfolioSummaryData = {
        totalValue: 245750.00,
        totalCost: 225000.00,
        profitLoss: 20750.00,
        profitLossPercent: '9.22%',
        cashBalance: 30500.00,
        portfolios: 3,
        positions: 15
      };
      
      this.loading = false;
    }, 1800);
  }

  onViewTrade(trade: any) {
    this.messageService.add({
      severity: 'info',
      summary: 'Trade Details',
      detail: `Viewing trade ${trade.id} for ${trade.symbol}`
    });
  }
}
