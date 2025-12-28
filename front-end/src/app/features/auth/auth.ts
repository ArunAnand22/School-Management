import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private mockDataService: MockDataService) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.mockDataService.login(username, password);
  }
}
