import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

export interface Person {
  id: number;
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

@Component({
  selector: 'app-person-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-table.component.html',
  styleUrl: './person-table.component.scss'
})
export class PersonTableComponent implements OnInit {
  @Input() isStudent = true;

  allPersons: Person[] = [];
  filteredPersons: Person[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Detect if it's student or staff from route
    const fullPath = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isStudent = fullPath.includes('student');
    this.loadFakeData();
    this.filteredPersons = [...this.allPersons];
  }

  private loadFakeData(): void {
    if (this.isStudent) {
      this.allPersons = this.generateFakeStudents();
    } else {
      this.allPersons = this.generateFakeTutors();
    }
  }

  private generateFakeStudents(): Person[] {
    const names = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'David Wilson', 
                   'Sarah Brown', 'Robert Taylor', 'Jessica Martinez', 'William Anderson', 'Ashley Thomas',
                   'James Jackson', 'Amanda White', 'Christopher Harris', 'Melissa Martin', 'Daniel Thompson',
                   'Michelle Garcia', 'Matthew Martinez', 'Stephanie Robinson', 'Andrew Clark', 'Nicole Rodriguez'];
    
    const courses = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Physics', 'Chemistry', 'Biology'];
    const relationships = ['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt'];
    const occupations = ['Engineer', 'Doctor', 'Teacher', 'Business', 'Lawyer', 'Accountant', 'Manager'];
    const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist'];
    const categories = ['SC', 'ST', 'Minority', 'OBC', 'Other'];
    const qualifications = ['10th', '12th', 'Graduate', 'Post Graduate'];
    const sexes = ['Male', 'Female', 'Other'];
    const maritalStatuses = ['Single', 'Married'];

    return Array.from({ length: 50 }, (_, i) => {
      const name = names[i % names.length];
      const course = courses[i % courses.length];
      const regNo = `STU${String(i + 1).padStart(4, '0')}`;
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      const dob = new Date(2000 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      
      return {
        id: i + 1,
        regNo,
        date,
        nameOfApplicant: name,
        nameOfCourse: course,
        nameOfGuardian: `${name.split(' ')[0]}'s Guardian`,
        relationshipWithGuardian: relationships[i % relationships.length],
        occupationOfGuardian: occupations[i % occupations.length],
        permanentAddress: `${Math.floor(Math.random() * 1000) + 1} Main Street, City ${i + 1}`,
        mobileNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        homeContact: `8${Math.floor(Math.random() * 900000000) + 100000000}`,
        dateOfBirth: dob,
        sex: sexes[i % sexes.length],
        maritalStatus: maritalStatuses[i % maritalStatuses.length],
        religion: religions[i % religions.length],
        religionCategory: categories[i % categories.length],
        educationalQualification: qualifications[i % qualifications.length],
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        applicationNumber: `APP${String(i + 1).padStart(5, '0')}`,
        classTime: `${String(9 + (i % 8)).padStart(2, '0')}:00`,
        totalCourseFee: Math.floor(Math.random() * 50000) + 10000,
        feeDetails: `Tuition: $${Math.floor(Math.random() * 30000) + 5000}, Lab: $${Math.floor(Math.random() * 10000) + 2000}`,
        admittedBy: `Admin ${String((i % 5) + 1)}`,
        remarks: i % 3 === 0 ? 'Scholarship student' : ''
      };
    });
  }

  private generateFakeTutors(): Person[] {
    const names = ['Dr. Robert Smith', 'Prof. Mary Johnson', 'Dr. James Wilson', 'Prof. Patricia Brown', 
                   'Dr. Michael Davis', 'Prof. Jennifer Martinez', 'Dr. William Anderson', 'Prof. Linda Taylor',
                   'Dr. Richard Thomas', 'Prof. Barbara Jackson', 'Dr. Joseph White', 'Prof. Susan Harris',
                   'Dr. Charles Martin', 'Prof. Jessica Thompson', 'Dr. Thomas Garcia', 'Prof. Sarah Martinez',
                   'Dr. Christopher Robinson', 'Prof. Nancy Clark', 'Dr. Daniel Rodriguez', 'Prof. Lisa Lewis'];
    
    const courses = ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
                     'English Literature', 'History', 'Economics'];
    const relationships = ['Self', 'Spouse', 'Guardian'];
    const occupations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
    const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh'];
    const categories = ['OBC', 'Other', 'Minority'];
    const qualifications = ['PhD', 'Masters', 'Post Graduate', 'Graduate'];
    const sexes = ['Male', 'Female'];
    const maritalStatuses = ['Married', 'Single'];

    return Array.from({ length: 30 }, (_, i) => {
      const name = names[i % names.length];
      const course = courses[i % courses.length];
      const regNo = `TUT${String(i + 1).padStart(4, '0')}`;
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      const dob = new Date(1970 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      
      return {
        id: i + 1,
        regNo,
        date,
        nameOfApplicant: name,
        nameOfCourse: course,
        nameOfGuardian: i % 3 === 0 ? name : `${name.split(' ')[0]}'s Spouse`,
        relationshipWithGuardian: relationships[i % relationships.length],
        occupationOfGuardian: occupations[i % occupations.length],
        permanentAddress: `${Math.floor(Math.random() * 1000) + 1} Faculty Street, City ${i + 1}`,
        mobileNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        homeContact: `8${Math.floor(Math.random() * 900000000) + 100000000}`,
        dateOfBirth: dob,
        sex: sexes[i % sexes.length],
        maritalStatus: maritalStatuses[i % maritalStatuses.length],
        religion: religions[i % religions.length],
        religionCategory: categories[i % categories.length],
        educationalQualification: qualifications[i % qualifications.length],
        email: `${name.toLowerCase().replace(/[.\s]/g, '.')}@university.edu`,
        applicationNumber: `APP${String(i + 1).padStart(5, '0')}`,
        classTime: `${String(8 + (i % 6)).padStart(2, '0')}:00`,
        totalCourseFee: 0, // Tutors don't pay fees
        feeDetails: 'N/A',
        admittedBy: `HR Manager ${String((i % 3) + 1)}`,
        remarks: i % 4 === 0 ? 'Senior faculty member' : ''
      };
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPersons = [...this.allPersons];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredPersons = this.allPersons.filter(person =>
      person.regNo.toLowerCase().includes(query) ||
      person.nameOfApplicant.toLowerCase().includes(query) ||
      person.nameOfCourse.toLowerCase().includes(query) ||
      person.email.toLowerCase().includes(query) ||
      person.mobileNumber.includes(query) ||
      person.applicationNumber.toLowerCase().includes(query) ||
      person.nameOfGuardian.toLowerCase().includes(query)
    );
    this.currentPage = 1;
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredPersons.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedPersons(): Person[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPersons.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPersons.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  downloadCSV(): void {
    const headers = [
      'Reg No', 'Date', 'Name', 'Course', 'Guardian Name', 'Relationship',
      'Occupation', 'Mobile', 'Email', 'DOB', 'Sex', 'Marital Status', 'Religion',
      'Category', 'Qualification', 'Application No', 'Class Time', 'Total Fee', 'Admitted By'
    ];

    const rows = this.filteredPersons.map(person => [
      person.regNo,
      person.date,
      person.nameOfApplicant,
      person.nameOfCourse,
      person.nameOfGuardian,
      person.relationshipWithGuardian,
      person.occupationOfGuardian,
      person.mobileNumber,
      person.email,
      person.dateOfBirth,
      person.sex,
      person.maritalStatus,
      person.religion,
      person.religionCategory,
      person.educationalQualification,
      person.applicationNumber,
      person.classTime,
      person.totalCourseFee,
      person.admittedBy
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.isStudent ? 'students' : 'tutors'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addNew(): void {
    const route = this.isStudent ? '/dashboard/student/add-student' : '/dashboard/staff/add-staff';
    this.router.navigate([route]);
  }

  editPerson(person: Person): void {
    // Navigate to edit form (can be implemented later)
    console.log('Edit person:', person);
  }

  deletePerson(person: Person): void {
    if (confirm(`Are you sure you want to delete ${person.nameOfApplicant}?`)) {
      this.allPersons = this.allPersons.filter(p => p.id !== person.id);
      this.onSearch(); // Refresh filtered list
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

