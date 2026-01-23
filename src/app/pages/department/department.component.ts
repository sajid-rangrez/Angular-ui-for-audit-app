import { Component } from '@angular/core';
import { GenericCrudComponent, FieldConfig } from '../../shared/generic-crud.component';

@Component({
  standalone: true,
  imports: [GenericCrudComponent],
  template: `<app-generic-crud endpoint="department" title="Departments" [config]="config"></app-generic-crud>`
})
export class DepartmentComponent {
  config: FieldConfig[] = [
    { key: 'name', label: 'Department Name', type: 'text' }
  ];
}