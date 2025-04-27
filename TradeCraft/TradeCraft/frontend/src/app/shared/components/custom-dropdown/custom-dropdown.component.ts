import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html'
})
export class CustomDropdownComponent {
  @Input() options: any[] = [];
  @Input() selectedOption: any;
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() filter: boolean = false;
  @Input() showClear: boolean = false;
  @Output() onChange = new EventEmitter<any>();

  handleChange(event: any): void {
    this.onChange.emit(event.value);
  }
}
