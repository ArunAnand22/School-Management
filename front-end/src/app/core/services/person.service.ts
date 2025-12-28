import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';

export interface Person {
  id?: number;
  regNo: string;
  date: string;
  profileImage?: string;
  nameOfApplicant: string;
  nameOfCourse: string;
  nameOfGuardian: string;
  relationshipWithGuardian: string;
  occupationOfGuardian: string;
  permanentAddress: string;
  mobileNumber: string;
  homeContact: string;
  dateOfBirth: string;
  sex: string;
  maritalStatus: string;
  religion: string;
  religionCategory: string;
  educationalQualification: string;
  email: string;
  applicationNumber: string;
  classTime: string;
  totalCourseFee: number;
  feeDetails: string;
  admittedBy: string;
  remarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private resource = 'persons';

  constructor(private mockDataService: MockDataService) {}

  getAll(): Observable<Person[]> {
    return this.mockDataService.getAll<Person>(this.resource);
  }

  getById(id: number): Observable<Person> {
    return this.mockDataService.getById<Person>(this.resource, id);
  }

  getByRegNo(regNo: string): Observable<Person[]> {
    return this.getAll().pipe(
      map(persons => persons.filter(p => p.regNo === regNo))
    );
  }

  getStudents(): Observable<Person[]> {
    return this.getAll().pipe(
      map(persons => persons.filter(p => p.regNo.startsWith('STU')))
    );
  }

  getTutors(): Observable<Person[]> {
    return this.getAll().pipe(
      map(persons => persons.filter(p => p.regNo.startsWith('TUT')))
    );
  }

  create(person: Person): Observable<Person> {
    return this.mockDataService.create<Person>(this.resource, person);
  }

  update(id: number, person: Partial<Person>): Observable<Person> {
    return this.mockDataService.update<Person>(this.resource, id, person);
  }

  delete(id: number): Observable<void> {
    return this.mockDataService.delete(this.resource, id);
  }
}







