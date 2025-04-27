import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html'
})
export class ChartComponent implements OnChanges {
  @Input() type: string = 'bar';
  @Input() data: any;
  @Input() options: any;
  @Input() width: string = '100%';
  @Input() height: string = '300px';
  @Input() title: string = '';
  @Input() loading: boolean = false;

  chartData: any;
  chartOptions: any;

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['data'] && !changes['data'].firstChange) || 
        (changes['options'] && !changes['options'].firstChange)) {
      this.initChart();
    }
  }

  ngOnInit() {
    this.initChart();
  }

  private initChart() {
    this.chartData = this.data;
    
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      ...this.options
    };
  }
}
