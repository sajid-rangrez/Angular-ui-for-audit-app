import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Audit Logs</h1>
      
      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
        <span class="ml-3 text-gray-500 font-medium">Loading history...</span>
      </div>

      <div *ngIf="!isLoading" class="grid gap-6 animate-fade-in">
        <div *ngFor="let log of logs" class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          
          <div class="bg-gray-50 p-4 border-b flex justify-between items-center">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                [ngClass]="{
                  'bg-green-100 text-green-700': log.action === 'INSERT',
                  'bg-blue-100 text-blue-700': log.action === 'UPDATE',
                  'bg-red-100 text-red-700': log.action === 'DELETE'
                }">
                {{ log.action }}
              </span>
              <span class="font-semibold text-gray-700">{{ log.entityName }}</span>
              <span class="text-gray-400 text-sm font-mono">{{ log.entityId | slice:0:8 }}...</span>
            </div>
            <span class="text-sm text-gray-500">{{ log.timestamp | date:'medium' }}</span>
          </div>

          <div class="p-4" *ngIf="log.auditFields && log.auditFields.length > 0">
            <table class="w-full text-sm">
              <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th class="py-2 text-left w-1/4 pl-2">Table</th>
                  <th class="py-2 text-left w-1/4 pl-2">Column</th>
                  <th class="py-2 text-left w-1/3 text-red-600 bg-red-50/50">Old Value</th>
                  <th class="py-2 text-left w-1/3 text-green-600 bg-green-50/50">New Value</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let auditFields of log.auditFields" class="border-b last:border-0 hover:bg-gray-50">
                  <td class="py-2 font-medium pl-2">{{ auditFields.tableName }}</td>
                  <td class="py-2 font-medium pl-2">{{ auditFields.columnName }}</td>
                  <td class="py-2 text-red-600 break-all bg-red-50/20">{{ auditFields.oldValue }}</td>
                  <td class="py-2 text-green-600 break-all bg-green-50/20">{{ auditFields.newValue }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="p-4 text-gray-400 italic text-sm" *ngIf="!log.auditFields || log.auditFields.length === 0">
            No specific field changes recorded.
          </div>
        </div>

        <div *ngIf="logs.length === 0" class="text-center p-10 text-gray-400">
           No audit history found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AuditComponent implements OnInit {
  api = inject(ApiService);
  cdr = inject(ChangeDetectorRef); // 2. Inject this

  logs: any[] = [];
  isLoading = true; // Start as loading

  ngOnInit() {
    this.api.getAll('audits').subscribe({
      next: (data) => {
        // Sort by newest first
        this.logs = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        this.isLoading = false;
        this.cdr.detectChanges(); // 3. FORCE UPDATE HERE
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges(); // 3. FORCE UPDATE HERE TOO
      }
    });
  }
}