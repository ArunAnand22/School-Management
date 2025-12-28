import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private storageKey = 'school_management_data';
  private dataSubject = new BehaviorSubject<any>(null);

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      // Initialize with default data from db.json
      const defaultData = {
        users: [
          {
            id: 1,
            username: 'admin',
            password: 'admin123',
            userId: 'USR0001',
            tutorId: null,
            canLogin: true,
            role: 'admin',
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        organisations: [
          {
            id: 1,
            organisationName: 'ABC School',
            address: '123 Main Street, New York',
            phoneNumber: '9123456789',
            email: 'contact@abcschool.edu',
            website: 'https://www.abcschool.edu',
            location: 'New York, State, Country',
            latitude: 40.7128,
            longitude: -74.0060,
            logo: null,
            header: null,
            footer: null,
            seal: null,
            remarks: 'Premium institution',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15'
          }
        ],
        persons: [],
        batches: [],
        courses: [],
        payments: [],
        receipts: []
      };
      this.saveData(defaultData);
    }
  }

  private getData(): any {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  private saveData(data: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    this.dataSubject.next(data);
  }

  // Generic CRUD operations
  getAll<T>(resource: string): Observable<T[]> {
    const data = this.getData();
    const items = data[resource] || [];
    return of([...items]).pipe(delay(300)); // Simulate network delay
  }

  getById<T>(resource: string, id: number): Observable<T> {
    const data = this.getData();
    const items = data[resource] || [];
    const item = items.find((i: any) => i.id === id);
    if (!item) {
      throw new Error(`${resource} with id ${id} not found`);
    }
    return of({ ...item }).pipe(delay(200));
  }

  create<T>(resource: string, item: T): Observable<T> {
    const data = this.getData();
    if (!data[resource]) {
      data[resource] = [];
    }
    const newItem = {
      ...item,
      id: this.getNextId(data[resource])
    };
    data[resource].push(newItem);
    this.saveData(data);
    return of({ ...newItem }).pipe(delay(300));
  }

  update<T>(resource: string, id: number, updates: Partial<T>): Observable<T> {
    const data = this.getData();
    const items = data[resource] || [];
    const index = items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      throw new Error(`${resource} with id ${id} not found`);
    }
    const updatedItem = {
      ...items[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    items[index] = updatedItem;
    this.saveData(data);
    return of({ ...updatedItem }).pipe(delay(300));
  }

  delete(resource: string, id: number): Observable<void> {
    const data = this.getData();
    const items = data[resource] || [];
    const index = items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      throw new Error(`${resource} with id ${id} not found`);
    }
    items.splice(index, 1);
    this.saveData(data);
    return of(undefined).pipe(delay(200));
  }

  private getNextId(items: any[]): number {
    if (items.length === 0) return 1;
    return Math.max(...items.map(i => i.id || 0)) + 1;
  }

  // Special method for login
  login(username: string, password: string): Observable<any> {
    const data = this.getData();
    const users = data.users || [];
    const user = users.find((u: any) => u.username === username && u.password === password && u.canLogin);
    
    if (user) {
      return of({
        success: true,
        message: 'Login successful',
        token: `mock-token-${user.id}-${Date.now()}`,
        user: {
          id: user.id.toString(),
          username: user.username,
          role: user.role || 'user'
        }
      }).pipe(delay(500));
    } else {
      return of({
        success: false,
        message: 'Invalid username or password'
      }).pipe(delay(500));
    }
  }
}


