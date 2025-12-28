import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course } from '../../../../../core/services/course.service';
import { ToasterService } from '../../../../../core/services/toaster.service';

@Component({
  selector: 'app-course-table',
  templateUrl: './course-table.component.html',
  styleUrls: ['./course-table.component.scss']
})
export class CourseTableComponent implements OnInit {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;

  constructor(
    private router: Router,
    private courseService: CourseService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.courseService.getAll().subscribe({
      next: (data: Course[]) => {
        this.allCourses = data;
        this.filteredCourses = [...this.allCourses];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        // Error is handled by interceptor
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCourses = [...this.allCourses];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredCourses = this.allCourses.filter(course =>
      course.courseName.toLowerCase().includes(query) ||
      course.courseCode.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.batchName.toLowerCase().includes(query)
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

    this.filteredCourses.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCourses.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  downloadCSV(): void {
    const headers = [
      'Course Code', 'Course Name', 'Description', 'Duration (Months)', 'Total Fee', 'Batch', 'Is Active', 'Created At'
    ];

    const rows = this.filteredCourses.map(course => [
      course.courseCode,
      course.courseName,
      course.description,
      course.duration,
      course.totalFee,
      course.batchName,
      course.isActive ? 'Yes' : 'No',
      course.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `courses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addNew(): void {
    this.router.navigate(['/dashboard/staff/course/create']);
  }

  editCourse(course: Course): void {
    this.router.navigate(['/dashboard/staff/course/edit', course.id]);
  }

  deleteCourse(course: Course): void {
    if (!course.id) return;
    
    if (confirm(`Are you sure you want to delete ${course.courseName}?`)) {
      this.courseService.delete(course.id).subscribe({
        next: () => {
          this.toasterService.success('Course deleted successfully', 'Success');
          this.loadData(); // Reload data from API
        },
        error: (error: any) => {
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }
}

