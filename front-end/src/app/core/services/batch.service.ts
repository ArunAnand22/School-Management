import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface Batch {
  id?: number;
  batchName: string;
  batchCode: string;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private resource = 'batches';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<Batch[]> {
    return this.mockDataService.getAll<Batch>(this.resource);
  }

  getById(id: number): Observable<Batch> {
    return this.mockDataService.getById<Batch>(this.resource, id);
  }

  create(batch: Batch): Observable<Batch> {
    const payload = {
      ...batch,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.mockDataService.create<Batch>(this.resource, payload);
  }

  update(id: number, batch: Partial<Batch>): Observable<Batch> {
    const payload = {
      ...batch,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.mockDataService.update<Batch>(this.resource, id, payload);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







