import { Component, OnInit } from '@angular/core';
import { RiskService } from '../../core/services/risk.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Portfolio } from '../../core/models/portfolio.model';
import { MessageService } from 'primeng/api';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  providers: [MessageService]
})
export class RiskComponent implements OnInit {
  portfolios: Portfolio[] = [];
  selectedPortfolio: Portfolio | null = null;
  
  loading: boolean = true;
  portfolioLoading: boolean = true;
  riskDataLoading: boolean = true;
  exportLoading: boolean = false;
  
  // Risk Data
  riskMetrics: any = null;
  varConfidenceLevel: number = 95;
  varTimeHorizon: string = 'daily';
  
  // Charts
  sectorExposureData: any;
  sectorExposureOptions: any;
  
  varDistributionData: any;
  varDistributionOptions: any;
  
  concentrationRiskData: any;
  concentrationRiskOptions: any;
  
  riskReturnData: any;
  riskReturnOptions: any;
  
  // Tables
  topRisksData: any[] = [];
  topRisksColumns: any[] = [];
  
  riskBreakdownData: any[] = [];
  riskBreakdownColumns: any[] = [];
  
  constructor(
    private riskService: RiskService,
    private portfolioService: PortfolioService,
    private exportService: ExportService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initChartOptions();
    this.setupTables();
    this.loadPortfolios();
  }

  initChartOptions() {
    // Sector Exposure Pie Chart
    this.sectorExposureOptions = {
      plugins: {
        legend: {
          position: 'right'
        }
      }
    };
    
    // VaR Distribution Chart
    this.varDistributionOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Daily Return (%)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Frequency'
          }
        }
      }
    };
    
    // Concentration Risk Chart
    this.concentrationRiskOptions = {
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Portfolio Weight (%)'
          }
        }
      }
    };
    
    // Risk-Return Chart
    this.riskReturnOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return context.raw.x + '%, ' + context.raw.y + '%';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Risk (Volatility, %)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Return (%)'
          }
        }
      }
    };
  }

  setupTables() {
    // Top Risks Table
    this.topRisksColumns = [
      { field: 'symbol', header: 'Symbol' },
      { field: 'weight', header: 'Weight (%)' },
      { field: 'contribution', header: 'Risk Contribution (%)' },
      { field: 'beta', header: 'Beta' },
      { field: 'var', header: 'VaR (%)' }
    ];
    
    // Risk Breakdown Table
    this.riskBreakdownColumns = [
      { field: 'type', header: 'Risk Type' },
      { field: 'value', header: 'Value' },
      { field: 'contribution', header: 'Contribution (%)' }
    ];
  }

  loadPortfolios() {
    this.portfolioLoading = true;
    
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        this.portfolios = response.content;
        this.portfolioLoading = false;
        
        if (this.portfolios.length > 0) {
          this.selectedPortfolio = this.portfolios[0];
          this.loadRiskData(this.selectedPortfolio.id!);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load portfolios'
        });
        this.portfolioLoading = false;
        this.loading = false;
      }
    });
  }

  onPortfolioChange() {
    if (this.selectedPortfolio) {
      this.loadRiskData(this.selectedPortfolio.id!);
    }
  }

  loadRiskData(portfolioId: number) {
    this.riskDataLoading = true;
    
    this.riskService.getPortfolioRisk(portfolioId).subscribe({
      next: (data) => {
        this.riskMetrics = data;
        this.loadChartData(portfolioId);
        this.loadTableData(portfolioId);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load risk data'
        });
        this.riskDataLoading = false;
        this.loading = false;
      }
    });
  }

  loadChartData(portfolioId: number) {
    // Load Sector Exposure
    this.riskService.getSectorExposure(portfolioId).subscribe({
      next: (data) => {
        this.sectorExposureData = {
          labels: data.map((item: any) => item.sector),
          datasets: [{
            data: data.map((item: any) => item.exposure),
            backgroundColor: [
              '#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', 
              '#EC407A', '#AB47BC', '#5C6BC0', '#29B6F6', '#26A69A'
            ]
          }]
        };
        
        // Load VaR Distribution (example data for now)
        const varLabels = Array.from({length: 21}, (_, i) => ((i - 10) * 0.5).toFixed(1));
        this.varDistributionData = {
          labels: varLabels,
          datasets: [{
            label: 'Return Distribution',
            data: [1, 2, 4, 7, 12, 20, 35, 48, 60, 65, 70, 65, 60, 48, 35, 20, 12, 7, 4, 2, 1],
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            borderWidth: 1
          }]
        };
        
        // Load Concentration Risk
        this.riskService.getConcentrationRisk(portfolioId).subscribe({
          next: (data) => {
            this.concentrationRiskData = {
              labels: data.slice(0, 10).map((item: any) => item.symbol),
              datasets: [{
                label: 'Portfolio Weight',
                data: data.slice(0, 10).map((item: any) => item.weight),
                backgroundColor: '#42A5F5'
              }]
            };
            
            // Risk-Return Scatter Plot (example data for now)
            this.riskReturnData = {
              datasets: [{
                label: 'Assets',
                data: [
                  { x: 15, y: 10 },  // Example: High risk, medium return
                  { x: 6, y: 5 },    // Example: Low risk, low return
                  { x: 10, y: 8 },   // Example: Medium risk, medium return
                  { x: 5, y: 12 },   // Example: Low risk, high return
                  { x: 18, y: 20 },  // Example: High risk, high return
                ],
                backgroundColor: '#FFA726',
                borderColor: '#FB8C00',
                pointRadius: 8,
                pointHoverRadius: 10
              }]
            };
            
            this.riskDataLoading = false;
            this.loading = false;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load concentration risk data'
            });
            this.riskDataLoading = false;
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sector exposure data'
        });
        this.riskDataLoading = false;
        this.loading = false;
      }
    });
  }

  loadTableData(portfolioId: number) {
    // Top Risks data (example data for now)
    this.topRisksData = [
      { symbol: 'AAPL', weight: 12.5, contribution: 15.2, beta: 1.15, var: 2.8 },
      { symbol: 'MSFT', weight: 10.2, contribution: 9.8, beta: 0.95, var: 2.3 },
      { symbol: 'GOOGL', weight: 8.7, contribution: 8.5, beta: 1.05, var: 2.5 },
      { symbol: 'AMZN', weight: 7.6, contribution: 9.2, beta: 1.25, var: 3.1 },
      { symbol: 'TSLA', weight: 6.8, contribution: 12.4, beta: 1.85, var: 4.2 }
    ];
    
    // Risk Breakdown data (example data for now)
    this.riskBreakdownData = [
      { type: 'Market Risk', value: '5.7%', contribution: 65 },
      { type: 'Sector Risk', value: '2.1%', contribution: 24 },
      { type: 'Idiosyncratic Risk', value: '0.9%', contribution: 11 }
    ];
  }

  updateVaRConfidence() {
    if (!this.selectedPortfolio) return;
    
    this.riskService.getValueAtRisk(this.selectedPortfolio.id!, this.varConfidenceLevel).subscribe({
      next: (data) => {
        this.riskMetrics.valueAtRisk = data;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update VaR calculation'
        });
      }
    });
  }

  exportRiskReport(format: 'pdf' | 'excel') {
    if (!this.selectedPortfolio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a portfolio to export'
      });
      return;
    }
    
    this.exportLoading = true;
    
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: `Preparing ${format.toUpperCase()} export`
    });
    
    if (format === 'pdf') {
      this.exportService.exportRiskReportPdf(this.selectedPortfolio.id!).subscribe({
        next: (blob) => {
          this.exportService.downloadAndSaveFile(blob, `risk_report_${this.selectedPortfolio!.name}.pdf`);
          this.messageService.add({
            severity: 'success',
            summary: 'Export',
            detail: 'Risk report exported to PDF successfully'
          });
          this.exportLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to export risk report to PDF'
          });
          this.exportLoading = false;
        }
      });
    } else {
      this.exportService.exportRiskReportExcel(this.selectedPortfolio.id!).subscribe({
        next: (blob) => {
          this.exportService.downloadAndSaveFile(blob, `risk_report_${this.selectedPortfolio!.name}.xlsx`);
          this.messageService.add({
            severity: 'success',
            summary: 'Export',
            detail: 'Risk report exported to Excel successfully'
          });
          this.exportLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to export risk report to Excel'
          });
          this.exportLoading = false;
        }
      });
    }
  }
}
