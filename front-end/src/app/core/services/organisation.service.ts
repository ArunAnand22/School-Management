import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface Organisation {
  id?: number;
  organisationName: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  logo: string | null;
  header: string | null;
  footer: string | null;
  seal: string | null;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private resource = 'organisations';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<Organisation[]> {
    return this.mockDataService.getAll<Organisation>(this.resource);
  }

  getById(id: number): Observable<Organisation> {
    return this.mockDataService.getById<Organisation>(this.resource, id);
  }

  create(organisation: Organisation): Observable<Organisation> {
    const payload = {
      ...organisation,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.mockDataService.create<Organisation>(this.resource, payload);
  }

  update(id: number, organisation: Partial<Organisation>): Observable<Organisation> {
    const payload = {
      ...organisation,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.mockDataService.update<Organisation>(this.resource, id, payload);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







