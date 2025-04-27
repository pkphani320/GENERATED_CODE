import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PortfolioService } from '../../core/services/portfolio.service';
import { TradeService } from '../../core/services/trade.service';
import { Portfolio, PortfolioHolding } from '../../core/models/portfolio.model';
import { Trade } from '../../core/models/trade.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  providers: [MessageService, ConfirmationService]
})
export class PortfolioComponent implements OnInit {
  portfolios: Portfolio[] = [];
  selectedPortfolio: Portfolio | null = null;
  portfolioHoldings: PortfolioHolding[] = [];
  trades: Trade[] = [];
  
  portfolioLoading = true;
  holdingsLoading = false;
  tradesLoading = false;
  
  performanceChartData: any;
  performanceChartOptions: any;
  
  portfolioDialog: boolean = false;
  tradeDialog: boolean = false;
  
  portfolioForm: FormGroup;
  tradeForm: FormGroup;
  
  holdingsColumns: any[] = [];
  tradesColumns: any[] = [];
  
  constructor(
    private portfolioService: PortfolioService,
    private tradeService: TradeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.portfolioForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      organizationId: [null, Validators.required]
    });
    
    this.tradeForm = this.fb.group({
      id: [null],
      portfolioId: [null, Validators.required],
      symbol: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      side: ['BUY', Validators.required],
      tradeDate: [new Date(), Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.setupHoldingsTable();
    this.setupTradesTable();
    this.initCharts();
    this.loadPortfolios();
  }

  setupHoldingsTable() {
    this.holdingsColumns = [
      { field: 'symbol', header: 'Symbol' },
      { field: 'quantity', header: 'Quantity' },
      { field: 'averageCost', header: 'Avg. Cost ($)' },
      { field: 'currentPrice', header: 'Current Price ($)' },
      { field: 'marketValue', header: 'Market Value ($)' },
      { field: 'profitLoss', header: 'P&L ($)' },
      { field: 'profitLossPercent', header: 'P&L (%)' }
    ];
  }

  setupTradesTable() {
    this.tradesColumns = [
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

  initCharts() {
    this.performanceChartOptions = {
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
  }

  loadPortfolios() {
    this.portfolioLoading = true;
    
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      this.portfolios = [
        { id: 1, name: 'Growth Portfolio', description: 'High growth stocks', organizationId: 1, totalValue: 125000, totalCost: 110000, profitLoss: 15000 },
        { id: 2, name: 'Income Portfolio', description: 'Dividend stocks', organizationId: 1, totalValue: 85000, totalCost: 80000, profitLoss: 5000 },
        { id: 3, name: 'Tech Stocks', description: 'Technology sector', organizationId: 1, totalValue: 35750, totalCost: 35000, profitLoss: 750 }
      ];
      
      this.portfolioLoading = false;
    }, 1000);
  }

  onPortfolioSelect(portfolio: Portfolio) {
    this.selectedPortfolio = portfolio;
    this.loadPortfolioHoldings(portfolio.id!);
    this.loadPortfolioTrades(portfolio.id!);
    this.loadPortfolioPerformance(portfolio.id!);
  }

  loadPortfolioHoldings(portfolioId: number) {
    this.holdingsLoading = true;
    
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      this.portfolioHoldings = [
        { symbol: 'AAPL', quantity: 50, averageCost: 145.75, currentPrice: 152.50, marketValue: 7625, profitLoss: 337.5, profitLossPercent: 4.63 },
        { symbol: 'MSFT', quantity: 30, averageCost: 290.25, currentPrice: 305.75, marketValue: 9172.5, profitLoss: 465, profitLossPercent: 5.34 },
        { symbol: 'GOOGL', quantity: 10, averageCost: 2700.00, currentPrice: 2750.00, marketValue: 27500, profitLoss: 500, profitLossPercent: 1.85 },
        { symbol: 'AMZN', quantity: 15, averageCost: 3300.00, currentPrice: 3450.50, marketValue: 51757.5, profitLoss: 2257.5, profitLossPercent: 4.56 },
        { symbol: 'TSLA', quantity: 25, averageCost: 700.50, currentPrice: 750.25, marketValue: 18756.25, profitLoss: 1243.75, profitLossPercent: 7.10 }
      ];
      
      this.holdingsLoading = false;
    }, 1000);
  }

  loadPortfolioTrades(portfolioId: number) {
    this.tradesLoading = true;
    
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      this.trades = [
        { id: 1, portfolioId: portfolioId, symbol: 'AAPL', quantity: 10, price: 150.25, side: 'BUY', tradeDate: new Date('2023-09-15'), status: 'EXECUTED', userId: 1, totalAmount: 1502.50 },
        { id: 2, portfolioId: portfolioId, symbol: 'MSFT', quantity: 5, price: 305.75, side: 'SELL', tradeDate: new Date('2023-09-14'), status: 'SETTLED', userId: 1, totalAmount: 1528.75 },
        { id: 3, portfolioId: portfolioId, symbol: 'GOOGL', quantity: 3, price: 2750.00, side: 'BUY', tradeDate: new Date('2023-09-16'), status: 'PENDING', userId: 1, totalAmount: 8250.00 },
        { id: 4, portfolioId: portfolioId, symbol: 'AMZN', quantity: 2, price: 3450.50, side: 'BUY', tradeDate: new Date('2023-09-15'), status: 'EXECUTED', userId: 1, totalAmount: 6901.00 },
        { id: 5, portfolioId: portfolioId, symbol: 'TSLA', quantity: 8, price: 750.25, side: 'SELL', tradeDate: new Date('2023-09-13'), status: 'SETTLED', userId: 1, totalAmount: 6002.00 }
      ];
      
      this.tradesLoading = false;
    }, 1500);
  }

  loadPortfolioPerformance(portfolioId: number) {
    // Sample data for demo - in a real app, this would come from the API
    setTimeout(() => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      this.performanceChartData = {
        labels: labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: [110000, 112500, 109800, 118000, 123000, 125000],
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: 'Benchmark',
            data: [110000, 111000, 112500, 114000, 115500, 117000],
            fill: false,
            borderColor: '#FFA726',
            tension: 0.4
          }
        ]
      };
    }, 1200);
  }

  openNewPortfolioDialog() {
    this.portfolioForm.reset({
      organizationId: 1 // Default organization - in a real app, get from current user
    });
    this.portfolioDialog = true;
  }

  openNewTradeDialog() {
    this.tradeForm.reset({
      portfolioId: this.selectedPortfolio?.id,
      side: 'BUY',
      tradeDate: new Date()
    });
    this.tradeDialog = true;
  }

  calculateTotalAmount() {
    const quantity = this.tradeForm.get('quantity')?.value;
    const price = this.tradeForm.get('price')?.value;
    return quantity && price ? quantity * price : 0;
  }

  savePortfolio() {
    if (this.portfolioForm.invalid) {
      Object.keys(this.portfolioForm.controls).forEach(key => {
        this.portfolioForm.get(key)?.markAsDirty();
      });
      return;
    }
    
    const portfolio = this.portfolioForm.value;
    
    // Sample implementation - in a real app, call the service
    if (portfolio.id) {
      // Update existing portfolio
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Portfolio updated successfully'
      });
    } else {
      // Create new portfolio
      // Add the new portfolio to the list
      portfolio.id = this.portfolios.length + 1;
      portfolio.totalValue = 0;
      portfolio.totalCost = 0;
      portfolio.profitLoss = 0;
      this.portfolios.push(portfolio);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Portfolio created successfully'
      });
    }
    
    this.portfolioDialog = false;
  }

  saveTrade() {
    if (this.tradeForm.invalid) {
      Object.keys(this.tradeForm.controls).forEach(key => {
        this.tradeForm.get(key)?.markAsDirty();
      });
      return;
    }
    
    const trade = this.tradeForm.value;
    trade.status = 'PENDING';
    trade.userId = 1; // Current user ID - in a real app, get from auth service
    trade.totalAmount = this.calculateTotalAmount();
    
    // Sample implementation - in a real app, call the service
    if (trade.id) {
      // Update existing trade
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Trade updated successfully'
      });
    } else {
      // Create new trade
      // Add the new trade to the list
      trade.id = this.trades.length + 1;
      this.trades.unshift(trade);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Trade created successfully'
      });
    }
    
    this.tradeDialog = false;
  }

  onEditPortfolio(portfolio: Portfolio) {
    this.portfolioForm.setValue({
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description || '',
      organizationId: portfolio.organizationId
    });
    this.portfolioDialog = true;
  }

  onDeletePortfolio(portfolio: Portfolio) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete portfolio "${portfolio.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Sample implementation - in a real app, call the service
        this.portfolios = this.portfolios.filter(p => p.id !== portfolio.id);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Portfolio deleted successfully'
        });
        
        if (this.selectedPortfolio?.id === portfolio.id) {
          this.selectedPortfolio = null;
          this.portfolioHoldings = [];
          this.trades = [];
        }
      }
    });
  }

  onViewTrade(trade: Trade) {
    this.messageService.add({
      severity: 'info',
      summary: 'Trade Details',
      detail: `Viewing trade ${trade.id} for ${trade.symbol}`
    });
  }

  onEditTrade(trade: Trade) {
    this.tradeForm.setValue({
      id: trade.id,
      portfolioId: trade.portfolioId,
      symbol: trade.symbol,
      quantity: trade.quantity,
      price: trade.price,
      side: trade.side,
      tradeDate: new Date(trade.tradeDate),
      notes: trade.notes || ''
    });
    this.tradeDialog = true;
  }

  onDeleteTrade(trade: Trade) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this trade for ${trade.quantity} ${trade.symbol}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Sample implementation - in a real app, call the service
        this.trades = this.trades.filter(t => t.id !== trade.id);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Trade deleted successfully'
        });
      }
    });
  }

  exportPortfolioPdf() {
    if (!this.selectedPortfolio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a portfolio to export'
      });
      return;
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Preparing PDF export'
    });
    
    // Sample implementation - in a real app, call the export service
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Export',
        detail: 'Portfolio exported to PDF successfully'
      });
    }, 1500);
  }

  exportPortfolioExcel() {
    if (!this.selectedPortfolio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a portfolio to export'
      });
      return;
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Preparing Excel export'
    });
    
    // Sample implementation - in a real app, call the export service
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Export',
        detail: 'Portfolio exported to Excel successfully'
      });
    }, 1500);
  }
}
