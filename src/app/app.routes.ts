import { Routes } from '@angular/router';
import { TodoComponent } from './pages/todo/todo.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { DepartmentComponent } from './pages/department/department.component';
import { AuditComponent } from './pages/audit/audit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'todos', pathMatch: 'full' },
  { path: 'todos', component: TodoComponent },
  { path: 'employees', component: EmployeeComponent },
  { path: 'departments', component: DepartmentComponent },
  { path: 'audits', component: AuditComponent }
];