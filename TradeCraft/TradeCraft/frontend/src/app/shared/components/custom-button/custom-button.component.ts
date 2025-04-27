import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html'
})
export class CustomButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() styleClass: string = 'p-button-primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() tooltip: string = '';
  @Input() tooltipPosition: string = 'top';
  @Output() onClick = new EventEmitter<any>();

  handleClick(event: any): void {
    this.onClick.emit(event);
  }
}
