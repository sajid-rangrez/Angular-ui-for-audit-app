import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  getAll(resource: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${resource}`);
  }

  create(resource: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${resource}`, data);
  }

  update(resource: string, id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${resource}/${id}`, data);
  }

  delete(resource: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${resource}/${id}`);
  }
}