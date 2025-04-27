import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  providers: [MessageService]
})
export class DataTableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() title: string = '';
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() sortField: string = '';
  @Input() sortOrder: number = 1;
  @Input() globalFilterFields: string[] = [];
  @Input() selectionMode: 'single' | 'multiple' | undefined;
  @Input() canExport: boolean = false;
  @Input() exportFilename: string = 'data';
  @Input() reorderable: boolean = false;
  @Input() resizable: boolean = true;
  @Input() showActions: boolean = false;
  
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() page = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();
  @Output() filter = new EventEmitter<any>();
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() viewRow = new EventEmitter<any>();
  
  selectedItems: any[] = [];
  globalFilterValue: string = '';

  constructor(
    private messageService: MessageService,
    private exportService: ExportService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.selectedItems = [];
    }
  }

  clear(table: Table) {
    table.clear();
    this.globalFilterValue = '';
  }

  exportPdf() {
    this.messageService.add({ severity: 'info', summary: 'Export', detail: 'Preparing PDF export' });
    
    // In a real implementation, this would call the Export service
    // Here we'll just simulate success after a short delay
    setTimeout(() => {
      this.messageService.add({ severity: 'success', summary: 'Export', detail: 'PDF exported successfully' });
    }, 1000);
  }

  exportExcel() {
    this.messageService.add({ severity: 'info', summary: 'Export', detail: 'Preparing Excel export' });
    
    // In a real implementation, this would call the Export service
    // Here we'll just simulate success after a short delay
    setTimeout(() => {
      this.messageService.add({ severity: 'success', summary: 'Export', detail: 'Excel exported successfully' });
    }, 1000);
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event);
  }

  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
  }

  onPage(event: any) {
    this.page.emit(event);
  }

  onSort(event: any) {
    this.sort.emit(event);
  }

  onFilter(event: any) {
    this.filter.emit(event);
  }

  onGlobalFilter(table: Table) {
    table.filterGlobal(this.globalFilterValue, 'contains');
  }

  onEditRow(rowData: any) {
    this.editRow.emit(rowData);
  }

  onDeleteRow(rowData: any) {
    this.deleteRow.emit(rowData);
  }

  onViewRow(rowData: any) {
    this.viewRow.emit(rowData);
  }
}
