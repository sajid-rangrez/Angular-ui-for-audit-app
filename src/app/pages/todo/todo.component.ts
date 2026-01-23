import { Component } from '@angular/core';
import { GenericCrudComponent, FieldConfig } from '../../shared/generic-crud.component';

@Component({
  standalone: true,
  imports: [GenericCrudComponent],
  template: `
    <app-generic-crud 
      endpoint="todos" 
      title="Todo Manager" 
      [config]="config">
    </app-generic-crud>
  `
})
export class TodoComponent {
  // Define exactly what columns/fields your Java Entity has
  config: FieldConfig[] = [
    { 
      key: 'task',         // Matches private String task;
      label: 'Task Name', 
      type: 'text' 
    },
    { 
      key: 'completed',    // Matches private boolean completed;
      label: 'Is Done?', 
      type: 'checkbox' 
    }
  ];
}