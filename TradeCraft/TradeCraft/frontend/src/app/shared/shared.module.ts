import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';

// Custom Components
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { CustomDropdownComponent } from './components/custom-dropdown/custom-dropdown.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { ChartComponent } from './components/chart/chart.component';

@NgModule({
  declarations: [
    CustomButtonComponent,
    CustomDropdownComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    DataTableComponent,
    ChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    SidebarModule,
    MenuModule,
    MenubarModule,
    PanelModule,
    ChartModule,
    FileUploadModule,
    ToolbarModule,
    TabViewModule,
    CalendarModule,
    InputNumberModule,
    CheckboxModule,
    RadioButtonModule,
    TooltipModule,
    ProgressBarModule,
    DividerModule
  ],
  exports: [
    // Modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    SidebarModule,
    MenuModule,
    MenubarModule,
    PanelModule,
    ChartModule,
    FileUploadModule,
    ToolbarModule,
    TabViewModule,
    CalendarModule,
    InputNumberModule,
    CheckboxModule,
    RadioButtonModule,
    TooltipModule,
    ProgressBarModule,
    DividerModule,
    
    // Components
    CustomButtonComponent,
    CustomDropdownComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    DataTableComponent,
    ChartComponent
  ]
})
export class SharedModule { }
