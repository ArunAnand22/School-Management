import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonService, Person } from '../../../core/services/person.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-person-table',
  templateUrl: './person-table.component.html',
  styleUrls: ['./person-table.component.scss']
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

  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private personService: PersonService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    // Detect if it's student or staff from route
    const fullPath = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isStudent = fullPath.includes('student');
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    const observable = this.isStudent 
      ? this.personService.getStudents()
      : this.personService.getTutors();
    
    observable.subscribe({
      next: (data) => {
        this.allPersons = data;
        this.filteredPersons = [...this.allPersons];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Error is handled by interceptor
      }
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
    if (!person.id) return;
    
    if (confirm(`Are you sure you want to delete ${person.nameOfApplicant}?`)) {
      this.personService.delete(person.id).subscribe({
        next: () => {
          this.toasterService.success('Person deleted successfully', 'Success');
          this.loadData(); // Reload data from API
        },
        error: (error) => {
          // Error is handled by interceptor
        }
      });
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

