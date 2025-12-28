import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface Course {
  id?: number;
  courseCode: string;
  courseName: string;
  description: string;
  duration: number;
  totalFee: number;
  batchId: number;
  batchName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private resource = 'courses';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<Course[]> {
    return this.mockDataService.getAll<Course>(this.resource);
  }

  getById(id: number): Observable<Course> {
    return this.mockDataService.getById<Course>(this.resource, id);
  }

  create(course: Course): Observable<Course> {
    const payload = {
      ...course,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.mockDataService.create<Course>(this.resource, payload);
  }

  update(id: number, course: Partial<Course>): Observable<Course> {
    const payload = {
      ...course,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return this.mockDataService.update<Course>(this.resource, id, payload);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







