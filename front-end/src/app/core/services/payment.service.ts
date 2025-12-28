import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface Payment {
  id?: number;
  date: string;
  referenceNumber: string;
  transactionType: string;
  amount: number;
  studentId?: number;
  studentName?: string;
  studentRegNo?: string;
  tutorId?: number;
  tutorName?: string;
  tutorRegNo?: string;
  remarks?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private resource = 'payments';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<Payment[]> {
    return this.mockDataService.getAll<Payment>(this.resource);
  }

  getById(id: number): Observable<Payment> {
    return this.mockDataService.getById<Payment>(this.resource, id);
  }

  create(payment: Payment): Observable<Payment> {
    const payload = {
      ...payment,
      createdAt: new Date().toISOString()
    };
    return this.mockDataService.create<Payment>(this.resource, payload);
  }

  update(id: number, payment: Partial<Payment>): Observable<Payment> {
    return this.mockDataService.update<Payment>(this.resource, id, payment);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







