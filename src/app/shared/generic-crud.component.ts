import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { finalize } from 'rxjs/operators'; // Import this!

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'checkbox' | 'date' | 'select'; 
  options?: { label: string, value: any }[];
}

@Component({
  selector: 'app-generic-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 relative"> <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 capitalize">{{ title }}</h1>
        <button [disabled]="isLoading" (click)="openModal()" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
          + Add {{ title }}
        </button>
      </div>

      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
        <span class="ml-3 text-gray-500 font-medium">Loading records...</span>
      </div>

      <div *ngIf="!isLoading" class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 text-gray-600 uppercase text-sm font-semibold">
            <tr>
              <th *ngFor="let col of config" class="p-4 border-b">{{ col.label }}</th>
              <th class="p-4 border-b text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let item of items" class="hover:bg-gray-50 transition">
              <td *ngFor="let col of config" class="p-4 text-gray-700 align-middle">
                <span *ngIf="col.type === 'checkbox'" 
                  class="px-2 py-1 rounded text-xs font-bold"
                  [ngClass]="item[col.key] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                  {{ item[col.key] ? 'Active' : 'Inactive' }}
                </span>
                
                <span *ngIf="col.type === 'select'">
                  {{ item[col.key]?.name || item[col.key]?.id || '-' }}
                </span>

                <span *ngIf="col.type !== 'checkbox' && col.type !== 'select'">
                  {{ item[col.key] }}
                </span>
              </td>
              <td class="p-4 text-right whitespace-nowrap">
                <button (click)="edit(item)" class="text-indigo-600 hover:text-indigo-900 font-medium mr-3">Edit</button>
                <button (click)="delete(item.id || item.recordId)" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
               <td [attr.colspan]="config.length + 1" class="p-8 text-center text-gray-400 italic">
                 No records found. Click "Add" to create one.
               </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
          <h2 class="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
            {{ currentItem.id || currentItem.recordId ? 'Edit' : 'Create' }} {{ title }}
          </h2>
          
          <form (ngSubmit)="save()"> <div class="space-y-4">
              <div *ngFor="let field of config">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
                
                <input *ngIf="field.type === 'text'" [(ngModel)]="currentItem[field.key]" [name]="field.key" 
                       type="text" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                
                <div *ngIf="field.type === 'checkbox'" class="flex items-center h-10">
                  <input type="checkbox" [(ngModel)]="currentItem[field.key]" [name]="field.key"
                         class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300">
                  <span class="ml-2 text-gray-700">Enabled</span>
                </div>

                <select *ngIf="field.type === 'select'" [(ngModel)]="currentItem[field.key]" [name]="field.key"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option [ngValue]="null">Select...</option>
                  <option *ngFor="let opt of field.options" [ngValue]="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mt-8 flex justify-end space-x-3">
              <button type="button" (click)="isModalOpen = false" 
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                Cancel
              </button>
              
              <button type="submit" [disabled]="isSaving"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center">
                <span *ngIf="isSaving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                {{ isSaving ? 'Saving...' : 'Save Record' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class GenericCrudComponent implements OnInit, OnChanges {
  @Input() endpoint!: string;
  @Input() title!: string;
  @Input() config!: FieldConfig[];

  api = inject(ApiService);
  cdr = inject(ChangeDetectorRef); // KEY FIX 1: Manually trigger UI updates

  items: any[] = [];
  isLoading = false;
  isSaving = false;
  isModalOpen = false;
  currentItem: any = {};

  ngOnInit() {
    // Safety check: If endpoint is already set, load immediately
    if (this.endpoint) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // React to changes if the endpoint switches dynamically
    if (changes['endpoint'] && !changes['endpoint'].isFirstChange()) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;
    this.api.getAll(this.endpoint).subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // KEY FIX 3: Force the UI to update NOW
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openModal() {
    this.currentItem = {};
    this.isModalOpen = true;
  }

  edit(item: any) {
    this.currentItem = { ...item };
    
    // Dropdown matching logic
    if(this.currentItem.department && this.config.find(c => c.key === 'department')) {
       const deptConfig = this.config.find(c => c.key === 'department');
       const found = deptConfig?.options?.find(opt => opt.value.id === this.currentItem.department.id);
       if(found) this.currentItem.department = found.value;
    }
    
    this.isModalOpen = true;
  }

  save() {
    // KEY FIX 4: Robust Double-Click Prevention
    if (this.isSaving) return; 
    this.isSaving = true;
    
    // Standardize ID
    const id = this.currentItem.id || this.currentItem.recordId;
    
    const request$ = id 
      ? this.api.update(this.endpoint, id, this.currentItem)
      : this.api.create(this.endpoint, this.currentItem);

    request$
      .pipe(finalize(() => {
         // KEY FIX 5: finalize ensures isSaving is reset whether success OR error
         this.isSaving = false;
         this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.isModalOpen = false;
          this.loadData(); // Refresh list
        },
        error: (err) => {
          console.error(err);
          alert('Failed to save. Please try again.');
        }
      });
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this?')) {
      // UI Optimism: Remove it visually first
      const backup = [...this.items];
      this.items = this.items.filter(i => (i.id || i.recordId) !== id);
      
      this.api.delete(this.endpoint, id).subscribe({
        error: () => {
          this.items = backup; // Revert if failed
          alert('Delete failed');
          this.cdr.detectChanges();
        }
      });
    }
  }
}