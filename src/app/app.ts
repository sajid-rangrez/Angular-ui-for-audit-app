import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100 font-sans">
      <aside class="w-64 bg-gray-900 text-white flex flex-col shadow-2xl">
        <div class="p-6 text-2xl font-bold tracking-tight border-b border-gray-800">
          <span class="text-indigo-400">Admin</span>Panel
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <a routerLink="/todos" routerLinkActive="bg-indigo-600 text-white shadow-lg" class="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
            📝 Todos
          </a>
          <a routerLink="/employees" routerLinkActive="bg-indigo-600 text-white shadow-lg" class="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
            👥 Employees
          </a>
          <a routerLink="/departments" routerLinkActive="bg-indigo-600 text-white shadow-lg" class="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
            🏢 Departments
          </a>
          <div class="border-t border-gray-800 my-2"></div>
          <a routerLink="/audits" routerLinkActive="bg-amber-600 text-white shadow-lg" class="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
            🛡️ Audit Logs
          </a>
        </nav>
      </aside>

      <main class="flex-1 overflow-auto p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class App {
  protected readonly title = signal('audit-ui');
}
