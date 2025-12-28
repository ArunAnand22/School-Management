import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface Receipt {
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
export class ReceiptService {
  private resource = 'receipts';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<Receipt[]> {
    return this.mockDataService.getAll<Receipt>(this.resource);
  }

  getById(id: number): Observable<Receipt> {
    return this.mockDataService.getById<Receipt>(this.resource, id);
  }

  create(receipt: Receipt): Observable<Receipt> {
    const payload = {
      ...receipt,
      createdAt: new Date().toISOString()
    };
    return this.mockDataService.create<Receipt>(this.resource, payload);
  }

  update(id: number, receipt: Partial<Receipt>): Observable<Receipt> {
    return this.mockDataService.update<Receipt>(this.resource, id, receipt);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







