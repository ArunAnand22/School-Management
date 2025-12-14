import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';

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
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { username, password };
    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, loginData);
  }
}
