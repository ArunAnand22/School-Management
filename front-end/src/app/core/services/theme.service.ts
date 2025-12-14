import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.getInitialTheme());
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    // Remove all theme classes first
    htmlElement.classList.remove('dark-theme', 'light-theme');
    bodyElement.classList.remove('dark-theme', 'light-theme');
    
    // Add the appropriate theme class
    if (theme === 'dark') {
      htmlElement.classList.add('dark-theme');
      bodyElement.classList.add('dark-theme');
    } else {
      htmlElement.classList.add('light-theme');
      bodyElement.classList.add('light-theme');
    }
  }
}

