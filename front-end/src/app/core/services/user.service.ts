import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface User {
  id?: number;
  username: string;
  password?: string;
  userId: string;
  tutorId?: number | null;
  canLogin: boolean;
  role?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private resource = 'users';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<User[]> {
    return this.mockDataService.getAll<User>(this.resource);
  }

  getById(id: number): Observable<User> {
    return this.mockDataService.getById<User>(this.resource, id);
  }

  create(user: User): Observable<User> {
    const payload = {
      ...user,
      createdAt: new Date().toISOString()
    };
    return this.mockDataService.create<User>(this.resource, payload);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.mockDataService.update<User>(this.resource, id, user);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







