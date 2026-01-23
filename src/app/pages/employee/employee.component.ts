import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { GenericCrudComponent, FieldConfig } from '../../shared/generic-crud.component';
import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, GenericCrudComponent],
  template: `
    <div *ngIf="configLoaded" class="animate-fade-in">
        <app-generic-crud 
            endpoint="employee" 
            title="Employees" 
            [config]="config">
        </app-generic-crud>
    </div>

    <div *ngIf="!configLoaded" class="flex flex-col items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
        <p class="text-gray-500 font-medium">Loading Departments & Config...</p>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class EmployeeComponent implements OnInit {
  api = inject(ApiService);
  cdr = inject(ChangeDetectorRef); // INJECT THIS
  
  configLoaded = false;

  config: FieldConfig[] = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'role', label: 'Job Role', type: 'text' },
    { key: 'department', label: 'Department', type: 'select', options: [] }
  ];

  ngOnInit() {
    this.api.getAll('department').subscribe({
      next: (depts) => {
        const deptField = this.config.find(f => f.key === 'department');
        if (deptField) {
          deptField.options = depts.map(d => ({ label: d.name, value: d }));
        }
        
        this.configLoaded = true; 
        this.cdr.detectChanges(); // <--- THE FIX: Force UI update immediately
      },
      error: (err) => {
        console.error(err);
        this.configLoaded = true;
        this.cdr.detectChanges(); // <--- Fix here too
      }
    });
  }
}